import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

import {produce} from 'immer';
import {reduce} from 'lodash';

import Timeline from './Timeline';
import TimeMarks from './Timeline/TimeMarks';
import MouseControlCanvas from './Timeline/MouseControlCanvas';
import {LeftSidebar,RightSidebar} from './Timeline/Sidebar';
import {TopTimeLabel} from './Timeline/TimeLabel';
import TimespanLayer from './Timeline/TimespanLayer';

const useStyles = makeStyles({
  root: {
    width: '80%',
    left: 0,
    right: 0,
    margin: 'auto',
    height: '50%',
    top: '20px',
    //border: '1px solid red',
    position: 'absolute'
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

export default function App() {
  const [data, setData] = React.useState(initialData);
  const classes = useStyles();
  const id_to_idx = reduce(data, (obj, datum, i) => ({...obj, [datum.id]: i}), {});

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
  return (
    <div className={classes.root}>
      <Timeline
        initialTimespan={[0,10]}
        categoryOrder={['c','a','b']}
        header={TopTimeLabel}
      >
        <LeftSidebar
          categoryInfo={categories}
        />
        <MouseControlCanvas>
          <TimeMarks markStep={2} />
          <TimespanLayer
            items={data}
            onUpdateTime={onItemUpdateTime}
            onUpdateCategory={onUpdateCategory}
            timestep={.5}
          />
        </MouseControlCanvas>
      </Timeline>
    </div>
  );
}
