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
    pointerEvents: 'none',
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
  //TODO: Use span accessor, data ID accessors
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
  const [hoverCategory, setHoverCategory] = React.useState(null);
  const byCategoryIds = React.useMemo(() => (
      getCategoryIdMap(categoryOrder, items, getCategory, getId, getTimespan)
    ),
    [getCategory,getId,getTimespan,categoryOrder,items]
  );
  setCategoryHeights('timepsan', mapValues(byCategoryIds, obj =>
    40 * (max(concat(0,values(obj.levels))) + 1)
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
      /*TODO: This probably belongs in a lower layer */
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
        const interOffset = offsetsByCat[getCategory(d)];
        const intraOffset = byCategoryIds[getCategory(d)].levels[getId(d)] * 40;
        return (
          <Item
            key={getId(d)}
            data={d}
            offset={interOffset + intraOffset}
            onUpdate={(span,data) => onUpdateImpl(span, data)}
            timestep={timestep}
            onMouseEnter={() => setHoverCategory(getCategory(d), offsetsByCat[getCategory(d)])}
          />
        );
      })
    }
    </>
  );
}

