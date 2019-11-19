import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {range} from 'lodash';
import Context from './Context';


const useStyles = makeStyles({
  hash: {
    top: 0,
    position: 'absolute',
    border: '1px solid blue',
    boxSizing: 'border-box',
  },
});
export default function TimeMarks({markStep=1}) {
  const classes = useStyles();
  const {
    timeStart,
    timePerPx,
    containerWidthPx,
  } = React.useContext(Context);

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

