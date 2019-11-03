import React from 'react';

import IntervalTree from 'node-interval-tree';
import {find, forOwn, fromPairs, isEqual, mapValues, max, range, reduce, values} from 'lodash';

import Context from './Context';

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
    values(r.dict).forEach(item => r.tree.insert(...item.span, item.id));
  });

  forOwn(rowItems, r => {
    r.levels = reduce(r.dict, (res, item, itemId) => {
      const shared = fromPairs(r.tree.search(...item.span).map(id => [res[id], true]));
      return {...res,
        [itemId]: find(range(0,r.tree.count), lvl => shared[lvl] === undefined)
      };
    }, {});
  });
  return rowItems;
}

export default function TimespanLayer({items}) {
  const {rowOrder, rowLevels, setRowLevels} = React.useContext(Context);
  const byRowIds = React.useMemo(() => groupByRowIds(rowOrder, items), [rowOrder,items]);
  const newLevels = mapValues(byRowIds, obj => max(values(obj.levels)) + 1);
  if (!isEqual(newLevels,rowLevels)) {
    setRowLevels(newLevels);
  }
  return null;
}

