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
    top: 0,
    position: 'absolute',
    borderRight: '1px solid red',
    boxSizing: 'border-box',
  }
});

export function TopTimeLabel({markStep=1}) {
  const classes = useStyles();
  const {
    timeStart,
    timePerPx,
    containerWidthPx,
    headerHeightPx,
    leftSidebarWidthPx,
    rightSidebarWidthPx,
    setHeaderHeightPx,
  } = React.useContext(Context);

  const height = 30;
  if (headerHeightPx !== height)
    setHeaderHeightPx(height);

  //Which time block is leftmost?
  const stepTimeStart = Math.floor(timeStart / markStep) * markStep;
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
        left: leftSidebarWidthPx,
        width: pxFullWidth,
        height: height+'px'
      }}
    >
    {
      range(stepTimeStart, stepTimeEnd, markStep).map((time) => {
        const left = (time - timeStart) / timePerPx;
        return (
          <div
            key={time}
            className={classes.label}
            style={{left, height: height+'px', width: pxWidth}}
          >
          H{time}
          </div>
        );
      })
    }
    </div>
  );
}

