import React from 'react';
import {withStyles} from '@material-ui/core/styles';

import {range} from 'lodash';
import clsx from 'clsx';

import Context from './Context';

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
    height,
    labelMarks,
  } = props;
  const {
    timespan,
    timePerPx,
    containerWidthPx,
    leftSidebarWidthPx,
    rightSidebarWidthPx,
  } = React.useContext(Context);

  const [markStep, getLabel] = labelMarks(timePerPx);

  //Which time block is leftmost?
  const stepTimeStart = Math.floor(timespan[0] / markStep) * markStep;
  const pxFullWidth = containerWidthPx - leftSidebarWidthPx - rightSidebarWidthPx;
  const timeFullWidth = pxFullWidth * timePerPx;
  //Which time block is rightmost?
  const stepTimeEnd = stepTimeStart + (Math.ceil(timeFullWidth / markStep)+1) * markStep;
  //How many pixels wide is each block?
  const pxWidth = markStep / timePerPx;
  return (
    <div
      className={clsx(classes.container, classes[variant])}
      style={{
        left: 0,
        width: containerWidthPx,
        height: height+'px'
      }}
    >
    {
      range(stepTimeStart, stepTimeEnd, markStep).map((time,idx) => {
        const left = (time - timespan[0]) / timePerPx + leftSidebarWidthPx;
        return (
          <div
            key={time}
            className={clsx(classes.label, className)}
            style={{left, height: height+'px', width: pxWidth}}
          >
          {getLabel(time)}
          </div>
        );
      })
    }
      <div
        className={clsx(classes.label, classes.left, className)}
        style={{left: 0, height: height+'px', width: leftSidebarWidthPx}}
      />
      <div
        className={clsx(classes.label, classes.right, className)}
        style={{right: 0, height: height+'px', width: rightSidebarWidthPx}}
      />
    </div>
  );
}

const TimeLabel = withStyles(styles, {name: 'CrkTimeLabel' })(TimeLabelImpl);

function TopTimeLabelImpl(props) {
  const {
    headerHeightPx,
    setHeaderHeightPx,
  } = React.useContext(Context);

  const height = 30;
  if (headerHeightPx !== height)
    setHeaderHeightPx(height);

  return <TimeLabelImpl variant='top' height={height} {...props} />;
}
const TopTimeLabel = withStyles(styles, {name: 'CrkTopTimeLabel' })(TopTimeLabelImpl);
function BottomTimeLabelImpl(props) {
  const {
    footerHeightPx,
    setFooterHeightPx,
  } = React.useContext(Context);

  const height = 30;
  if (footerHeightPx !== height)
    setFooterHeightPx(height);

  return <TimeLabelImpl variant='bottom' height={height} {...props} />;
}
const BottomTimeLabel = withStyles(styles, {name: 'CrkBottomTimeLabel' })(BottomTimeLabelImpl);

export {
  styles,
  TimeLabel,
  TopTimeLabel,
  BottomTimeLabel,
};

