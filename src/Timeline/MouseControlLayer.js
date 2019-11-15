import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

import Context from './Context';
import {usePan} from './Draggable';

const useStyles = makeStyles({
  root: {
  }
});

export default function MouseControlLayer({children}) {
  const {
    timeStart,
    setTimeStart,
    timePerPx,
    setTimePerPx,
    sidebarWidthPx,
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
        const off = evt.clientX - ref.current.getBoundingClientRect().left - sidebarWidthPx;
        const fixedTimePt = off * timePerPx + timeStart;
        setTimeStart(fixedTimePt - newTPP * off);
      }
    };
    const elem = ref.current;
    elem.addEventListener('wheel', onWheel, {passive: false});
    return () => elem.removeEventListener('wheel',onWheel);
  }, [ref,setTimeStart,setTimePerPx,sidebarWidthPx,timePerPx,timeStart]);

  const panListeners = usePan({onDrag});
  const classes = useStyles();
  return (
    <div ref={ref} className={classes.root} {...panListeners}>
      {children}
    </div>
  );
}

