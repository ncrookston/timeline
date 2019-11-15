import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

import IntervalTree from 'node-interval-tree';
import {concat, find, forOwn, fromPairs, initial, isEqual, last, map, mapValues, max, range, reduce, values, zip} from 'lodash';

import Context from './Context';
import Item from './Item';

const useStyles = makeStyles({
  timeline: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    border: '1px solid orange',
  },
  canvas: {
    position: 'absolute',
    height: '100%',
    right: 0,
    top: 0,
    contentBox: 'border-box',
    overflow: 'hidden',
  }
});
function getCategoryIdMap(categoryIds, items) {
  let categoryItems = fromPairs(categoryIds.map(categoryId => [
    categoryId, {
      dict: {},
      tree: new IntervalTree(),
      levels: {},
    }
  ]));

  //TODO: Use category accessor, data ID accessors
  items.forEach(item => {
    categoryItems[item.category].dict[item.id] = item;
  });
  //TODO: Use span accessor, data ID accessors
  forOwn(categoryItems, r => {
    values(r.dict).forEach(item => {
      let noOverlap = [...item.timespan];
      noOverlap[0] += 1*1e-9;
      noOverlap[1] -= 1*1e-9;
      r.tree.insert(...noOverlap, item.id)
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

export default function TimespanLayer({items, onUpdateCategory=null, onUpdateTime=null, timestep}) {
  const {
    categoryOrder,
    categoryLevels,
    setCategoryLevels,
    sidebarWidthPx
  } = React.useContext(Context);
  const [hoverCategory, setHoverCategory] = React.useState(null);
  const byCategoryIds = React.useMemo(() => getCategoryIdMap(categoryOrder, items), [categoryOrder,items]);
  const newLevels = mapValues(byCategoryIds, obj => max(concat(0,values(obj.levels))) + 1);
  if (!isEqual(newLevels,categoryLevels)) {
    setCategoryLevels(newLevels);
  }
  const categoryOffsets = reduce(
    map(categoryOrder, categoryId => newLevels[categoryId]),
    (res,lvl) => res.concat(last(res) + lvl),
    [0]
  );
  const byCategoryOffsets = fromPairs(zip(categoryOrder, initial(categoryOffsets)));
  const onUpdateImpl = (timespan, data) => {
    onUpdateTime(timespan, data);
    if (onUpdateCategory && hoverCategory !== null && hoverCategory !== data.category)
      onUpdateCategory(hoverCategory,data);
  };
  const classes = useStyles();
  return (
    <div className={classes.canvas} style={{left: sidebarWidthPx}}>
    {
      categoryOrder.map(categoryId => (
        <div
          key={categoryId}
          className={classes.timeline}
          style={{
            top: byCategoryOffsets[categoryId] * 30 + 'px',
            height: newLevels[categoryId] * 30 + 'px',
          }}
          onMouseEnter={() => setHoverCategory(categoryId, null)}
        />
      ))
    }
    {
      items.map(d => {
        const interOffset = byCategoryOffsets[d.category] * 30;
        const intraOffset = byCategoryIds[d.category].levels[d.id] * 30;
        return (
          <Item
            key={d.id}
            data={d}
            offset={interOffset + intraOffset + 'px'}
            onUpdate={(span,data) => onUpdateImpl(span, data)}
            timestep={timestep}
            onMouseEnter={() => setHoverCategory(d.category, byCategoryOffsets[d.category])}
          />
        );
      })
    }
    </div>
  );
}

