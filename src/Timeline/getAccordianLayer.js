import React from 'react';
import clsx from 'clsx';
import {produce} from 'immer';

import {Draggable} from './Draggable';

export default function getAccordianLayer(props) {
   const {
    title,
    states,
    onUpdate,
    renderer=() => null,
    classes,
    className,
  } = props;

  return {
    getHeight: () => 40,
    render: rprops => {
      const {
        //timespan,//TODO: Use this to reduce the number of states displayed.
        timeToPx,
        pxToTime,
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
          position: 'absolute',
          height,
          left: 0,
          width: offset[0],
          top: offset[1],
        }}>
          {title}
        </div>
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
                  position: 'absolute',
                  top: offset[1],
                  height,
                  left: left + offset[0],
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
                left: right + offset[0] - 2,
                width: 5,
                top: offset[1],
                height,
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
      </React.Fragment>);
    }
  };
}

