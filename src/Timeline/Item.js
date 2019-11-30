import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Context from './Context';
import {LeftResizable,RightResizable,usePan} from './Draggable';

const useStyles = makeStyles({
  inner: {
    position: 'absolute',
    boxSizing: 'border-box',
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

export default function Item({
  datum,
  yOffset,
  height,
  onUpdate,
  timestep,
  getTimespan,
  children,
}) {
  const {
    timePerPx,
    timeToPx,
  } = React.useContext(Context);
  const [x0,x1] = timeToPx(getTimespan(datum));
  const width = x1 - x0 - 2;
  const itemRef = React.useRef();
  const [isSelected, setIsSelected] = React.useState(false);
  const [didDrag, setDidDrag] = React.useState(false);
  const [initialTime, setInitialTime] = React.useState(null);
  const snap = time => timestep ? timestep * Math.round(time / timestep) : time;
  const onDrag = (evt,info) => {
    let newSpan = [...getTimespan(datum)];
    if (info.hasMoved) {
      const new0 = initialTime + snap(timePerPx * info.offset[0]);
      newSpan = [new0, new0 + newSpan[1] - newSpan[0]];
    }
    const canvasRel = evt.clientY - itemRef.current.getBoundingClientRect().y + yOffset;
    onUpdate(newSpan, datum, canvasRel);
    //console.log('Set didDrag ===', didDrag || info.hasMoved)
    setDidDrag(didDrag || info.hasMoved);
  };
  const onStart = () => setInitialTime(getTimespan(datum)[0]);
  const onClick = evt => {
    //console.log(didDrag);
    //console.log('onClick, didDrag ===', didDrag)
    if (!didDrag)
      setIsSelected(is => !is);
    else
      setIsSelected(true);
    setDidDrag(false);
  };
  const panListeners = usePan({onDrag, onStart, onClick});
  const onResize = (newSizePx,side) => {
    let newSpan = [...getTimespan(datum)];
    if (side === 'left')
      newSpan[0] = newSpan[1] - snap(newSizePx * timePerPx);
    else
      newSpan[1] = newSpan[0] + snap(newSizePx * timePerPx);
    if (newSpan[0] > newSpan[1])
      newSpan[1] = newSpan[0];
    onUpdate(newSpan, datum, null);
  };
  const style = {
    top: yOffset + 'px',
    left: x0+1+'px',
    width: width+'px',
    height: height+'px',
  };
  const rStyle = {
    visibility: isSelected ? 'visible' : 'hidden',
  };
  const classes = useStyles();
  return (
    <div ref={itemRef} className={classes.inner} style={style} {...panListeners}>
      {children(datum)}
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

