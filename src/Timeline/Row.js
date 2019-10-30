import React from 'react';

import {makeStyles} from '@material-ui/core/styles';

import {cloneDeep,fromPairs,isEqual,reduce,values} from 'lodash';

import {RightResizable} from './Draggable';
import Item from './Item';

const useStyles = makeStyles({
  row: {
    position: 'absolute',
    left: 0,
    right: 0,
    userDrag: 'none',
    userSelect: 'none',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    height: '100%',
    overflow: 'hidden',
  },
  timeline: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    userDrag: 'none',
    userSelect: 'none',
  },
  handle: {
    position: 'absolute',
    height: '100%',
  }
});
export default function Row(
  { offset, height, group, data, timespan, groupView, sideWidth, onResizeSidebar }
) {
  const [itemOffsets, setItemOffsets] = React.useState({});
  const [rect, setRect] = React.useState(null);
  const ref = React.useRef(null);
  React.useEffect(() => {
    setRect(ref.current.getBoundingClientRect());
  }, [sideWidth]);
  const newItemOffsets = reduce(values(data.dict), (s, d) => {
    if (!s[d.id]) {
      const ids = fromPairs(data.tree.search(...d.span).map(id => [s[id], true]));
      let i = 1;
      while (ids[i])
        ++i
      s[d.id] = i;
    }
    return s;
  }, cloneDeep(itemOffsets));
  if (!isEqual(newItemOffsets, itemOffsets))
    setItemOffsets(newItemOffsets);
  const rowStyle = {
    top: offset * 30 * height + 'px',
    height: 30 * height + 'px',
  };
  const GroupView = groupView;
  const classes = useStyles();
  return (
    <div className={classes.row} style={rowStyle}>
      <div
        className={classes.sidebar}
        style={{width: sideWidth}}
      >
        <GroupView
          group={group}
        />
      </div>
      <div
        className={classes.handle}
        style={{left: sideWidth, width: 5}}
      >
        <RightResizable size={sideWidth} minSize={100} onDrag={onResizeSidebar} />
      </div>
      <div ref={ref} className={classes.timeline} style={{left: sideWidth+10}}>
      {
        values(data.dict).map(d => (
          <Item
            key={d.id}
            timespan={timespan}
            data={d}
            offset={(newItemOffsets[d.id] - 1) * 30 + 'px'}
            fullWidthPx={rect ? rect.width : 0}
          />
        ))
      }
      </div>
    </div>
  );
}
