import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles({
  handle: {
    width: '100%',
    height: '100%',
  }
});

export function useDraggable({getDim, onStart, onDrag, onClick=null}) {
  const [firstMouse, setFirstMouse] = React.useState(null);
  const [lastMouse, setLastMouse] = React.useState(null);
  const [didMove, setDidMove] = React.useState(false);

  React.useLayoutEffect(() => {
    const onMouseMove = evt => {
      if (firstMouse !== null) {
        evt.preventDefault();
        evt.stopPropagation();
        const diff = getDim(evt) - firstMouse;
        if (diff * diff > 10)
          setDidMove(true);
        if (didMove) {
          onDrag(evt, {offset: diff, delta: getDim(evt) - lastMouse});
          setLastMouse(getDim(evt));
        }
      } };
    const onMouseUp = evt => {
      if (firstMouse !== null) {
        evt.preventDefault();
        evt.stopPropagation();
        if (onClick)
          onClick(getDim(evt));
        setFirstMouse(null);
        setLastMouse(null);
        setDidMove(false);
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [didMove, getDim, firstMouse, lastMouse, onClick, onDrag]);

  return {
    onMouseDown: evt => {
      evt.preventDefault();
      evt.stopPropagation();
      setFirstMouse(getDim(evt));
      setLastMouse(getDim(evt));
      setDidMove(false);
      if (onStart)
        onStart();
    }
  };
}
export function usePanX({onDrag, onClick=null}) {
  return useDraggable({
    getDim: evt => evt.screenX, 
    onDrag,
    onClick,
  });
}
export function Draggable({getDim, onStart, onDrag, cursor, onClick=null}) {
  const listeners = useDraggable({getDim, onStart, onDrag, onClick})
  const classes = useStyles();
  return (
    <div
      className={classes.handle}
      style={{cursor: cursor}}
      {...listeners}
    />
  );
}

export function LeftResizable({onResize, size, minSize}) {
  const [savedSize, setSavedSize] = React.useState(size);

  return (
    <Draggable
      getDim={evt => evt.screenX}
      onStart={() => setSavedSize(size)}
      onDrag={(evt,info) => onResize(Math.max(minSize, savedSize - info.offset))}
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
      onDrag={(evt,info) => {
        onResize(Math.max(minSize, savedSize + info.offset))
      }}
      cursor='col-resize'
    />
  );
}
