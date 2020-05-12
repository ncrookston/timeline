import React from 'react';
import clsx from 'clsx';
import {produce} from 'immer';

import {Draggable} from './Draggable';

export default function getAccordianLayer(props) {
   const {
    title,
    states,
    onUpdate,
    height = 40,
    renderer=() => null,
    classes,
    className,
  } = props;

  return {
    getHeight: () => height,
    render: rprops => {
      const {
        timespan,//TODO: Use this to reduce the number of states displayed.
        timeToPx,
        pxToTime,
        width,
        height,
        offset,
        key,
      } = rprops;

      const allClasses = {
        handle: {
         backgroundColor: '#0005',

        },
        ...classes
      };
      return (<React.Fragment key={key}>
        <div style={{
          boxSizing: 'border-box',
          position: 'absolute',
          height: height+1,
          left: 0,
          width: offset[0],
          top: offset[1],
          border: '1px dotted #777',
          backgroundColor: 'white',
        }}>
          {title}
        </div>
        <div style={{
            boxSizing: 'border-box',
            position: 'absolute',
            left: offset[0],
            width,
            top: offset[1],
            height: height+1, 
            overflow: 'hidden',
          }}
        >
        {
          states.map((s,i) => {
            if (i === states.length - 1)
              return null;
            const left = timeToPx(s.time);
            const right = timeToPx(states[i+1].time);
            return (
              <div
                key={i}
                className={clsx({backgroundColor: '#0c25'}, allClasses[s.state], className)}
                style={{
                  overflow: 'hidden',
                  position: 'absolute',
                  top: 0,
                  height,
                  left,
                  width: right - left,
                }}
              >
              {renderer(s)}
              </div>
            );
          })
        }
        {
          states.map((s,i) => {
            if (i === 0 || i === states.length - 1)
              return null;
            const right = timeToPx(states[i].time);
            return (
              <div key={i} className={allClasses.handle} style={{
                boxSizing: 'border-box',
                position: 'absolute',
                left: right - 2,
                width: 5,
                top: 0,
                height,
//                backgroundColor: '#000a',
              }}>
                <Draggable
                  limits={[timeToPx([states[i-1].time, states[i+1].time]).map(
                    v => v - timeToPx(states[i].time)
                  )]}
                  onDrag={(evt,info) => {
                    if (info.hasMoved) {
                      onUpdate(produce(states, draft => {
                        draft[i].time = pxToTime(
                          timeToPx(draft[i].time) + info.delta[0]
                        );
                        if (draft[i].time < draft[i-1].time) {
                          draft[i].time = draft[i-1].time;
                        }
                        if (draft[i+1].time < draft[i].time) {
                          draft[i].time = draft[i+1].time;
                        }
                      }));
                    }
                  }}
                  cursor='col-resize'
                  onClick={()=>{}}
                />
              </div>
            );
          })
        }
        </div>
      </React.Fragment>);
    }
  };
}

