import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles({
  handle: {
    width: '100%',
    height: '100%',
  }
});

export function Draggable({getDim, onStart, onDrag, cursor, onClick=null}) {
  const [mouse, setMouse] = React.useState(null);
  const [didMove, setDidMove] = React.useState(false);

  React.useLayoutEffect(() => {
    const onMouseMove = evt => {
      if (mouse !== null) {
        const diff = getDim(evt) - mouse;
        if (diff * diff > 10)
          setDidMove(true);
        if (didMove)
          onDrag(diff);
      }
    };
    const onMouseUp = evt => {
      if (mouse !== null) {
        if (onClick)
          onClick(getDim(evt));
        setMouse(null);
        setDidMove(false);
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [didMove, getDim, mouse, onClick, onDrag]);

  const classes = useStyles();
  return (
    <div
      className={classes.handle}
      onMouseDown={evt => {
        evt.preventDefault();
        setMouse(getDim(evt));
        setDidMove(false);
        onStart();
      }}
      style={{cursor: cursor}}
    />
  );
}

export function LeftResizable({onResize, size, minSize}) {
  const [savedSize, setSavedSize] = React.useState(size);

  return (
    <Draggable
      getDim={evt => evt.screenX}
      onStart={() => setSavedSize(size)}
      onDrag={change => onResize(Math.max(minSize, savedSize - change))}
      cursor='col-resize'
    />
  );
}

export function RightResizable({onResize, size, minSize}) {
  const [savedSize, setSavedSize] = React.useState(size);

  return (
    <Draggable
      getDim={evt => evt.screenX}
      onStart={() => setSavedSize(size)}
      onDrag={change => {
        onResize(Math.max(minSize, savedSize + change))
      }}
      cursor='col-resize'
    />
  );
}
