import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

import Context from './Context';
import {usePanX} from './Draggable';

const useStyles = makeStyles({
  root: {
    border: '1px solid orange',
  }
});

export default function MouseControlLayer({children}) {
  const {
    timeStart,
    setTimeStart,
    timePerPx,
    setTimePerPx,
  } = React.useContext(Context);
  const onDrag = (evt, info) => {
    setTimeStart(timeStart - info.delta * timePerPx);
  };
  const ref = React.useRef();
  React.useEffect(() => {
    const onWheel = evt => {
      //TODO: How to animate this?
      if (evt.metaKey || evt.ctrlKey) {
        evt.preventDefault();
        evt.stopPropagation();
        console.log(evt.deltaY);
        setTimePerPx(tpp => tpp * Math.pow(.8, .1 * evt.deltaY));
      }
    };
    const elem = ref.current;
    elem.addEventListener('wheel', onWheel, {passive: false});
    return () => elem.removeEventListener('wheel',onWheel);
  }, [ref,setTimePerPx]);

  const panListeners = usePanX({onDrag});
  const classes = useStyles();
  return (
    <div ref={ref} className={classes.root} {...panListeners}>
      {children}
    </div>
  );
}

