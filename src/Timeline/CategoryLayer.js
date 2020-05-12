
import React from 'react';
import {withStyles} from '@material-ui/styles';

import {
  fromPairs,
  initial,
  zip
} from 'lodash';
import uuid from 'uuid/v4';

import getOrderedOffsets from './getOrderedOffsets';

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

function CategoryLayer(props) {
  const {
    categoryRenderers,
  } = props;

  const {
    categoryOrder,
    categoryHeights,
    setCategoryHeights,
    timeToPx,
    timePerPx,
    timespan,
    canvasWidthPx,
  } = React.useContext(Context);

  const [layerId,] = React.useState(uuid());
  //TODO: useMemo
  const [heights, renderers] = categoryOrder.reduce((r,cat) => {
    let n = [0, () => {}];
    if (categoryRenderers[cat])
      n = [categoryRenderers[cat][0], categoryRenderers[cat][1]];
    return [r[0].concat(n[0]), r[1].concat(n[1])];
  }, [[],[]]);

  React.useEffect(() => {
    setCategoryHeights(layerId, fromPairs(zip(categoryOrder, heights)));
  }, [setCategoryHeights, layerId, categoryOrder, heights]);
  const offsets = initial(getOrderedOffsets(categoryOrder, categoryHeights));
  return (<>
    {
      zip(categoryOrder, offsets, heights, renderers).map(
        ([category, offset, height, renderer]) => (<div key={category}>{
          renderer({
            category,
            offset,
            height,
            timeToPx,
            timePerPx,
            timespan,
            canvasWidthPx
          })
        }</div>)
      )
    }
  </>);
}
export default withStyles(styles, {name: 'CrkCategoryLayer' })(CategoryLayer);

