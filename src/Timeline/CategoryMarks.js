import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import clsx from 'clsx';

import getOrderedOffsets from './getOrderedOffsets';
import Context from './Context';

export const styles = theme => ({
  category: {
    left: 0,
    position: 'absolute',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  },
  category0: {
    backgroundColor: '#eee',
  },
  category1: {
    backgroundColor: '#fff',
  },
});

function CategoryMarks(props) {
  const {
    classes,
    className,
  } = props;
  const {
    categoryHeights,
    categoryOrder,
    containerWidthPx,
    patternSize = 2,
  } = React.useContext(Context);

  const offsets = getOrderedOffsets(categoryOrder, categoryHeights);
  return (
    categoryOrder.map((category,idx) => {
      return (
      <div
        key={category}
        className={clsx(classes.category, classes[`category${idx%patternSize}`], className)}
        style={{
          top: offsets[idx] + 'px',
          height: categoryHeights[category] + 'px',
          width: containerWidthPx + 'px',
        }}
      />
    )})
  );
}

export default withStyles(styles, {name: 'CrkCategoryMarks'})(CategoryMarks);

