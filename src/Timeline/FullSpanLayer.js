import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

import {fromPairs, initial, zip} from 'lodash';

import getOrderedOffsets from './getOrderedOffsets';
import Context from './Context';
import Item from './Item';

const useStyles = makeStyles({
  item: {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#73c2fb73',
    border: '1px solid #9999',
    //background: 'repeating-linear-gradient(45deg,#606dbc,#606dbc 10px,#465298 10px, #465298 20px)',
    //'&:hover': {
    //  background: 'repeating-linear-gradient(45deg,#465298,#465298 10px,#606dbc 10px, #606dbc 20px)',
    //}
  },
});
export default function FullSpanLayer({
  items,
  onUpdateTime=null,
  getCategory=item=>item.category,
  getId=item=>item.id,
  getTimespan=item=>item.timespan,
  timestep=null,
}) {
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
  const classes = useStyles();
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
          >
            {datum => <div className={classes.item} variant="contained" />}
          </Item>
        );
      })
    }
  </>);
}

