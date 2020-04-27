import React from 'react';
import clsx from 'clsx';
import {produce} from 'immer';
import {Draggable} from './Draggable';

export default function accordianCategory(props) {
  const {
    offset,
    height,
    timeToPx,
    timePerPx,
    states,
    onUpdate,
    classes,
    className,
  } = props;

  const allClasses = {
    handle: {
     backgroundColor: '#0005',
    },
    ...classes
  };
  const top = offset || 0;
  return (<>
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
              top,
              height,
              left,
              width: right - left,
            }}
          >
            {
              (i < states.length - 2) && <div className={allClasses.handle} style={{
                boxSizing: 'border-box',
                position: 'absolute',
                right: 0,
                width: 3,
                top: 0,
                height,
              }}>
              <Draggable
                onDrag={(evt,info) => {
                  if (info.hasMoved) {
                    onUpdate(produce(states, draft => {
                      draft[i + 1].time += info.delta[0] * timePerPx;
                      if (draft[i+1].time < draft[i].time)
                        draft[i+1].time = draft[i].time;
                      if (draft[i+2].time < draft[i+1].time)
                        draft[i+1].time = draft[i+2].time;
                    }));
                  }
                }}
                cursor='col-resize'
                onClick={()=>{}}
              />
              </div>
            }
          </div>
        );
      })
    }
  </>);
}

