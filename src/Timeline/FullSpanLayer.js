import React from 'react';
import {withStyles} from '@material-ui/core/styles';

import clsx from 'clsx';

import HeterogeneousLayer from './HeterogeneousLayer';

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
  const getRenderHeights = ({heights}) => {
    return ({heights: cat => heights[cat], getIntraOffsets: d => 0});
  };
  return (<HeterogeneousLayer
    getCategoryRenderOffsets={getRenderHeights}
    selected={true}
    itemRenderer={datum => <div className={clsx(props.classes.item, props.className)} />}
    {...props}
  />);
}

export default withStyles(styles, {name: 'CrkFullSpanLayer' })(FullSpanLayer);

