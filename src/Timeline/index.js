import React from 'react';

import {makeStyles} from '@material-ui/core/styles';

import {map, reduce} from 'lodash';

import Context from './Context';

const useStyles = makeStyles({
  outer: {
    width: '100%',
    position: 'relative',
    //border: '1px solid blue',
  },
});

export default function Timeline({
  initialTimespan,//Need a sensible default...
  categoryOrder,
  children
}) {

  const containerRef = React.useRef();

  const [containerWidthPx, setContainerWidthPx] = React.useState(null);
  const [categoryLevels, setCategoryLevels] = React.useState({});
  const [sidebarWidthPx, setSidebarWidthPx] = React.useState(0);
  const [timeStart, setTimeStart] = React.useState(initialTimespan[0]);
  const [timePerPx, setTimePerPx] = React.useState(initialTimespan[1] - initialTimespan[0]);
  React.useLayoutEffect(() => {
    const obs = new ResizeObserver(objs => {
      const contWidth = objs[0].contentRect.width;
      const sideWidth = Math.min(sidebarWidthPx, contWidth);
      if (containerWidthPx === null) {
        const newTpp = timePerPx / (contWidth - sideWidth);
        if (newTpp > 5)
          debugger
        setTimePerPx(newTpp);
      }
      setContainerWidthPx(contWidth);
      setSidebarWidthPx(sideWidth);
    });
    const curRef = containerRef.current;
    obs.observe(curRef);
    return () => obs.unobserve(curRef);
  }, [containerWidthPx,sidebarWidthPx,timePerPx]);
  const height = 30 * reduce(map(categoryOrder, categoryId => categoryLevels[categoryId]),
    (sum, lvl) => sum + lvl, 0
  );
  const classes = useStyles();
  return (
    <div ref={containerRef} className={classes.outer} style={{height: height+'px'}}>
      <Context.Provider
        value={{
          containerWidthPx,
          categoryLevels,
          setCategoryLevels,
          categoryOrder,
          sidebarWidthPx,
          setSidebarWidthPx,
          timeStart,
          setTimeStart,
          timePerPx,
          setTimePerPx,
        }}
      >
        {children}
      </Context.Provider>
    </div>
  );
}

