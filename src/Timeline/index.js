import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import {forOwn, fromPairs, reduce, values} from 'lodash';

import IntervalTree from 'node-interval-tree';

import GroupView from './GroupView';
import Row from './Row';

const useStyles = makeStyles({
  outer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    border: '1px solid blue',
  },
});

function groupData(groups, data) {
  let byGroup = fromPairs(groups.map(g => [
    g.id, {dict: {}, tree: new IntervalTree()}
  ]));
  data.forEach(d => {
    byGroup[d.group].dict[d.id] = d;
  });
  forOwn(byGroup, g => {
    values(g.dict).forEach(d => g.tree.insert(...d.span, d.id));
  });
  return byGroup;
}
function getHeights(byGroup) {
  return values(byGroup).map(g => {
    return Math.max(1, reduce(g.dict, (sum, d) => (
      g.tree.search(...d.span).length
    ), 0));
  });
}

export default function Timeline(
  {
    groups,
    data,
    initialSpan,
    groupView = GroupView,
    initialSideWidth = 150,
  }) {
  const [sidebar,setSidebar] = React.useState({
    sideWidth: initialSideWidth,
    mouseX: null
  });

  React.useEffect(() => {
    const onMouseMove = evt => {
      if (sidebar.mouseX !== null) {
        console.log('mousemove');
        setSidebar(sb => ({
          sideWidth: sb.sideWidth + evt.screenX - sb.mouseX,
          mouseX: evt.screenX
        }));
      }
    };
    const onMouseUp = function _omu(evt) {
      if (sidebar.mouseX !== null) {
        console.log('mouseup', evt.screenX);
        setSidebar(sb => ({...sb, mouseX: null}));
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', _omu);
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [sidebar]);
  const setDragStart = evt => {
    console.log('mousedown', evt.screenX)
    setSidebar(sb => ({...sb, mouseX: evt.screenX}));
  };
  const byGroup = groupData(groups, data);
  const heights = getHeights(byGroup);
  const cumHeights = reduce(heights, (s,h) => {
    s.push(h + (s.length > 0 ? s[s.length - 1] : 0))
    return s;
  }, [0]);
  const classes = useStyles();
  return (
    <div className={classes.outer}>
    {
      groups.map((g,i) => (
        <Row
          key={g.id}
          offset={cumHeights[i]}
          height={heights[i]}
          group={g}
          data={byGroup[g.id]}
          groupView={groupView}
          timespan={initialSpan}
          sideWidth={sidebar.sideWidth}
          onDragStart={setDragStart}
        />
      ))
    }
    </div>
  );
}

