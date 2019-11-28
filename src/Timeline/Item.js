import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import Context from './Context';
import {LeftResizable,RightResizable,usePan} from './Draggable';

const useStyles = makeStyles({
  inner: {
    position: 'absolute',
    boxSizing: 'border-box',
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
  },
  left: {
    position: 'absolute',
    left: 0,
    width: '3px',
    top: 0,
    height: '100%',
    backgroundColor: '#0002',
  },
  right: {
    position: 'absolute',
    right: 0,
    width: '3px',
    top: 0,
    height: '100%',
    backgroundColor: '#0002',
  },
});

export default function Item({data, offset, onUpdate, timestep, onMouseEnter}) {
  const {
    timeStart,
    timePerPx,
  } = React.useContext(Context);
  const [isSelected, setIsSelected] = React.useState(false);
  const [didDrag, setDidDrag] = React.useState(false);
  const [initialTime, setInitialTime] = React.useState(null);
  const snap = time => timestep ? timestep * Math.round(time / timestep) : time;
  const onDrag = (evt,info) => {
    const new0 = initialTime + snap(timePerPx * info.offset[0]);
    const new1 = new0 + data.timespan[1] - data.timespan[0];
    onUpdate([new0, new1], data);
    setDidDrag(true);
  };
  const onStart = () => setInitialTime(data.timespan[0]);
  const panListeners = usePan({onDrag, onStart});
  const toPx = t => (t - timeStart) / timePerPx;
  //TODO: Data accessors (timespan):
  //TODO: Expose an interface for replacing the renderers for sub-items.
  //TODO: Allow styles to be overriden the same way as material-ui
  const left = toPx(data.timespan[0]) - 1;
  const width = toPx(data.timespan[1]) - left - 2;
  const onResize = (newSizePx,side) => {
    let newSpan = [...data.timespan];
    if (side === 'left')
      newSpan[0] = newSpan[1] - snap(newSizePx * timePerPx);
    else
      newSpan[1] = newSpan[0] + snap(newSizePx * timePerPx);
    if (newSpan[0] > newSpan[1])
      newSpan[1] = newSpan[0];
    onUpdate(newSpan, data);
  };
//  const focusButton = button => {
//    button.blur();
//    button.ownerDocument.dispatchEvent(new window.Event('keydown'));
//    button.focus();
//  };
  const onClick = evt => {
    if (!didDrag)
      setIsSelected(!isSelected);
    else
      setIsSelected(true);
    setDidDrag(false);
    //const button = evt.target.parentElement;
  };
  const style = {
    top: offset + 7 + 'px',
    left,
    width,
  };
  const rStyle = {
    visibility: isSelected ? 'visible' : 'hidden',
  };
  const classes = useStyles();
  return (
    <div className={classes.inner} style={style} {...panListeners} onMouseEnter={onMouseEnter}>
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

