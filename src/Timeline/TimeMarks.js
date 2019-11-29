import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {range} from 'lodash';
import Context from './Context';

const useStyles = makeStyles({
  hash: {
    top: 0,
    position: 'absolute',
    borderRight: '1px solid blue',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  },
});

export default function TimeMarks({labelMarks}) {
  const classes = useStyles();
  const {
    timeStart,
    timePerPx,
    containerWidthPx,
  } = React.useContext(Context);

  const {markStep} = labelMarks(timePerPx);

  const pxStart = (Math.floor(timeStart / markStep) * markStep - timeStart) / timePerPx;
  const pxEnd = pxStart + containerWidthPx;
  const pxWidth = markStep / timePerPx;
  return range(pxStart, pxEnd, pxWidth).map((left,idx) => (
    <div
      key={idx}
      className={classes.hash}
      style={{left, width: pxWidth, height: '100%'}}
    />
  ));
}

