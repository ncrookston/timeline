import React from 'react';
import {Line} from '@nivo/line'

export default function graphCategory(props) {
  const {
    offset,
    height,
    timeToPx,
    timespan,
    data,
  } = props;

  const top = offset || 0;
  const left = timeToPx(timespan[0]);
  const right = timeToPx(timespan[1]);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        height,
        left,
        width: right - left,
      }}
    >
      <Line
        width={Math.max(right-left, 0)}
        height={height}
        margin={{top: 0, right: 0, bottom: 0, left: 0}}
        animate={false}
        isInteractive={false}
        enableSlices='x'
        enablePointLabel
        curve='monotoneX'
        data={[{id: 'tmp', data}]}
        xScale={{
          type: 'linear',
          min: timespan[0],
          max: timespan[1],
        }}
      />
    </div>
  );
}

