import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

import Context from './Context';
import {usePan} from './Draggable';

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    boxSizing: 'border-box',
    overflow: 'hidden',
    border: '1px solid red',
  }
});

export default function MouseControlLayer({children}) {
  const {
    containerWidthPx,
    maxTime,
    minTime,
    timeStart,
    setTimeStart,
    timePerPx,
    setTimePerPx,
    leftSidebarWidthPx,
    rightSidebarWidthPx,
    headerHeightPx,
    footerHeightPx,
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
        let newTPP = timePerPx * Math.pow(.8, .1 * evt.deltaY);
        if (maxTime !== null)
          newTPP = Math.min(newTPP, maxTime / containerWidthPx);
        if (minTime !== null)
          newTPP = Math.max(newTPP, minTime / containerWidthPx);
        setTimePerPx(newTPP);
        const off = evt.clientX - ref.current.getBoundingClientRect().left;
        const fixedTimePt = off * timePerPx + timeStart;
        setTimeStart(fixedTimePt - newTPP * off);
      }
    };
    const elem = ref.current;
    elem.addEventListener('wheel', onWheel, {passive: false});
    return () => elem.removeEventListener('wheel',onWheel);
  }, [ref,setTimeStart,setTimePerPx,leftSidebarWidthPx,timePerPx,timeStart,containerWidthPx,maxTime,minTime]);

  const panListeners = usePan({onDrag});
  const classes = useStyles();
  return (
    <div
      ref={ref}
      className={classes.root}
      style={{
        left: leftSidebarWidthPx,
        right: rightSidebarWidthPx,
        top: headerHeightPx,
        bottom: footerHeightPx,
      }}
      {...panListeners}
    >
      {children}
    </div>
  );
}

