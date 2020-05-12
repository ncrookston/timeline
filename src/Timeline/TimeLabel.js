import React from 'react';
import {withStyles} from '@material-ui/core/styles';

import {range} from 'lodash';
import clsx from 'clsx';

const styles = theme => ({
  container: {
    position: 'absolute',
    overflow: 'hidden',
    boxSizing: 'border-box',
    borderBottom: '1px dotted #000d',
  },
  label: {
    position: 'absolute',
    borderLeft: '1px dotted #000d',
    boxSizing: 'border-box',
    overflow: 'hidden',
    backgroundColor: 'white',
    fontSize: 'x-small',
    textAlign: 'center',
  },
  left: {
    borderRight: '1px dotted #000d',
  },
  right: {
    borderLeft: '1px dotted #000d',
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
});

function TimeLabelImpl(props) {
  const {
    classes,
    className,
    variant,
    labelMarks,
    timePerPx,
    timespan,
    left,
    width,
    height,
  } = props;

  const [markStep, getLabel] = labelMarks(timePerPx);

  //Which time block is leftmost?
  const stepTimeStart = Math.floor(timespan[0] / markStep) * markStep;
  const timeFullWidth = width * timePerPx;
  //Which time block is rightmost?
  const stepTimeEnd = stepTimeStart + (Math.ceil(timeFullWidth / markStep)+1) * markStep;
  //How many pixels wide is each block?
  const pxWidth = markStep / timePerPx;
  return (
    <div
      className={clsx(classes.container, classes[variant])}
      style={{
        left,
        width,
        height: height+1,
      }}
    >
    {
      range(stepTimeStart, stepTimeEnd, markStep).map((time,idx) => {
        const left = (time - timespan[0]) / timePerPx;
        return (
          <div
            key={idx}
            className={clsx(classes.label, className)}
            style={{left, height, width: pxWidth}}
          >
          {getLabel(time)}
          </div>
        );
      })
    }
    </div>
  );
}

export default withStyles(styles, {name: 'CrkTimeLabel' })(TimeLabelImpl);

