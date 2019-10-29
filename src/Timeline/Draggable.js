import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles({
  handle: {
    width: '100%',
    height: '100%',
  }
});

export default function Draggable({onDrag}) {
  const [mouse, setMouse] = React.useState(null);

  React.useLayoutEffect(() => {
    const onMouseMove = evt => {
      if (mouse !== null) {
        onDrag(evt.screenX - mouse);
        setMouse(ms => ms === null ? null : evt.screenX);
      }
    };
    const onMouseUp = evt => {
      if (mouse !== null) {
        setMouse(null);
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [mouse, onDrag]);

  const classes = useStyles();
  return (
    <div
      className={classes.handle}
      onMouseDown={evt => {
        setMouse(evt.screenX);
      }}
    style={{cursor: 'col-resize'}}
    />
  );
}

