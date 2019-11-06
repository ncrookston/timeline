import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import Context from './Context';
import {LeftResizable,RightResizable} from './Draggable';

const useStyles = makeStyles({
  inner: {
    position: 'absolute',
//    border: '1px solid green',
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

export default function Item({data, offset, onUpdate}) {
  const {
    timespan,
    sidebarWidthPx,
    containerWidthPx,
  } = React.useContext(Context);
  const fullWidth = containerWidthPx - sidebarWidthPx;
  const [isSelected, setIsSelected] = React.useState(false);
  const toPx = t => fullWidth * (t - timespan[0]) / (timespan[1] - timespan[0]);
  const toTime = p => p * (timespan[1] - timespan[0]) / fullWidth + timespan[0];
  //TODO: Data accessors (timespan):
  const left = toPx(data.timespan[0]);
  const width = toPx(data.timespan[1]) - left;
  const onResize = (newSizePx,side) => {
    let newSpan = [...data.timespan];
    if (side === 'left')
      newSpan[0] = newSpan[1] - toTime(newSizePx);
    else
      newSpan[1] = newSpan[0] + toTime(newSizePx);
    onUpdate(newSpan, data);
  };
//  const focusButton = button => {
//    button.blur();
//    button.ownerDocument.dispatchEvent(new window.Event('keydown'));
//    button.focus();
//  };
  const onClick = evt => {
    setIsSelected(!isSelected);
    //const button = evt.target.parentElement;
  };
  const style = {
    top: offset,
    left,
    width,
  };
  const rStyle = {
    visibility: isSelected ? 'visible' : 'hidden',
  };
  const classes = useStyles();
  return (
    <div className={classes.inner} style={style}>
      <Button className={classes.button} variant="contained" onClick={onClick}>
        {data.id}
      </Button>
      <div
        style={rStyle}
        className={classes.left}
      >
        <LeftResizable
          size={width}
          minSize={0}
          onResize={newSize => onResize(newSize, 'left')}
        />
      </div>
      <div
        style={rStyle}
        className={classes.right}
      >
        <RightResizable
          size={width}
          minSize={0}
          onResize={newSize => onResize(newSize, 'right')}
        />
      </div>
    </div>
  );
}

