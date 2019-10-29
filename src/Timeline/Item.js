import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles({
  inner: {
    position: 'absolute',
    //border: '1px solid green',
//    background: `repeating-linear-gradient(
//      45deg,
//      #606dbc,
//      #606dbc 10px,
//      #465298 10px,
//      #465298 20px
//    )`
  },
  button: {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    boxShadow: 'none',
    top: 0,
    minWidth: '1px',
    minHeight: '1px',
    //border: '1px solid red',
  }
});

export default function Item({timespan, data, offset}) {
  const toPct = v => 100 * (v - timespan[0]) / (timespan[1] - timespan[0]);
  const left = toPct(data.span[0]) + '%';
  const width = toPct(data.span[1]) - toPct(data.span[0]) + '%';
  const style = {
    position: 'absolute',
    top: offset,
    left,
    width,
  };
  const classes = useStyles();
  return (
    <div className={classes.inner} style={style}>
      <Button className={classes.button} variant="contained">
        {data.id}
      </Button>
    </div>
  );
}

