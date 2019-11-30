import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

import getOrderedOffsets from './getOrderedOffsets';
import Context from './Context';

const useStyles = makeStyles({
  category: {
    left: 0,
    position: 'absolute',
    borderBottom: '1px solid orange',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  },
});

export default function TimeMarks({labelMarks}) {
  const classes = useStyles();
  const {
    categoryHeights,
    categoryOrder,
    containerWidthPx,
  } = React.useContext(Context);

  const offsets = getOrderedOffsets(categoryOrder, categoryHeights);
  return (
    categoryOrder.map((category,idx) => {
      return (
      <div
        key={category}
        className={classes.category}
        style={{
          top: offsets[idx] + 'px',
          height: categoryHeights[category] + 'px',
          width: containerWidthPx + 'px',
        }}
      />
    )})
  );
}

