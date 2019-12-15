
import React from 'react';
import {withStyles} from '@material-ui/styles';

import {
  fromPairs,
  initial,
  sortedLastIndex,
  zip
} from 'lodash';
import clsx from 'clsx';
import uuid from 'uuid/v4';

import getOrderedOffsets from './getOrderedOffsets';
import Context from './Context';
import Item from './Item';

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

function HeterogeneousLayer(props) {
  const {
    items,
    onUpdateCategory=null,
    onUpdateTime=null,
    timestep=null,
    getCategory=item=>item.category,
    getId=item=>item.id,
    getTimespan=item=>item.timespan,
    selected=[],
    onSelect=()=>{},
    classes,
    className='',
    itemRenderer = datum => <div className={clsx(classes.item, className)}>{getId(datum)}</div>,
    itemProps={},
    getCategoryRenderOffsets,
  } = props;

  const {
    categoryOrder,
    categoryHeights,
    setCategoryHeights,
  } = React.useContext(Context);
  const [layerId,] = React.useState(uuid());
  //TODO: useMemo
  const {getIntraOffsets, heights} = getCategoryRenderOffsets({
    items,
    categories: categoryOrder,
    setHeights: heights => setCategoryHeights(layerId,heights),
    heights: categoryHeights,
    getCategory, getId, getTimespan,
  });

  const offsets = getOrderedOffsets(categoryOrder, categoryHeights);
  const interOffsets = fromPairs(zip(categoryOrder, initial(offsets)));

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
        const categoryOffset = interOffsets[getCategory(d)];
        const itemOffset = getIntraOffsets(d);
        //TODO: Expose an interface for replacing the renderers for sub-items.
        //TODO: Allow styles to be overriden the same way as material-ui
        const isSelected = selected === true || selected.find(id => id === getId(d));
        return (
          <Item
            key={getId(d)}
            datum={d}
            getId={getId}
            getTimespan={getTimespan}
            yOffset={categoryOffset + itemOffset}
            height={heights(getCategory(d))}
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
export default withStyles(styles, {name: 'CrkHeterogeneousLayer' })(HeterogeneousLayer);

