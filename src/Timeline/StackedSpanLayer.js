import React from 'react';
import {withStyles} from '@material-ui/styles';

import IntervalTree from 'node-interval-tree';
import {
  concat,
  find,
  fromPairs,
  mapValues,
  max,
  range,
  reduce,
  values,
} from 'lodash';

import HeterogeneousLayer from './HeterogeneousLayer';

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

function getCategoryIdMap(categoryIds, items, getCategory, getId, getTimespan) {
  let categoryItems = fromPairs(categoryIds.map(categoryId => [
    categoryId, {list: [], tree: new IntervalTree()}
  ]));

  items.forEach(item => {
    let noOverlap = [...getTimespan(item)];
    noOverlap[0] += 1*1e-9;
    noOverlap[1] -= 1*1e-9;
    categoryItems[getCategory(item)].list.push(item);
    categoryItems[getCategory(item)].tree.insert(...noOverlap, getId(item));
  });

  return mapValues(categoryItems, obj => {
    //For each category, find a level for each item that prevents overlap.
    return reduce(obj.list, (res, item) => {
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
  });
}

function getStackedOffsets({items, categories, heights, setHeights, getCategory, getId, getTimespan}) {
  const byCategoryIds = getCategoryIdMap(
    categories, items, getCategory, getId, getTimespan
  );
  const rowHeight = 40;
  setHeights(
    mapValues(byCategoryIds, obj => rowHeight * (max(concat(0,values(obj))) + 1))
  );

  //Function to lookup item offsets within the category
  return {
    getIntraOffsets: d => {
      return byCategoryIds[getCategory(d)][getId(d)] * rowHeight + 5;
    },
    heights: d => rowHeight - 10,
  };
}

function StackedSpanLayer(props) {
  return <HeterogeneousLayer getCategoryRenderOffsets={getStackedOffsets} {...props} />
}
export default withStyles(styles, {name: 'CrkStackedSpanLayer' })(StackedSpanLayer);

