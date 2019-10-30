import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import {LeftResizable,RightResizable} from './Draggable';

const useStyles = makeStyles({
  inner: {
    position: 'absolute',
    //border: '1px solid green',
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
  },
  left: {
    position: 'absolute',
    left: 0,
    width: '3px',
    top: 0,
    height: '100%',
    //border: '1px solid red',
    backgroundColor: '#0002',
  },
  right: {
    position: 'absolute',
    right: 0,
    width: '3px',
    top: 0,
    height: '100%',
    backgroundColor: '#0002',
    //border: '1px solid red',
  },
});

export default function Item({timespan, data, offset, fullWidthPx}) {
  console.log(data)
  const toPx = v => fullWidthPx * (v - timespan[0]) / (timespan[1] - timespan[0]);
  const left = toPx(data.span[0]);
  const width = toPx(data.span[1]) - toPx(data.span[0]);
  const style = {
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
      <div className={classes.left}>
        <LeftResizable
          size={width}
          minSize={0}
          onDrag={nw=>console.log(width,nw)}
        />
      </div>
      <div className={classes.right}>
        <RightResizable
          size={width}
          minSize={0}
          onDrag={nw=>console.log(width,nw)}
        />
      </div>
    </div>
  );
}

