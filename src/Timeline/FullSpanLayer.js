import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

import {fromPairs, initial, zip} from 'lodash';

import getOrderedOffsets from './getOrderedOffsets';
import Context from './Context';
import {LeftResizable,RightResizable} from './Draggable';

const useStyles = makeStyles({
  item: {
    background: 'repeating-linear-gradient(45deg,#606dbc,#606dbc 10px,#465298 10px, #465298 20px)',
    position: 'absolute',
    boxSizing: 'border-box',
    '&:hover': {
      background: 'repeating-linear-gradient(45deg,#465298,#465298 10px,#606dbc 10px, #606dbc 20px)',
    }
  },
  left: {
    position: 'absolute',
    left: 0,
    width: '3px',
    top: 0,
    height: '100%',
    backgroundColor: '#0002',
  },
  right: {
    position: 'absolute',
    right: 0,
    width: '3px',
    top: 0,
    height: '100%',
    backgroundColor: '#0002',
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
    timeStart,
    timePerPx,
  } = React.useContext(Context);
  const offsets = getOrderedOffsets(categoryOrder, categoryHeights);
  const offsetsByCat = fromPairs(zip(categoryOrder, initial(offsets)));
  const toPx = t => (t - timeStart) / timePerPx;
  const snap = time => timestep ? timestep * Math.round(time / timestep) : time;
  const onResize = (datum, newSizePx, side) => {
    let newSpan = [...datum.timespan];
    if (side === 'left')
      newSpan[0] = newSpan[1] - snap(newSizePx * timePerPx);
    else
      newSpan[1] = newSpan[0] + snap(newSizePx * timePerPx);
    if (newSpan[0] > newSpan[1])
      newSpan[1] = newSpan[0];
    onUpdateTime(newSpan, datum);
  };
  const classes = useStyles();
  return (<>
    {
      items.map(d => {
        const left = toPx(getTimespan(d)[0]);
        const right = toPx(getTimespan(d)[1]);
        const width = right - left;
        return (
          <div
            key={getId(d)}
            className={classes.item}
            style={{
              left,
              width,
              top: offsetsByCat[getCategory(d)],
              height: categoryHeights[getCategory(d)],
            }}
          >
          {onUpdateTime && <>
            <div
              className={classes.left}
            >
              <LeftResizable
                size={width}
                minSize={0}
                onResize={newSize => onResize(d, newSize, 'left')}
              />
            </div>
            <div
              className={classes.right}
            >
              <RightResizable
                size={width}
                minSize={0}
                onResize={newSize => onResize(d, newSize, 'right')}
              />
            </div>
          </>}
          </div>
        );
      })
    }
    </>
  );
}

