import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import {map,reduce} from 'lodash';

import Context from './Context';
import {RightResizable} from './Draggable';

const useStyles = makeStyles({
  row: {
    position: 'absolute',
    borderBottom: '1px solid red',
    left: 0,
  },
  handle: {
    position: 'absolute',
    top: 0,
    height: '100%',
    border: '1px solid green',
  },
});

export default function Sidebar({rowInfo, initialSidebarWidth=150}) {

  const {
    rowOrder,
    rowLevels,
    sidebarWidthPx, setSidebarWidthPx,
    containerWidthPx,
    timespan,
    setTimespan,
  } = React.useContext(Context);

  if (sidebarWidthPx === 0)
    setSidebarWidthPx(initialSidebarWidth);

  const offsets = reduce(map(rowOrder, rowId => rowLevels[rowId]),
    (res,lvl) => res.concat(res[res.length-1] + lvl), [0]
  );

  const timePerPx = (timespan[1] - timespan[0]) / (containerWidthPx - sidebarWidthPx);
  const onResize = widthPx => {
    const newSideWidth = Math.min(widthPx, containerWidthPx);
    const newTimeWidth = containerWidthPx - newSideWidth;
    const newTime = timespan[1] - timePerPx * newTimeWidth;
    setSidebarWidthPx(newSideWidth);
    setTimespan([newTime, timespan[1]]);
  };
  const classes = useStyles();
  return (<>
    {
      rowOrder.map((rowId,idx) => (
        <div
          key={rowId}
          className={classes.row}
          style={{
            top: 30 * offsets[idx] + 'px',
            height: 30 * rowLevels[rowId] + 'px',
            width: sidebarWidthPx
          }}
        >
          {rowId}
        </div>
      ))
    }
    <div
      className={classes.handle}
      style={{left: sidebarWidthPx-7, width: 5}}
    >
      <RightResizable size={sidebarWidthPx} minSize={100} onResize={onResize} />
    </div>
  </>);
}


