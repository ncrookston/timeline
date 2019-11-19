import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

import IntervalTree from 'node-interval-tree';
import {concat, find, forOwn, fromPairs, initial, mapValues, max, range, reduce, values, zip} from 'lodash';

import getOrderedOffsets from './getOrderedOffsets';
import Context from './Context';
import Item from './Item';

const useStyles = makeStyles({
  timeline: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    borderBottom: '1px solid orange',
    boxSizing: 'border-box',
  },
  canvas: {
    position: 'absolute',
    height: '100%',
    right: 0,
    top: 0,
    boxSizing: 'border-box',
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
    categoryHeights,
    setCategoryHeights,
  } = React.useContext(Context);
  const [hoverCategory, setHoverCategory] = React.useState(null);
  const byCategoryIds = React.useMemo(() => (
      getCategoryIdMap(categoryOrder, items)
    ),
    [categoryOrder,items]
  );
  setCategoryHeights('timepsan', mapValues(byCategoryIds, obj =>
    30 * (max(concat(0,values(obj.levels))) + 1)
  ));
  const offsets = getOrderedOffsets(categoryOrder, categoryHeights);
  const offsetsByCat = fromPairs(zip(categoryOrder, initial(offsets)));
  const onUpdateImpl = (timespan, data) => {
    onUpdateTime(timespan, data);
    if (onUpdateCategory && hoverCategory !== null && hoverCategory !== data.category)
      onUpdateCategory(hoverCategory,data);
  };
  const classes = useStyles();
  return (<>
    {
      categoryOrder.map(categoryId => (
        <div
          key={categoryId}
          className={classes.timeline}
          style={{
            top: offsetsByCat[categoryId] + 'px',
            height: categoryHeights[categoryId] + 'px',
          }}
          onMouseEnter={() => setHoverCategory(categoryId, null)}
        />
      ))
    }
    {
      items.map(d => {
        const interOffset = offsetsByCat[d.category];
        const intraOffset = byCategoryIds[d.category].levels[d.id] * 30;
        return (
          <Item
            key={d.id}
            data={d}
            offset={interOffset + intraOffset + 'px'}
            onUpdate={(span,data) => onUpdateImpl(span, data)}
            timestep={timestep}
            onMouseEnter={() => setHoverCategory(d.category, offsetsByCat[d.category])}
          />
        );
      })
    }
    </>
  );
}

