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
  const [sideWidth,setSideWidth] = React.useState(initialSideWidth);
  const onResize = changePx => {
    setSideWidth(sb => sb + changePx);
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
          sideWidth={sideWidth}
          onResizeSidebar={onResize}
        />
      ))
    }
    </div>
  );
}

