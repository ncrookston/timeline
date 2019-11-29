import React from 'react';

import IntervalTree from 'node-interval-tree';
import {concat, find, forOwn, fromPairs, initial, mapValues, max, range, reduce, sortedLastIndex, values, zip} from 'lodash';

import getOrderedOffsets from './getOrderedOffsets';
import Context from './Context';
import Item from './Item';

function getCategoryIdMap(categoryIds, items, getCategory, getId, getTimespan) {
  let categoryItems = fromPairs(categoryIds.map(categoryId => [
    categoryId, {
      dict: {},
      tree: new IntervalTree(),
      levels: {},
    }
  ]));

  items.forEach(item => {
    categoryItems[getCategory(item)].dict[getId(item)] = item;
  });
  forOwn(categoryItems, r => {
    values(r.dict).forEach(item => {
      let noOverlap = [...getTimespan(item)];
      noOverlap[0] += 1*1e-9;
      noOverlap[1] -= 1*1e-9;
      r.tree.insert(...noOverlap, getId(item))
    });
  });

  forOwn(categoryItems, r => {
    //For each category, find a level for each item that prevents overlap.
    r.levels = reduce(r.dict, (res, item, itemId) => {
      //For each item in this category, find any overlapping items. Create a set of
      // each items' level (if assigned).
      const shared = fromPairs(r.tree.search(...item.timespan).map(id => [res[id],true]));
      //Then, find the smallest level that is not currently assigned and assign that
      // as itemId's level.
      return {
        ...res,
        [itemId]: find(range(0,r.tree.count), lvl => shared[lvl] === undefined)
      };
    }, {});
  });
  return categoryItems;
}

export default function StackedSpanLayer({
  items,
  onUpdateCategory=null,
  onUpdateTime=null,
  timestep,
  getCategory=item=>item.category,
  getId=item=>item.id,
  getTimespan=item=>item.timespan,
}) {
  const {
    categoryOrder,
    categoryHeights,
    setCategoryHeights,
  } = React.useContext(Context);
  const byCategoryIds = React.useMemo(() => (
      getCategoryIdMap(categoryOrder, items, getCategory, getId, getTimespan)
    ),
    [getCategory,getId,getTimespan,categoryOrder,items]
  );
  const rowWidth = 40;
  setCategoryHeights('StackedSpanLayer', mapValues(byCategoryIds, obj =>
    rowWidth * (max(concat(0,values(obj.levels))) + 1)
  ));
  const offsets = getOrderedOffsets(categoryOrder, categoryHeights);
  const offsetsByCat = fromPairs(zip(categoryOrder, initial(offsets)));
  const onUpdateImpl = (timespan, datum, canvasY) => {
    onUpdateTime(timespan, datum);

    if (onUpdateCategory && canvasY !== null) {
      const idx = Math.min(sortedLastIndex(offsets, canvasY), categoryOrder.length) - 1;
      const newCat = categoryOrder[idx];
      if (idx !== -1 && newCat !== getCategory(datum))
        onUpdateCategory(newCat, datum);
    }
  };
  return (<>
    {
      items.map(d => {
        const categoryOffset = offsetsByCat[getCategory(d)];
        const categoryHeight = categoryHeights[getCategory(d)];
        const itemOffset = byCategoryIds[getCategory(d)].levels[getId(d)] * rowWidth;
        return (
          <Item
            key={getId(d)}
            datum={d}
            offset={categoryOffset + itemOffset}
            categoryHeight={categoryHeight}
            onUpdate={onUpdateImpl}
            timestep={timestep}
          />
        );
      })
    }
    </>
  );
}

