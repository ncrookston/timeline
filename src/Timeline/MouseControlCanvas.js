import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import {usePan} from './Draggable';

export const styles = theme => ({
  root: {
    position: 'absolute',
    boxSizing: 'border-box',
    overflow: 'hidden',
  }
});

function MouseControlCanvas(props) {
  const {
    classes,
    maxTime,
    minTime,
    width,
    height,
    timespan,
    setTimeStart,
    timePerPx,
    setTimePerPx,
    offset,
  } = props;

  const onDrag = (evt, info) => {
    setTimeStart(timespan[0] - info.delta[0] * timePerPx);
  };
  const ref = React.useRef();
  React.useLayoutEffect(() => {
    const onWheel = evt => {
      if (evt.metaKey || evt.ctrlKey) {
        evt.preventDefault();
        evt.stopPropagation();
        let newTPP = timePerPx * Math.pow(.8, .1 * evt.deltaY);
        if (maxTime !== null)
          newTPP = Math.min(newTPP, maxTime / width);
        if (minTime !== null)
          newTPP = Math.max(newTPP, minTime / width);
        setTimePerPx(newTPP);
        const off = evt.clientX - ref.current.getBoundingClientRect().left;
        const fixedTimePt = off * timePerPx + timespan[0];
        setTimeStart(fixedTimePt - newTPP * off);
      }
      else if (Math.abs(evt.deltaX) > Math.abs(evt.deltaY)) {
        evt.preventDefault();
        evt.stopPropagation();
        setTimeStart(start => start + timePerPx * evt.deltaX);
      }
    };
    const elem = ref.current;
    elem.addEventListener('wheel', onWheel, {passive: false});
    return () => elem.removeEventListener('wheel',onWheel);
  }, [ref,setTimeStart,setTimePerPx,timePerPx,timespan,width,maxTime,minTime]);

  const panListeners = usePan({onDrag});
  return (<>
    <div
      ref={ref}
      className={classes.root}
      style={{
        left: offset[0],
        width,
        top: offset[1],
        height,
      }}
      {...panListeners}
    />
  </>);
}

MouseControlCanvas.propTypes = {
  /**
   * Override or extend the styles applied to this component.
   */
  classes: PropTypes.object.isRequired,
  /**
   * The minimum displayable timespan duration.
   */
  minTime: PropTypes.number,
  /**
   * The maximum displayable timespan duration.
   */
  maxTime: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  timespan: PropTypes.array.isRequired,
  setTimeStart: PropTypes.func.isRequired,
  timePerPx: PropTypes.number,
  setTimePerPx: PropTypes.func.isRequired,
};

export default withStyles(styles, {name: 'CrkMouseControlCanvas' })(MouseControlCanvas);
