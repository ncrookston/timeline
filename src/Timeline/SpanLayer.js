
import React from 'react';
import {withStyles} from '@material-ui/styles';

import {
  flatMap,
  mapValues,
  sortedLastIndex,
} from 'lodash';
import clsx from 'clsx';
import uuid from 'uuid/v4';

import getOrderedOffsets from './getOrderedOffsets';
import Item from './Item';

export const styles = theme => ({
  item: {
    textAlign: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#6593f5',
    color: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

function SpanLayer(props) {
  let {
    itemsByCategory,

    categoryOrder=null,
    categoryHeights=null,

    onUpdateCategory=null,
    onUpdateTime=null,
    timestep=null,
    selected=[],
    onSelect=()=>{},
    getTimespan,
    getId,
    classes,
    className='',

    itemRenderer = datum => <div className={clsx(classes.item, className)}>{getId(datum)}</div>,
    itemProps={},

    timespan,//TODO: Use this to reduce the number of states displayed.
    timeToPx,
    timePerPx,
    width,
    itemHeight,
    offset,
    key,
  } = props;
  if (categoryOrder === null) {
    //If unspecified, use the orde in the map.
    categoryOrder = Object.keys(itemsByCategory);
    categoryOrder.sort();
  }
  if (categoryHeights === null) {
    categoryHeights = mapValues(itemsByCategory, obj => obj.height);
  }
  const interOffsets = categoryOrder.reduce((r,c) => ({
    byCategory: {
      ...r.byCategory,
      [c]: r.lastOffset,
    },
    lastOffset: r.lastOffset + categoryHeights[c],
  }), {byCategory:{}, lastOffset: 0}).byCategory;
  const sortedOffsets = categoryOrder.map(c => interOffsets[c]);

  const onUpdateImpl = (timespan, datum, canvasY, initialCategory) => {
    if (onUpdateTime)
      onUpdateTime(timespan, datum);

    if (onUpdateCategory && canvasY !== null) {
      const idx = Math.min(sortedLastIndex(sortedOffsets, canvasY), categoryOrder.length) - 1;
      const newCat = categoryOrder[idx];
      if (idx !== -1 && newCat !== initialCategory)
        onUpdateCategory(newCat, datum);
    }
  };
  return (<React.Fragment key={key}>
    {
      flatMap(itemsByCategory, (items,category) => {
        return items.map(d => {
          const categoryOffset = interOffsets[category];
          const isSelected = selected === true || Boolean(selected.find(id => id === getId(d)));
          return (
            <Item
              key={getId(d)}
              datum={d}
              getId={getId}
              getTimespan={getTimespan}
              xOffset={offset[0]}
              yOffset={offset[1] + categoryOffset}
              height={itemHeight}
              onUpdate={(timespan, d, yOffset) => (
                onUpdateImpl(timespan, d, yOffset - offset[1], category)
              )}
              timestep={timestep}
              onSelect={doSelect => onSelect(d, doSelect)}
              selected={isSelected}
              children={itemRenderer}
              timeToPx={timeToPx}
              timePerPx={timePerPx}
              classes={classes}
              {...itemProps}
            />
          );
        });
      })
    }
    {
      Object.keys(itemsByCategory).map(cat => (<>
        <div style={{
          boxSizing: 'border-box',
          position: 'absolute',
          height: categoryHeights[cat] + 1,
          left: offset[0],
          width,
          top: offset[1] + interOffsets[cat],
          pointerEvents: 'none',
          borderTop: '1px dotted #777',
          borderBottom: '1px dotted #777',
        }}/>
        <div style={{
          boxSizing: 'border-box',
          position: 'absolute',
          height: categoryHeights[cat] + 1,
          left: 0,
          width: offset[0],
          top: offset[1] + interOffsets[cat],
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: '1px dotted #777',
        }}>
          {cat}
        </div>
      </>))
    }
    </React.Fragment>
  );
}
export default withStyles(styles, {name: 'CrkSpanLayer' })(SpanLayer);

