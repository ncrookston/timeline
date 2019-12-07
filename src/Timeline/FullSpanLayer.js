import React from 'react';
import {withStyles} from '@material-ui/core/styles';

import {fromPairs, initial, zip} from 'lodash';
import clsx from 'clsx';

import getOrderedOffsets from './getOrderedOffsets';
import Context from './Context';
import Item from './Item';

export const styles = theme => ({
  item: {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#73c2fb73',
    border: '1px solid #9999',
  },
});

function FullSpanLayer(props) {
  const {
    items,
    onUpdateTime = null,
    getCategory = item=>item.category,
    getId = item => item.id,
    getTimespan = item => item.timespan,
    timestep = null,
    classes,
    className = null,
    itemRenderer = datum => <div className={clsx(classes.item, className)} />,
    itemProps,
  } = props;
  const {
    categoryOrder,
    categoryHeights,
  } = React.useContext(Context);

  const offsets = getOrderedOffsets(categoryOrder, categoryHeights);
  const offsetsByCat = fromPairs(zip(categoryOrder, initial(offsets)));
  const onUpdateImpl = (timespan, datum, canvasY) => {
    if (onUpdateTime)
      onUpdateTime(timespan, datum);
  };
  return (<>
    {
      items.map(d => {
        return (
          <Item
            key={getId(d)}
            datum={d}
            getId={getId}
            getTimespan={getTimespan}
            yOffset={offsetsByCat[getCategory(d)]}
            height={categoryHeights[getCategory(d)]}
            onSelect={() => {}}
            selected={true}
            onUpdate={onUpdateImpl}
            timestep={timestep}
            {...itemProps}
          >
          { itemRenderer }
          </Item>
        );
      })
    }
  </>);
}

export default withStyles(styles, {name: 'CrkFullSpanLayer' })(FullSpanLayer);

