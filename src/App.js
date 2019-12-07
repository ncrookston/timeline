import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import {produce} from 'immer';
import {last,reduce} from 'lodash';

import Timeline from './Timeline';
import CategoryMarks from './Timeline/CategoryMarks';
import TimeMarks from './Timeline/TimeMarks';
import MouseControlCanvas from './Timeline/MouseControlCanvas';
import {LeftSidebar} from './Timeline/Sidebar';
import {TopTimeLabel} from './Timeline/TimeLabel';

import FullSpanLayer from './Timeline/FullSpanLayer';
import StackedSpanLayer from './Timeline/StackedSpanLayer';

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
});

const categories = [
  {
    id: 'a',
    name: 'Person A',
  },
  {
    id: 'b',
    name: 'Person B',
  },
  {
    id: 'c',
    name: 'Person C',
  },
];
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

function getMarks(timePerPx, minPx) {
  const breaks = [
    [24*7, timeH => `Week ${timeH / (24*7)}`],
    [24, timeH => `Day ${timeH / 24}`],
    [1, timeH => `Hour ${timeH}`],
    [1/4, timeH => (timeH * 4 * 15) % 60],
    [1/60, timeH => `M ${Math.round(timeH * 60) % 60}`],
    [1/3600, timeH => `S ${Math.round(timeH * 3600) % 60}`]
  ];
  return breaks.find(obj => obj[0] / timePerPx < minPx) || last(breaks);
}

export default function App() {
  const [data, setData] = React.useState(initialData);
  const [bgData, setBgData] = React.useState(classItems);
  const [selectedId, setSelectedId] = React.useState(null);
  const classes = useStyles();
  const id_to_idx = reduce(data, (obj, datum, i) => ({...obj, [datum.id]: i}), {});
  const bg_id_to_idx = reduce(bgData, (obj, datum, i) => ({...obj, [datum.id]: i}), {});

  const onItemUpdateTime = (newSpan, datum) => {
    //Ignore invalid spans
    if (newSpan[0] >= newSpan[1])
      return;
    setData(produce(data, draft => {
      draft[id_to_idx[datum.id]].timespan = newSpan;
    }));
  };
  const onUpdateCategory = (category, datum) => {
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
  return (
    <div className={classes.root}>
      <Timeline
        className={classes.timeline}
        initialTimespan={[0,10]}
        categoryOrder={['c','a','b']}
        minTime={1/60}
        maxTime={24*10}
      >
        <TopTimeLabel labelMarks={tpp => getMarks(tpp,1000)} />
        <LeftSidebar
          categoryInfo={categories}
        />
        <MouseControlCanvas>
          <CategoryMarks />
          <TimeMarks labelMarks={tpp => getMarks(tpp,240)} />
          <FullSpanLayer
            items={bgData}
            onUpdateTime={onUpdateBg}
            timestep={1}
            itemProps={{disableDrag: true, disableResize: true}}
          />
          <StackedSpanLayer
            items={data}
            onUpdateTime={onItemUpdateTime}
            onUpdateCategory={onUpdateCategory}
            timestep={.5}
            selected={[selectedId]}
            onSelect={(id,doSelect) => setSelectedId(doSelect ? id : null)}
            itemRenderer={datum => (
              <Button className={classes.button} variant="contained">
                {datum.id}
              </Button>
            )}
            itemProps={{editAfterSelect:true}}
          />
        </MouseControlCanvas>
      </Timeline>
    </div>
  );
}
