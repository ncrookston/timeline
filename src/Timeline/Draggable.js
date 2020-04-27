import React from 'react';

function getPt(evt) {
  return [evt.screenX, evt.screenY];
}
function ptDiff(evt, pt) {
  return [evt.screenX - pt[0], evt.screenY - pt[1]];
}
export function useDraggable({onStart, onDrag, limits=null, onClick=null}) {
  const [firstMouse, setFirstMouse] = React.useState(null);
  const [lastMouse, setLastMouse] = React.useState(null);
  const [didMove, setDidMove] = React.useState(false);
  const [rLimits, setRLimits] = React.useState(null);

  React.useLayoutEffect(() => {
    const onMouseMove = evt => {
      if (firstMouse !== null) {
        evt.preventDefault();
        evt.stopPropagation();
        const offset = ptDiff(evt,firstMouse);
        const delta = ptDiff(evt,lastMouse);

        const inBounds = idx => (
          !rLimits[idx] || (lastMouse[idx] >= rLimits[idx][0] && lastMouse[idx] <= rLimits[idx][1])
        );
        if (offset[0] * offset[0] + offset[1] + offset[1] > 10)
          setDidMove(true);
        if (!rLimits || (inBounds(0) && inBounds(1))) {
          onDrag(evt, {
            hasMoved: didMove,
            offset,
            delta,
            initial: firstMouse,
          });
        }
        if (didMove) {
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
        setRLimits(null);
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
      const fm = getPt(evt);
      setFirstMouse(fm);
      setRLimits(limits ? [
        limits[0] ? limits[0].map(l => l + fm[0]) : null,
        limits[1] ? limits[1].map(l => l + fm[1]) : null,
      ] : null);
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
export function Draggable({onStart, onDrag, cursor, limits=null, onClick=null}) {
  const listeners = useDraggable({onStart, onDrag, onClick, limits})
  return (
    <div
      style={{cursor: cursor, width: '100%', height: '100%'}}
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
        if (info.hasMoved)
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
        if (info.hasMoved)
          onResize(Math.max(minSize, savedSize + info.offset[0]))
      }}
      cursor='col-resize'
    />
  );
}

