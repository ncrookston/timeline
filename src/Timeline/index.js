import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import {forOwn, fromPairs, map, reduce, values} from 'lodash';

import IntervalTree from 'node-interval-tree';

import GroupView from './GroupView';
import Row from './Row';
import Context from './Context';

const useStyles = makeStyles({
  outer: {
    width: '100%',
    position: 'relative',
    border: '1px solid blue',
  },
});

export default function Timeline({
  initialTimespan,//Need a sensible default...
  rowOrder,
  children
}) {

  const [rowLevels, setRowLevels] = React.useState({});
  const [sidebarWidthPx, setSidebarWidthPx] = React.useState(0);
  const height = 30 * reduce(map(rowOrder, rowId => rowLevels[rowId]),
      (sum, lvl) => sum + lvl, 0);
  const classes = useStyles();
  return (
    <div className={classes.outer} style={{height: height+'px'}}>
      <Context.Provider
        value={{
          rowLevels,
          setRowLevels,
          rowOrder,
          sidebarWidthPx,
          setSidebarWidthPx
        }}
      >
        {children}
      </Context.Provider>
    </div>
  );
}

