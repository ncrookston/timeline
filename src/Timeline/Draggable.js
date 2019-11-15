import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles({
  handle: {
    width: '100%',
    height: '100%',
  }
});

function getPt(evt) {
  return [evt.screenX, evt.screenY];
}
function ptDiff(evt, pt) {
  return [evt.screenX - pt[0], evt.screenY - pt[1]];
}
export function useDraggable({onStart, onDrag, onClick=null}) {
  const [firstMouse, setFirstMouse] = React.useState(null);
  const [lastMouse, setLastMouse] = React.useState(null);
  const [didMove, setDidMove] = React.useState(false);

  React.useLayoutEffect(() => {
    const onMouseMove = evt => {
      if (firstMouse !== null) {
        evt.preventDefault();
        evt.stopPropagation();
        const diff = ptDiff(evt,firstMouse);
        if (diff[0] * diff[0] + diff[1] + diff[1] > 10)
          setDidMove(true);
        if (didMove) {
          onDrag(evt, {offset: diff, delta: ptDiff(evt, lastMouse)});
          setLastMouse(getPt(evt));
        }
      }
    };
    const onMouseUp = evt => {
      if (firstMouse !== null) {
        evt.preventDefault();
        evt.stopPropagation();
        if (onClick)
          onClick([evt.screenX,evt.screenY])
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
  }, [didMove, firstMouse, lastMouse, onClick, onDrag]);

  return {
    onMouseDown: evt => {
      evt.preventDefault();
      evt.stopPropagation();
      setFirstMouse(getPt(evt));
      setLastMouse(getPt(evt));
      setDidMove(false);
      if (onStart)
        onStart();
    }
  };
}
export function usePan({onDrag, onClick=null, onStart=null}) {
  return useDraggable({
    onDrag,
    onClick,
    onStart
  });
}
export function Draggable({onStart, onDrag, cursor, onClick=null}) {
  const listeners = useDraggable({onStart, onDrag, onClick})
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
      onStart={() => setSavedSize(size)}
      onDrag={(evt,info) => {
        onResize(Math.max(minSize, savedSize - info.offset[0]))
      }}
      cursor='col-resize'
    />
  );
}

export function RightResizable({onResize, size, minSize}) {
  const [savedSize, setSavedSize] = React.useState(size);

  return (
    <Draggable
      onStart={() => setSavedSize(size)}
      onDrag={(evt,info) => {
        onResize(Math.max(minSize, savedSize + info.offset[0]))
      }}
      cursor='col-resize'
    />
  );
}
