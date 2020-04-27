import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import Context from './Context';
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
    classes
    maxTime,
    minTime,
    headerHeight,
    footerHeight,
  } = props;

  const {
    containerWidthPx,
    timespan,
    setTimeStart,
    timePerPx,
    setTimePerPx,
    leftSidebarWidth,
    rightSidebarWidth,
  } = React.useContext(Context);
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
          newTPP = Math.min(newTPP, maxTime / containerWidthPx);
        if (minTime !== null)
          newTPP = Math.max(newTPP, minTime / containerWidthPx);
        setTimePerPx(newTPP);
        const off = evt.clientX - ref.current.getBoundingClientRect().left;
        const fixedTimePt = off * timePerPx + timespan[0];
        setTimeStart(fixedTimePt - newTPP * off);
      }
    };
    const elem = ref.current;
    elem.addEventListener('wheel', onWheel, {passive: false});
    return () => elem.removeEventListener('wheel',onWheel);
  }, [ref,setTimeStart,setTimePerPx,leftSidebarWidthPx,timePerPx,timespan,containerWidthPx,maxTime,minTime]);

  const panListeners = usePan({onDrag});
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
      <TopTimeLabel labelMarks={tpp => getMarks(tpp,1000)} />
      <CategoryMarks />
      <TimeMarks labelMarks={tpp => getMarks(tpp,240)} />
    </div>
  );
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
};

export default withStyles(styles, {name: 'CrkMouseControlCanvas' })(MouseControlCanvas);
