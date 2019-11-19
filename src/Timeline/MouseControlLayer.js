import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

import Context from './Context';
import {usePan} from './Draggable';

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    border: '1px solid blue',
  }
});

export default function MouseControlLayer({children}) {
  const {
    timeStart,
    setTimeStart,
    timePerPx,
    setTimePerPx,
    leftSidebarWidthPx,
    rightSidebarWidthPx,
  } = React.useContext(Context);
  const onDrag = (evt, info) => {
    setTimeStart(timeStart - info.delta[0] * timePerPx);
  };
  const ref = React.useRef();
  React.useLayoutEffect(() => {
    const onWheel = evt => {
      if (evt.metaKey || evt.ctrlKey) {
        evt.preventDefault();
        evt.stopPropagation();
        const newTPP = timePerPx * Math.pow(.8, .1 * evt.deltaY);
        setTimePerPx(newTPP);
        const off = evt.clientX - ref.current.getBoundingClientRect().left - leftSidebarWidthPx;
        const fixedTimePt = off * timePerPx + timeStart;
        setTimeStart(fixedTimePt - newTPP * off);
      }
    };
    const elem = ref.current;
    elem.addEventListener('wheel', onWheel, {passive: false});
    return () => elem.removeEventListener('wheel',onWheel);
  }, [ref,setTimeStart,setTimePerPx,leftSidebarWidthPx,timePerPx,timeStart]);

  const panListeners = usePan({onDrag});
  const classes = useStyles();
  return (
    <div
      ref={ref}
      className={classes.root}
      style={{
        left: leftSidebarWidthPx,
        right: rightSidebarWidthPx,
      }}
      {...panListeners}
    >
      {children}
    </div>
  );
}

