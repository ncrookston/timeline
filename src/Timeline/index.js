import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import {cloneDeep, fromPairs, isEqual, last, mapValues, reduce} from 'lodash';

import getOrderedOffsets from './getOrderedOffsets';
import Context from './Context';

export const styles = theme => ({
  label: {
    boxSizing: 'border-box',
    position: 'relative',
    height: '30px',
  },
  outer: {
    boxSizing: 'border-box',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    //border: '1px solid green',
  },
});

function Timeline(props) {
  const {
    children,
    initialTimespan,//Need a sensible default...
    categoryOrder,
    minTime = null,
    maxTime = null,
    classes,
    className,
  } = props;



  const containerRef = React.useRef();

  const [containerWidthPx, setContainerWidthPx] = React.useState(null);
  const [headerHeightPx, setHeaderHeightPx] = React.useState(0);
  const [footerHeightPx, setFooterHeightPx] = React.useState(0);
  const [categoryHeights, dosetCategoryHeights] = React.useState({
    max: fromPairs(categoryOrder.map(catId => [catId, 1])),
    layers: {}
  });
  const [leftSidebarWidthPx, setLeftSidebarWidthPx] = React.useState(0);
  const [rightSidebarWidthPx, setRightSidebarWidthPx] = React.useState(0);
  const [timeStart, setTimeStart] = React.useState(initialTimespan[0]);
  const [timePerPx, setTimePerPx] = React.useState(initialTimespan[1] - initialTimespan[0]);
  const timespan = [
    timeStart,
    timeStart + timePerPx * (containerWidthPx - leftSidebarWidthPx - rightSidebarWidthPx)
  ];
  const toPx = t => (t - timeStart) / timePerPx;
  const timeToPx = time => Array.isArray(time) ? time.map(toPx) : toPx(time);
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
  }, [containerWidthPx,leftSidebarWidthPx,rightSidebarWidthPx,timePerPx,setTimePerPx]);
  const height = last(getOrderedOffsets(categoryOrder, categoryHeights.max)) + headerHeightPx + footerHeightPx;
  return (
    <div ref={containerRef} className={clsx(classes.outer, className)} style={{height: height+'px'}}>
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

          headerHeightPx,
          setHeaderHeightPx,
          footerHeightPx,
          setFooterHeightPx,

          timespan,
          timeToPx,
          setTimeStart,
          timePerPx,
          setTimePerPx,
          minTime,
          maxTime,
        }}
      >
        {children}
      </Context.Provider>
    </div>
  );
}

Timeline.propTypes = {
  /**
   * (Optional) Labels, Sidebars, and (Required) Canvas
   */
  children: PropTypes.node.isRequired,
  /**
   * Override or extend the styles applied to this component.
   */
  classes: PropTypes.object.isRequired,
  /**
   * Override or extend the styles applied to the outer component.
   */
  className: PropTypes.string,
  /**
   * Set the initial timespan to be viewed
   * TODO: Write a custom validator for a two-element array.
   */
  initialTimespan: PropTypes.array.isRequired,
  /**
   * The display order of the categories in the timeline.
   */
  categoryOrder: PropTypes.array.isRequired,
  /**
   * The minimum displayable timespan duration.
   */
  minTime: PropTypes.number,
  /**
   * The maximum displayable timespan duration.
   */
  maxTime: PropTypes.number.isRequired,
};

export default withStyles(styles, {name: 'CrkTimeline' })(Timeline);

