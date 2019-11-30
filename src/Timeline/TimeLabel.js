import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

import {range} from 'lodash';

import Context from './Context';

const useStyles = makeStyles({
  labelContainer: {
    position: 'absolute',
    overflow: 'hidden',
    border: '1px solid blue',
    boxSizing: 'border-box',
  },
  label: {
    position: 'absolute',
    borderRight: '1px solid red',
    boxSizing: 'border-box',
  }
});

export function TimeLabel({style, height, labelMarks}) {
  const classes = useStyles();
  const {
    timespan,
    timePerPx,
    containerWidthPx,
    leftSidebarWidthPx,
    rightSidebarWidthPx,
  } = React.useContext(Context);

  const {markStep, label} = labelMarks(timePerPx);

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
      className={classes.labelContainer}
      style={{
        ...style,
        left: leftSidebarWidthPx,
        width: pxFullWidth,
        height: height+'px'
      }}
    >
    {
      range(stepTimeStart, stepTimeEnd, markStep).map(time => {
        const left = (time - timespan[0]) / timePerPx;
        return (
          <div
            key={time}
            className={classes.label}
            style={{...style, left, height: height+'px', width: pxWidth}}
          >
          {label} {time / markStep}
          </div>
        );
      })
    }
    </div>
  );
}

export function TopTimeLabel({labelMarks}) {
  const {
    headerHeightPx,
    setHeaderHeightPx,
  } = React.useContext(Context);

  const height = 30;
  if (headerHeightPx !== height)
    setHeaderHeightPx(height);

  return <TimeLabel style={{top: 0}} height={height} labelMarks={labelMarks} />;
}

export function BottomTimeLabel({labelMarks}) {
  const {
    footerHeightPx,
    setFooterHeightPx,
  } = React.useContext(Context);

  const height = 30;
  if (footerHeightPx !== height)
    setFooterHeightPx(height);

  return <TimeLabel style={{bottom: 0}} height={height} labelMarks={labelMarks} />;
}

