import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import clsx from 'clsx';

import Context from './Context';
import {LeftResizable,RightResizable} from './Draggable';
import getOrderedOffsets from './getOrderedOffsets';

export const styles = theme => ({
  category: {
    position: 'absolute',
    boxSizing: 'border-box',
    paddingLeft: '10px',
  },
  handle: {
    boxSizing: 'border-box',
    position: 'absolute',
    top: 0,
    backgroundColor: '#0003',
  },
  category0: {
    backgroundColor: '#eee',
  },
  category1: {
    backgroundColor: '#fff',
  },
});

function SidebarImpl(props) {
  //TODO: Use categoryInfo
  const {
    categoryInfo = null,
    classes,
    className,
    initialSidebarWidth = 150,
    isLeft,
    patternSize = 2,
  } = props;
  const {
    categoryOrder,
    categoryHeights,
    leftSidebarWidthPx, setLeftSidebarWidthPx,
    rightSidebarWidthPx, setRightSidebarWidthPx,
    headerHeightPx, footerHeightPx,
    containerWidthPx,
    timespan,
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
  const fullHeight = headerHeightPx + offsets[offsets.length-1] + footerHeightPx;

  const onResize = widthPx => {
    const newSideWidth = Math.min(widthPx, containerWidthPx - otherWidthPx);
    setSidebarWidthPx(newSideWidth);
    if (isLeft) {
      const newTime = timespan[0] - (sidebarWidthPx - newSideWidth) * timePerPx;
      setTimeStart(newTime);
    }
  };
  return (<>
    {
      categoryOrder.map((categoryId,idx) => {
          console.log(idx)
          return (
        <div
          key={categoryId}
          className={clsx(classes.category, classes[`category${idx%patternSize}`], className)}
          style={{
            ...sideStyle,
            top: headerHeightPx + offsets[idx] + 'px',
            height: categoryHeights[categoryId] + 'px',
            width: sidebarWidthPx-7
          }}
        >
          {categoryId}
        </div>
      )})
    }
    <div
      className={classes.handle}
      style={{...resizeStyle, width: 5, height: fullHeight+'px'}}
    >
      <Resizable size={sidebarWidthPx} minSize={100} onResize={onResize} />
    </div>
  </>);
}
export const Sidebar = withStyles(styles, {name: 'CrkSidebar' })(SidebarImpl);

function LeftSidebarImpl(props) {
  return (
    <Sidebar {...props} isLeft />
  );
}
export const LeftSidebar = withStyles(styles, {name: 'CrkLeftSidebar' })(LeftSidebarImpl);

function RightSidebarImpl(props) {
  return (
    <Sidebar {...props} isLeft={false} />
  );
}
export const RightSidebar = withStyles(styles, {name: 'CrkRightSidebar' })(RightSidebarImpl);
