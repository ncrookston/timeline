import React from 'react';

import {makeStyles} from '@material-ui/core/styles';

import {map, reduce} from 'lodash';

import Context from './Context';

const useStyles = makeStyles({
  outer: {
    width: '100%',
    position: 'relative',
    border: '1px solid blue',
    overflow: 'hidden',
  },
});

export default function Timeline({
  initialTimespan,//Need a sensible default...
  rowOrder,
  children
}) {

  const containerRef = React.useRef();

  const [containerWidthPx, setContainerWidthPx] = React.useState(null);
  const [rowLevels, setRowLevels] = React.useState({});
  const [sidebarWidthPx, setSidebarWidthPx] = React.useState(0);
  const [timespan, setTimespan] = React.useState(initialTimespan);

  const timePerPx = (timespan[1] - timespan[0]) / (containerWidthPx - sidebarWidthPx);
  console.log('Time Per Pixel',timePerPx)
  React.useEffect(() => {
    const obs = new ResizeObserver(objs => {
      const contWidth = objs[0].contentRect.width;
      setContainerWidthPx(contWidth);
      const sideWidth = Math.min(sidebarWidthPx, contWidth);
      setSidebarWidthPx(sideWidth);
//      if (containerWidthPx !== null)
//        setTimespan([timespan[0], timespan[0] + timePerPx * (contWidth - sideWidth)]);
    });
    const curRef = containerRef.current;
    obs.observe(curRef);
    return () => obs.unobserve(curRef);
  });
  const height = 30 * reduce(map(rowOrder, rowId => rowLevels[rowId]),
    (sum, lvl) => sum + lvl, 0
  );
  const classes = useStyles();
  return (
    <div ref={containerRef} className={classes.outer} style={{height: height+'px'}}>
      <Context.Provider
        value={{
          containerWidthPx,
          rowLevels,
          setRowLevels,
          rowOrder,
          sidebarWidthPx,
          setSidebarWidthPx,
          timespan,
          setTimespan,
        }}
      >
        {children}
      </Context.Provider>
    </div>
  );
}

