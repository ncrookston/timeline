import React from 'react';
import {withStyles} from '@material-ui/styles';
import {range} from 'lodash';
import clsx from 'clsx';
import Context from './Context';

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

function TimeMarks({labelMarks, classes, className}) {
  const {
    timespan,
    timePerPx,
    timeToPx,
    canvasWidthPx,
  } = React.useContext(Context);

  const markStep = labelMarks(timePerPx)[0];

  const pxStart = timeToPx(Math.floor(timespan[0] / markStep) * markStep);
  const pxWidth = markStep / timePerPx;
  const pxEnd = pxStart + canvasWidthPx + pxWidth;
  return range(pxStart, pxEnd, pxWidth).map((left,idx) => (
    <div
      key={idx}
      className={clsx(classes.hash, className)}
      style={{left, width: pxWidth}}
    />
  ));
}

export default withStyles(styles, {name: 'CrkTimeMarks' })(TimeMarks);

