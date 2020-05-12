import React from 'react';
import {withStyles} from '@material-ui/styles';
import {range} from 'lodash';
import clsx from 'clsx';

export const styles = theme => ({
  hash: {
    top: 0,
    position: 'absolute',
    borderLeft: '1px dotted #aaa',
    boxSizing: 'border-box',
    pointerEvents: 'none',
    height: '100%',
  },
});

function TimeMarks(props) {
  const {
    left,
    width,
    top,
    height,
    labelMarks,
    timeToPx,
    timePerPx,
    timespan,
    classes,
    className,
  } = props;

  const markStep = labelMarks(timePerPx)[0];
  const startTime = Math.floor(timespan[0] / markStep) * markStep
  const pxStart = timeToPx(startTime);
  const pxWidth = markStep / timePerPx;
  const pxEnd = pxStart + width + pxWidth;
  return range(pxStart, pxEnd, pxWidth).map((bleft,idx) => (
    <div
      key={idx}
      className={clsx(classes.hash, className)}
      style={{left: left + bleft, width: pxWidth, top, height}}
    />
  ));
}

export default withStyles(styles, {name: 'CrkTimeMarks' })(TimeMarks);

