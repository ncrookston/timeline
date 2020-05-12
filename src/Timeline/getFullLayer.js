import React from 'react';
import {withStyles} from '@material-ui/core/styles';

import {groupBy} from 'lodash';
import clsx from 'clsx';

import SpanLayer from './SpanLayer';

export const styles = theme => ({
  item: {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#73c2fb73',
    border: '1px solid #9999',
  },
});

export default function getFullLayer(props) {
  let {
    categoryOrder,
    minHeight = 40,

    data,

    selected,
    onSelect,
    itemRenderer,
    itemProps,
    onUpdateItemTime,
    onUpdateItemCategory,
    timestep,

    getCategory = item => item.category,
    getId = item => item.id,
    getTimespan = item => item.timespan,
  } = props;

  const itemsByCategory = groupBy(data, getCategory);
  if (!categoryOrder)
    categoryOrder = Object.keys(itemsByCategory);
  return {
    getHeight: () => categoryOrder.length * height,
    render: rprops => {
      const {
        timespan,//TODO: Use this to reduce the number of states displayed.
        timeToPx,
        pxToTime,
        width,
        height,
        offset,
        key,
      } = rprops;
      return (
        <SpanLayer
          categoryOrder={categoryOrder}
          itemsByCategory={itemsByCategory}
          getTimespan={getTimespan}
          getId={getId}
          itemRenderer={itemRenderer}
          itemProps={itemProps}
          onUpdateTime={onUpdateItemTime}
          onUpdateCategory={onUpdateItemCategory}
          timestep={timestep}
          selected={selected}
          onSelect={onSelect}
          timeToPx={timeToPx}
          pxToTime={pxToTime}
          width={width}
          {...rprops}
        />
      );
    },
  };
}

//export default withStyles(styles, {name: 'CrkFullSpanLayer' })(FullSpanLayer);

