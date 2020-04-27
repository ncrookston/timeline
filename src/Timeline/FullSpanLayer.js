import React from 'react';
import {withStyles} from '@material-ui/core/styles';

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

function FullSpanLayer(props) {
  const {
    selected = true,
    ...other
  } = props;
  const getRenderHeights = ({heights}) => {
    return ({heights: cat => heights[cat], getIntraOffsets: d => 0});
  };
  return (<SpanLayer
    getCategoryRenderOffsets={getRenderHeights}
    selected={selected}
    itemRenderer={datum => <div className={clsx(other.classes.item, other.className)} />}
    {...other}
  />);
}

export default withStyles(styles, {name: 'CrkFullSpanLayer' })(FullSpanLayer);

