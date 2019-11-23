import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

import Context from './Context';
import {LeftResizable,RightResizable} from './Draggable';
import getOrderedOffsets from './getOrderedOffsets';

const useStyles = makeStyles({
  category: {
    position: 'absolute',
    borderTop: '1px solid red',
    boxSizing: 'border-box',
    paddingLeft: '10px',
  },
  handle: {
    boxSizing: 'border-box',
    position: 'absolute',
    top: 0,
    border: '1px solid green',
  },
});

export function Sidebar({categoryInfo, initialSidebarWidth, isLeft}) {

  const {
    categoryOrder,
    categoryHeights,
    leftSidebarWidthPx, setLeftSidebarWidthPx,
    rightSidebarWidthPx, setRightSidebarWidthPx,
    headerHeightPx, footerHeightPx,
    containerWidthPx,
    timeStart,
    setTimeStart,
    timePerPx,
  } = React.useContext(Context);

  const Resizable = isLeft ? RightResizable : LeftResizable;
  const sidebarWidthPx = isLeft ? leftSidebarWidthPx : rightSidebarWidthPx;
  const otherWidthPx = !isLeft ? leftSidebarWidthPx : rightSidebarWidthPx;
  const setSidebarWidthPx = isLeft ? setLeftSidebarWidthPx : setRightSidebarWidthPx;
  const resizeStyle = isLeft ? {left: sidebarWidthPx-7} : {right: sidebarWidthPx-7};
  const sideStyle = isLeft ? {left: 0} : {right: 0};
  if (sidebarWidthPx === 0)
    setSidebarWidthPx(initialSidebarWidth);

  const offsets = getOrderedOffsets(categoryOrder, categoryHeights);
  const fullHeight = headerHeightPx + offsets[offsets.length-1];

  const onResize = widthPx => {
    const newSideWidth = Math.min(widthPx, containerWidthPx - otherWidthPx);
    setSidebarWidthPx(newSideWidth);
    if (isLeft) {
      const newTime = timeStart - (sidebarWidthPx - newSideWidth) * timePerPx;
      setTimeStart(newTime);
    }
  };
  const classes = useStyles();
  return (<>
    {
      categoryOrder.map((categoryId,idx) => (
        <div
          key={categoryId}
          className={classes.category}
          style={{
            ...sideStyle,
            top: headerHeightPx + offsets[idx] + 'px',
            height: categoryHeights[categoryId] + 'px',
            width: sidebarWidthPx-7
          }}
        >
          {categoryId}
        </div>
      ))
    }
    <div
      className={classes.handle}
      style={{...resizeStyle, width: 5, height: fullHeight+'px'}}
    >
      <Resizable size={sidebarWidthPx} minSize={100} onResize={onResize} />
    </div>
  </>);
}

export function LeftSidebar({categoryInfo, initialSidebarWidth=150}) {
  return (
    <Sidebar
      categoryInfo={categoryInfo}
      initialSidebarWidth={initialSidebarWidth}
      isLeft
    />
  );
}

export function RightSidebar({categoryInfo, initialSidebarWidth=150}) {
  return (
    <Sidebar
      categoryInfo={categoryInfo}
      initialSidebarWidth={initialSidebarWidth}
      isLeft={false}
    />
  );
}
