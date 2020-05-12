import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import {produce} from 'immer';
import {last,reduce} from 'lodash';

import Timeline, {
  getAccordianLayer,
  getFullLayer,
  getGraphLayer,
  getItemLayer
} from './Timeline';

//import CategoryMarks from './Timeline/CategoryMarks';
//import CategoryLayer from './Timeline/CategoryLayer';
//import FullSpanLayer from './Timeline/FullSpanLayer';
//import StackedSpanLayer from './Timeline/StackedSpanLayer';

const useStyles = makeStyles({
  root: {
    width: '80%',
    left: 0,
    right: 0,
    margin: 'auto',
    height: '50%',
    top: '20px',
    position: 'absolute'
  },
  timeline: {
    border: '1px solid black',
  },
  button: {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    boxShadow: 'none',
    top: 0,
    minWidth: '1px',
    minHeight: '1px',
    backgroundColor: '#6593f5',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#85b3ff',
    }
  },
  preassault: {
    backgroundColor: '#0c33',
  },
  assault: {
    backgroundColor: '#c033',
  },
  sustain: {
    backgroundColor: '#cc33',
  },
  atanchor: {
    backgroundColor: '#03c3',
  },
});

const categories = {
  a: 'Person A',
  b: 'Person B',
  c: 'Person C',
  d: 'Person D',
};
const initialData = [
  {
    id: '1',
    timespan: [0, 3],
    category: 'a'
  },
  {
    id: '2',
    timespan: [3, 7],
    category: 'a'
  },
  {
    id: '5',
    timespan: [5, 9],
    category: 'a'
  },
  {
    id: '3',
    timespan: [1, 5],
    category: 'b'
  },
  {
    id: '4',
    timespan: [5, 10],
    category: 'c'
  },
];

const classItems = [
  {
    id: 'c1',
    timespan: [1, 3],
    category: 'a'
  },
  {
    id: 'c2',
    timespan: [5, 9],
    category: 'a'
  },
];

const states = [
  {time: 0, state: 'preassault'},
  {time: 2, state: 'assault'},
  {time: 5, state: 'sustain'},
  {time: 8, state: 'atanchor'},
  {time: 10, state: null},
];
const lines = [
  {x: 0,   y: 150},
  {x: 1.5, y: 120},
  {x: 4,   y: 80},
  {x: 7.7, y: 55},
  {x: 10,  y: 99},
];

function acRenderer(state) {
  return (
    <div style={{
      width:'100%',
      height:'100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Tooltip title={state.state}><Typography>{state.state}</Typography></Tooltip>
    </div>
  );
}
function getTitle(title) {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>{title}</div>
  );
}

export default function App() {
  const [data, setData] = React.useState(initialData);
  const [bgData, setBgData] = React.useState(classItems);
  const [acData, setAcData] = React.useState(states);
  const [dData] = React.useState(lines);
  const [selectedId, setSelectedId] = React.useState(null);
  const classes = useStyles();
  const id_to_idx = reduce(data, (obj, datum, i) => ({...obj, [datum.id]: i}), {});
  const bg_id_to_idx = reduce(bgData, (obj, datum, i) => ({...obj, [datum.id]: i}), {});

  const setAcDataWrap = data => {
    setAcData(data);
  };
  const onUpdateItemTime = (newSpan, datum) => {
    //Ignore invalid spans
    if (newSpan[0] >= newSpan[1])
      return;
    setData(produce(data, draft => {
      draft[id_to_idx[datum.id]].timespan = newSpan;
    }));
  };
  const onUpdateItemCategory = (category, datum) => {
    setData(produce(data, draft => {
      draft[id_to_idx[datum.id]].category = category;
    }));
  };
  const onUpdateBg = (newSpan, datum) => {
    if (newSpan[0] >= newSpan[1])
      return;
    setBgData(produce(bgData, draft => {
      draft[bg_id_to_idx[datum.id]].timespan = newSpan;
    }));
  };
  const bgProps = {disableDrag: true, disableResize: false};
  const itemProps = {editAfterSelect: false};
  return (
    <div className={classes.root}>
      <Timeline
        className={classes.timeline}
        initialTimespan={[0,10]}
        leftSidebarWidth={150}
        minTime={1/60}
        maxTime={24 * 7 * 10}
        layers={[
            getAccordianLayer({
              title: getTitle('Availability'),
              states: acData,
              onUpdate: setAcDataWrap,
              renderer: acRenderer,
              classes
            }),
//              getStackedLayers([
                getFullLayer({
                  data: bgData,
                  onUpdateItemTime: onUpdateBg,
                  timestep: .5,
                  itemProps: bgProps
                }),
//                getItemLayer({
//                  data,
//                  categoryOrder: ['a','b','c'],
//                  onUpdateItemTime,
//                  onUpdateItemCategory,
//                  timestep: .25,
//                  selected: [selectedId],
//                  onSelect: (d, doSelect) => {
//                    setSelectedId(doSelect ? d.id : null)
//                  },
//                  itemProps
//                }),
//              ])
//            }),
          getGraphLayer({
            title: getTitle('Levels'),
            data: dData,
          }),
        ]}
      />
    </div>
  );
}

