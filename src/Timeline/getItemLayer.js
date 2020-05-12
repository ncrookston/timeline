import React from 'react';
import {withStyles} from '@material-ui/styles';

import IntervalTree from 'node-interval-tree';
import {
  concat,
  find,
  fromPairs,
  groupBy,
  mapValues,
  max,
  range,
  reduce,
  values,
} from 'lodash';

import SpanLayer from './SpanLayer';

export const styles = theme => ({
  item: {
    textAlign: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#6593f5',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#85b3ff',
    }
  }
});

function getItemTree(items, getTimespan, getId) {
  const tree = new IntervalTree();
  items.forEach(item => {
    let noOverlap = [...getTimespan(item)];
    noOverlap[0] += 1e-9;
    noOverlap[1] -= 1e-9;
    tree.insert(...noOverlap, getId(item));
  });
  return tree;
}

function getCategoryIdOffsets(itemsByCategory, getId, getTimespan) {
  const categoryItems = mapValues(itemsByCategory, catItems => ({
    list: catItems,
    tree: getItemTree(catItems, getTimespan, getId),
  }));

  return mapValues(categoryItems, obj => {
    //For each category, find a level for each item that prevents overlap.
    const dataOffsets = reduce(obj.list, (res, item) => {
      //For each item in this category, find any overlapping items. Create a set of
      // each items' level (if assigned).
      const shared = fromPairs(obj.tree.search(...getTimespan(item)).map(id => [res[id],true]));
      //Then, find the smallest level that is not currently assigned and assign that
      // as itemId's level.
      return {
        ...res,
        [getId(item)]: find(range(0,obj.list.length), lvl => shared[lvl] === undefined)
      };
    }, {});

    return {
      getItemOffset: d => dataOffsets[getId(d)],
      items: obj.list,
      maxOffset: Object.values(dataOffsets).reduce((a,b) => Math.max(a,b), 0),
    };
  });
}

function getStackedItems(props) {
  const {
    categories,
    items,
    rowHeight=30,
    rowMargin=5,
    getCategory,
    getId,
    getTimespan
  } = props;
  let itemsByCategory = {};
  if (categories === null) {
    itemsByCategory = groupBy(items, getCategory);
  }
  else {
    categories.forEach(c => itemsByCategory[c] = []);
    items.forEach(i => {
      const catList = itemsByCategory[getCategory(i)];
      if (catList)
        catList.push(i);
      itemsByCategory[getCategory(i)] = catList;
    });
  }
  const byCategoryIds = getCategoryIdOffsets(
    itemsByCategory, getId, getTimespan
  );
  //Function to lookup item offsets within the category
  return mapValues(byCategoryIds, (obj,cat) => ({
    items: obj.items,
    getItemOffset: d => obj.getItemOffset(d) * rowHeight + rowMargin/2,
    height: (obj.maxOffset + 1) * rowHeight,
  }));
}
export default function getItemLayer(props) {
  const {
    categoryOrder=null,
    data,
    timestep,

    onUpdateItemTime,
    onUpdateItemCategory,
    selected,
    onSelect,

    itemRenderer,
    itemProps,

    getCategory = item => item.category,
    getId = item => item.id,
    getTimespan = item => item.timespan,

    rowHeight = 40,
    rowMargin = 5,

    classes,
    //className
  } = props;

  const itemsByCategory = getStackedItems({
    categories: categoryOrder,
    items: data,
    rowHeight,
    rowMargin,
    getCategory,
    getId,
    getTimespan
  });

  const categoryHeights = mapValues(itemsByCategory, obj => obj.height);
  const fullHeight = Object.values(categoryHeights).reduce((a,b) => a + b);

  return {
    getHeight: () => fullHeight,
    categoryHeights,
    render: rprops => (
      <SpanLayer
        categoryOrder={categoryOrder}
        itemsByCategory={itemsByCategory}
        itemHeight={rowHeight - rowMargin}
        getTimespan={getTimespan}
        getId={getId}
        itemRenderer={itemRenderer}
        itemProps={itemProps}
        onUpdateTime={onUpdateItemTime}
        onUpdateCategory={onUpdateItemCategory}
        timestep={timestep}
        selected={selected}
        onSelect={onSelect}
        {...rprops}
      />
    )
  }
}
//export default withStyles(styles, {name: 'CrkStackedSpanLayer' })(StackedSpanLayer);

