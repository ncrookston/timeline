import React from 'react';

import {makeStyles} from '@material-ui/core/styles';

import {cloneDeep,fromPairs,isEqual,reduce,values} from 'lodash';

import Draggable from './Draggable';
import Item from './Item';

const useStyles = makeStyles({
  row: {
    left: 0,
    right: 0,
    borderBottom: '1px solid red',
    position: 'absolute',
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
    borderRight: '1px solid green',
  }
});
export default function Row(
  { offset, height, group, data, timespan, groupView, sideWidth, onResizeSidebar }
) {
  const [itemOffsets, setItemOffsets] = React.useState({});
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
        <Draggable onDrag={onResizeSidebar} />
      </div>
      <div className={classes.timeline} style={{left: sideWidth+10}}>
      {
        values(data.dict).map(d => (
          <Item
            key={d.id}
            timespan={timespan}
            data={d}
            offset={(newItemOffsets[d.id] - 1) * 30 + 'px'}
          />
        ))
      }
      </div>
    </div>
  );
}

