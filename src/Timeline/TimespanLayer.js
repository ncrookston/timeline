import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

import IntervalTree from 'node-interval-tree';
import {find, forOwn, fromPairs, isEqual, map, mapValues, max, range, reduce, values} from 'lodash';

import Context from './Context';
import Item from './Item';

const useStyles = makeStyles({
  timeline: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    overflow: 'hidden',
    border: '1px solid orange',
  },
});
function groupByRowIds(rowIds, items) {
  let rowItems = fromPairs(rowIds.map(rowId => [
    rowId, {
      dict: {},
      tree: new IntervalTree(),
      levels: {},
    }
  ]));

  //TODO: Use group accessor, data ID accessors
  items.forEach(item => {
    rowItems[item.group].dict[item.id] = item;
  });
  //TODO: Use span accessor, data ID accessors
  forOwn(rowItems, r => {
    values(r.dict).forEach(item => r.tree.insert(...item.timespan, item.id));
  });

  forOwn(rowItems, r => {
    //For each row, find a level for each item that prevents overlap.
    r.levels = reduce(r.dict, (res, item, itemId) => {
      //For each item in this row, find any overlapping items. Create a set of
      // each items' level (if assigned).
      const shared = fromPairs(r.tree.search(...item.timespan).map(id => [res[id], true]));
      //Then, find the smallest level that is not currently assigned and assign that
      // as itemId's level.
      return {...res,
        [itemId]: find(range(0,r.tree.count), lvl => shared[lvl] === undefined)
      };
    }, {});
  });
  return rowItems;
}

export default function TimespanLayer({items, onUpdate}) {
  const {
    rowOrder,
    rowLevels,
    setRowLevels,
    sidebarWidthPx
  } = React.useContext(Context);
  const byRowIds = React.useMemo(() => groupByRowIds(rowOrder, items), [rowOrder,items]);
  const newLevels = mapValues(byRowIds, obj => max(values(obj.levels)) + 1);
  if (!isEqual(newLevels,rowLevels)) {
    setRowLevels(newLevels);
  }
  const rowOffsets = reduce(map(rowOrder, rowId => rowLevels[rowId]),
    (res,lvl) => res.concat(res[res.length-1] + lvl), [0]
  );
  const classes = useStyles();
  return (<>
  {
    rowOrder.map((rowId,i) => (
      <div
        key={rowId}
        className={classes.timeline}
        style={{
          left: sidebarWidthPx,
          top: rowOffsets[i] * 30 + 'px',
        }}
      >
      {
        values(byRowIds[rowId].dict).map(d => {
          return (
              <Item
                key={d.id}
                data={d}
                offset={byRowIds[rowId].levels[d.id] * 30 + 'px'}
                onUpdate={onUpdate}
              />
          );
        })
      }
      </div>
    ))
  }
  </>);
}

