import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import {map,reduce} from 'lodash';

import Context from './Context';
import {RightResizable} from './Draggable';

const useStyles = makeStyles({
  category: {
    position: 'absolute',
    borderBottom: '1px solid red',
    left: 0,
    contentBox: 'border-box',
  },
  handle: {
    contentBox: 'border-box',
    position: 'absolute',
    top: 0,
    border: '1px solid green',
  },
});

export default function Sidebar({categoryInfo, initialSidebarWidth=150}) {

  const {
    categoryOrder,
    categoryLevels,
    sidebarWidthPx, setSidebarWidthPx,
    containerWidthPx,
    timeStart,
    setTimeStart,
    timePerPx,
  } = React.useContext(Context);

  if (sidebarWidthPx === 0)
    setSidebarWidthPx(initialSidebarWidth);

  const offsets = reduce(map(categoryOrder, categoryId => categoryLevels[categoryId]),
    (res,lvl) => res.concat(res[res.length-1] + lvl), [0]
  );
  const fullHeight = offsets[offsets.length-1] * 30 + 'px';

  const onResize = widthPx => {
    const newSideWidth = Math.min(widthPx, containerWidthPx);
    const newTime = timeStart - (sidebarWidthPx - newSideWidth) * timePerPx;
    setSidebarWidthPx(newSideWidth);
    setTimeStart(newTime);
  };
  const classes = useStyles();
  return (<>
    {
      categoryOrder.map((categoryId,idx) => (
        <div
          key={categoryId}
          className={classes.category}
          style={{
            top: 30 * offsets[idx] + 'px',
            height: 30 * categoryLevels[categoryId] + 'px',
            width: sidebarWidthPx
          }}
        >
          {categoryId}
        </div>
      ))
    }
    <div
      className={classes.handle}
      style={{left: sidebarWidthPx-7, width: 5, height: fullHeight}}
    >
      <RightResizable size={sidebarWidthPx} minSize={100} onResize={onResize} />
    </div>
  </>);
}


