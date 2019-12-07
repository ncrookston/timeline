import React from 'react';

import {withStyles} from '@material-ui/core/styles';

import Context from './Context';
import {LeftResizable,RightResizable,usePan} from './Draggable';

export const styles = theme => ({
  inner: {
    position: 'absolute',
    boxSizing: 'border-box',
  },
  leftResize: {
    position: 'absolute',
    left: 0,
    width: '3px',
    top: 0,
    height: '100%',
    backgroundColor: '#0002',
  },
  rightResize: {
    position: 'absolute',
    right: 0,
    width: '3px',
    top: 0,
    height: '100%',
    backgroundColor: '#0002',
  },
});

function Item(props) {
  const {
    classes,
    datum,
    yOffset,
    height,
    onUpdate,
    onSelect,
    timestep,
    getTimespan,
    selected,
    children,
    disableDrag = false,
    disableResize = false,
    editAfterSelect = false,
  } = props;

  const {
    timePerPx,
    timeToPx,
  } = React.useContext(Context);
  const [x0,x1] = timeToPx(getTimespan(datum));
  const width = x1 - x0 - 2;
  const itemRef = React.useRef();
  const [didDrag, setDidDrag] = React.useState(false);
  const [initialTime, setInitialTime] = React.useState(null);
  const snap = time => timestep ? timestep * Math.round(time / timestep) : time;
  const onDrag = (evt,info) => {
    let newSpan = [...getTimespan(datum)];
    if (disableDrag || (editAfterSelect && !selected))
      return;
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
    onSelect(didDrag || !selected);
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
    visibility: selected ? 'visible' : 'hidden',
  };
  return (
    <div ref={itemRef} className={classes.inner} style={style} {...panListeners}>
      {children(datum)}
      {!disableResize && <>
      <div
        style={rStyle}
        className={classes.leftResize}
      >
        <LeftResizable
          size={width}
          minSize={0}
          onResize={newSize => onResize(newSize, 'left')}
        />
      </div>
      <div
        style={rStyle}
        className={classes.rightResize}
      >
        <RightResizable
          size={width}
          minSize={0}
          onResize={newSize => onResize(newSize, 'right')}
        />
      </div>
      </>}
    </div>
  );
}

export default withStyles(styles, {name: 'CrkItem' })(Item);
