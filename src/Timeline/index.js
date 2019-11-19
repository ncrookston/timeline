import React from 'react';

import {makeStyles} from '@material-ui/core/styles';

import {cloneDeep, fromPairs, isEqual, last, mapValues, reduce} from 'lodash';

import getOrderedOffsets from './getOrderedOffsets';
import Context from './Context';

const useStyles = makeStyles({
  outer: {
    width: '100%',
    position: 'relative',
    //border: '1px solid blue',
  },
});

export default function Timeline({
  initialTimespan,//Need a sensible default...
  categoryOrder,
  children
}) {

  const containerRef = React.useRef();

  const [containerWidthPx, setContainerWidthPx] = React.useState(null);
  const [categoryHeights, dosetCategoryHeights] = React.useState({
    max: fromPairs(categoryOrder.map(catId => [catId, 1])),
    layers: {}
  });
  const [leftSidebarWidthPx, setLeftSidebarWidthPx] = React.useState(0);
  const [rightSidebarWidthPx, setRightSidebarWidthPx] = React.useState(0);
  const [timeStart, setTimeStart] = React.useState(initialTimespan[0]);
  const [timePerPx, setTimePerPx] = React.useState(initialTimespan[1] - initialTimespan[0]);
  const setCategoryHeights = (newLayerId, heightMap) => {
    if (!categoryHeights.layers[newLayerId]
        || !isEqual(categoryHeights.layers[newLayerId], heightMap)) {
      let newHeights = cloneDeep(categoryHeights);
      newHeights.layers[newLayerId] = heightMap;
      //Now, step through all layers and store the largest value for each category
      newHeights.max = reduce(newHeights.layers, (result, layerMap, layerId) => (
        //Return an object with each category and a height greater than or equal
        // to the value in result.
        mapValues(layerMap, (catHeight, catId) => (
          result[catId] ? Math.max(catHeight, result[catId]) : catHeight
        ))
      ), {});
      dosetCategoryHeights(newHeights);
    }
  };
  React.useLayoutEffect(() => {
    const obs = new ResizeObserver(objs => {
      const contWidth = objs[0].contentRect.width;
      const leftSideWidth = Math.min(leftSidebarWidthPx, contWidth);
      const rightSideWidth = Math.min(rightSidebarWidthPx, contWidth);
      const sumSW = leftSideWidth + rightSideWidth;
      if (sumSW > contWidth) {
        setLeftSidebarWidthPx(contWidth * leftSideWidth / sumSW);
        setRightSidebarWidthPx(contWidth * rightSideWidth / sumSW);
      }
      else {
        setLeftSidebarWidthPx(leftSideWidth);
        setRightSidebarWidthPx(rightSideWidth);
      }
      if (containerWidthPx === null) {
        const newTpp = timePerPx / (contWidth - leftSideWidth - rightSideWidth);
        setTimePerPx(newTpp);
      }
      setContainerWidthPx(contWidth);
    });
    const curRef = containerRef.current;
    obs.observe(curRef);
    return () => obs.unobserve(curRef);
  }, [containerWidthPx,leftSidebarWidthPx,rightSidebarWidthPx,timePerPx]);
  const height = last(getOrderedOffsets(categoryOrder, categoryHeights.max));
  const classes = useStyles();
  return (
    <div ref={containerRef} className={classes.outer} style={{height: height+'px'}}>
      <Context.Provider
        value={{
          containerWidthPx,
          categoryHeights: categoryHeights.max,
          setCategoryHeights,
          categoryOrder,
          leftSidebarWidthPx,
          setLeftSidebarWidthPx,
          rightSidebarWidthPx,
          setRightSidebarWidthPx,
          timeStart,
          setTimeStart,
          timePerPx,
          setTimePerPx,
        }}
      >
        {children}
      </Context.Provider>
    </div>
  );
}

