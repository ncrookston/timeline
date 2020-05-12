import React from 'react';

export default function useTimelineWidths(containerRef, leftSideWidth, rightSideWidth) {
  const [containerWidth, setContainerWidth] = React.useState(null);
  React.useLayoutEffect(() => {
    const obs = new ResizeObserver(objs => {
      const domContWidth = objs[0].contentRect.width;
      setContainerWidth(domContWidth);
    });
    const curRef = containerRef.current;
    obs.observe(curRef);
    return () => obs.unobserve(curRef);
  }, [containerRef,leftSideWidth,rightSideWidth]);

  if (containerWidth === null) {
    return {
      canvasWidth: 0,
      leftWidth: leftSideWidth,
      rightWidth: rightSideWidth
    };
  }

  let leftWidth = Math.min(leftSideWidth, containerWidth);
  let rightWidth = Math.min(rightSideWidth, containerWidth);
  const sumSW = leftSideWidth + rightSideWidth;
  if (sumSW > containerWidth) {
    leftWidth = containerWidth * leftSideWidth / sumSW;
    rightWidth = containerWidth * rightSideWidth / sumSW;
  }
  const canvasWidth = containerWidth - leftWidth - rightWidth;
  return {canvasWidth, leftWidth, rightWidth};
}

