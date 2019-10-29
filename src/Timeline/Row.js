import React from 'react';

import {makeStyles} from '@material-ui/core/styles';

import {cloneDeep,fromPairs,isEqual,reduce,values} from 'lodash';

import Item from './Item';

const useStyles = makeStyles({
  row: {
    left: 0,
    right: 0,
    border: '1px solid red',
    position: 'absolute',
    userDrag: 'none',
    userSelect: 'none',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    height: '100%',
    border: '1px solid green',
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
    cursor: 'col-resize',
  }
});
export default function Row({offset, height, group, data, timespan, groupView, sideWidth, onDragStart}) {
  const resizeRef = React.useRef();
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
      <span
        className={classes.sidebar}
        style={{width: sideWidth}}
      >
        <GroupView
          group={group}
        />
      </span>
      <span
        ref={resizeRef}
        className={classes.handle}
        style={{left: sideWidth, right: sideWidth+5}}
        onMouseDown={evt => { evt.persist(); onDragStart(evt); }}
      />
      <span className={classes.timeline} style={{left: sideWidth+5}}>
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
      </span>
    </div>
  );
}

