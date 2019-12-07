import React from 'react';
import {withStyles} from '@material-ui/styles';

import IntervalTree from 'node-interval-tree';
import {
  concat,
  find,
  fromPairs,
  initial,
  mapValues,
  max,
  range,
  reduce,
  sortedLastIndex,
  values,
  zip
} from 'lodash';
import clsx from 'clsx';

import getOrderedOffsets from './getOrderedOffsets';
import Context from './Context';
import Item from './Item';

export const styles = theme => ({
  span: {
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

function StackedSpanLayer(props) {
  const {
    items,
    onUpdateCategory=null,
    onUpdateTime=null,
    timestep,
    getCategory=item=>item.category,
    getId=item=>item.id,
    getTimespan=item=>item.timespan,
    selected=[],
    onSelect=()=>{},
    classes,
    className,
    itemRenderer = datum => <div className={clsx(classes.span, className)}>{getId(datum)}</div>,
    itemProps={},
  } = props;

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
  const rowHeight = 40;
  setCategoryHeights('StackedSpanLayer', mapValues(byCategoryIds, obj =>
    rowHeight * (max(concat(0,values(obj))) + 1)
  ));
  const offsets = getOrderedOffsets(categoryOrder, categoryHeights);
  const offsetsByCat = fromPairs(zip(categoryOrder, initial(offsets)));
  const onUpdateImpl = (timespan, datum, canvasY) => {
    if (onUpdateTime)
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
        const itemOffset = byCategoryIds[getCategory(d)][getId(d)] * rowHeight;
        //TODO: Expose an interface for replacing the renderers for sub-items.
        //TODO: Allow styles to be overriden the same way as material-ui
        const isSelected = selected.find(id => id === getId(d));
        return (
          <Item
            key={getId(d)}
            datum={d}
            getId={getId}
            getTimespan={getTimespan}
            yOffset={categoryOffset + itemOffset + 5}
            height={rowHeight - 10}
            onUpdate={onUpdateImpl}
            timestep={timestep}
            onSelect={doSelect => onSelect(getId(d), doSelect)}
            selected={isSelected}
            children={itemRenderer}
            {...itemProps}
          />
        );
      })
    }
    </>
  );
}

export default withStyles(styles, {name: 'CrkStackedSpanLayer' })(StackedSpanLayer);

