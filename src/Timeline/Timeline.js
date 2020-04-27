import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import useTimelineWidths from './useTimelineWidths';
export const styles = theme => ({
//  label: {
//    boxSizing: 'border-box',
//    position: 'relative',
//    height: '30px',
//  },
  outer: {
    boxSizing: 'border-box',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    padding: 0,
  },
});

//https://stackoverflow.com/questions/56519255/is-there-a-better-way-to-do-partial-sums-of-array-items-in-javascript
function partialSum(arr) {
  if (arr.length === 0)
    return [];
  let s = [arr[0]];
  for (let i = 1; i < arr.length; ++i) {
    s.push(s[i-1] + arr[i]);
  }
  return s;
}

function Timeline(props) {
  const {
    initialTimespan,//Need a sensible default...
    classes,
    className,
    initialLeftSidebar = 150,
    initialRightSidebar = 0,
    headerHeight = 30,
    footerHeight = 0,
    layers,
  } = props;

  const [timeStart, setTimeStart] = React.useState(initialTimespan[0]);
  const [timePerPx, setTimePerPx] = React.useState(null);
  //These are the desired sidebar widths.
  const [leftSidebar, setLeftSidebar] = React.useState(initialLeftSidebar);
  const [rightSidebar, setRightSidebar] = React.useState(initialRightSidebar);

  const containerRef = React.useRef();

  //Computes canvas width, and adjusts left or right sidebar widths if canvas width
  // too small.
  const {
    canvasWidth,
    leftWidth,//these are the actual sidebar widths
    rightWidth
  } = useTimelineWidths(containerRef, leftSidebar, rightSidebar);

  if (timePerPx === null && canvasWidth != 0) {
    setTimePerPx((initialTimespan[1] - initialTimespan[0]) / canvasWidth);
  }

  const timespan = [
    timeStart,
    timeStart + timePerPx * canvasWidth
  ];

  const toPx = t => (t - timeStart) / (timePerPx !== null ? timePerPx : 1);
  const timeToPx = time => Array.isArray(time) ? time.map(toPx) : toPx(time);
  const toTime = px => timePerPx * px + timeStart;
  const pxToTime = px => Array.isArray(px) ? px.map(toTime) : toTime(px);

  const heights = [headerHeight].concat(layers.map(layer => layer.getHeight())).concat(footerHeight);
  const offsets = [0].concat(partialSum(heights));
  const fullHeight = offsets[offsets.length-1];
  //TODO: Header/footer (if enabled) should be drawn here? It could be added by the user as a layer...
  //TODO: Sidebar resize handles (if enabled) should be drawn here.
  return (
    <div
      ref={containerRef}
      className={clsx(classes.outer, className)}
      style={{height: fullHeight+'px'}}
    >
    {
      layers.map((layer,idx) => layer.render({
        key: idx,
        timespan,
        timeToPx,
        pxToTime,
        height: heights[idx+1],
        offset: [leftWidth, offsets[idx+1]],
      }))
    }
    </div>
  );
}

Timeline.propTypes = {
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
   * The maximum displayable timespan duration.
   */
  initialLeftSidebar: PropTypes.number,
  /**
   * The maximum displayable timespan duration.
   */
  initialRightSidebar: PropTypes.number,
  /**
   * Labels and Canvas including timespan manipulation and markings.
   */
  layers: PropTypes.array.isRequired,
};

export default withStyles(styles, {name: 'CrkTimeline' })(Timeline);

