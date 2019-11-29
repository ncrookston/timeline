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
    offsets.map((offset,idx) => (
      <div
        key={categoryOrder[idx]}
        className={classes.category}
        style={{
          top: offset + 'px',
          height: categoryHeights[categoryOrder[idx]] + 'px',
          width: containerWidthPx + 'px',
        }}
      />
    ))
  );
}

