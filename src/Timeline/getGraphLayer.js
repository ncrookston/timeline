import React from 'react';
import {Line} from '@nivo/line'

export default function getGraphLayer(props) {
  const {
    title,
    height = 100,
    data,
  } = props;

  return {
    getHeight: () => height,
    render: rprops => {
      const {
        timespan,
        height,
        width,
        offset,
        key,
      } = rprops;

      return (<React.Fragment key={key}>
        <div style={{
          boxSizing: 'border-box',
          position: 'absolute',
          height,
          left: 0,
          width: offset[0],
          top: offset[1],
          border: '1px dotted #777',
          backgroundColor: 'white',
        }}>
          {title}
        </div>
        <div
          style={{
            position: 'absolute',
            top: offset[1],
            height,
            left: offset[0],
            width,
            pointerEvents: 'none',
          }}
        >
          <Line
            width={Math.max(width, 0)}
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
      </React.Fragment>);
    }
  };
}

