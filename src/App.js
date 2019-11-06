import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import {produce} from 'immer';
import {reduce} from 'lodash';

import Timeline from './Timeline';
import Sidebar from './Timeline/Sidebar';
//import StackedCanvas from './StackedCanvas';
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

const groups = [
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
    group: 'a'
  },
  {
    id: '2',
    timespan: [3, 7],
    group: 'a'
  },
  {
    id: '5',
    timespan: [5, 9],
    group: 'a'
  },
  {
    id: '3',
    timespan: [1, 5],
    group: 'b'
  },
  {
    id: '4',
    timespan: [5, 10],
    group: 'c'
  },
];

function App() {
  const [data, setData] = React.useState(initialData);
  const classes = useStyles();
  //const id_to_idx = fromPairs(toPairs(data).map((p,i) => [p[0], i]));
  const id_to_idx = reduce(data, (obj, datum, i) => ({...obj, [datum.id]: i}), {});

  const onItemUpdate = (newSpan, datum) => {
    setData(produce(data, draft => {
      draft[id_to_idx[datum.id]].timespan = newSpan.map(v => Math.min(Math.max(v,0),10));
    }));
  };
  return (
    <div className={classes.root}>
      <Timeline
        initialTimespan={[0,10]}
        rowOrder={['c','a','b']}
      >
        <Sidebar
          rowInfo={groups}
        />
        <TimespanLayer
          items={data}
          onUpdate={onItemUpdate}
        />
      </Timeline>
    </div>
  );
}

//  return (
//    <div className={classes.root}>
//      <Timeline
//        initialTimespan={[0,10]}
//        rowOrder={['c','a','b']}
//      >
//        <Sidebar
//          //Sidebar interactions
//          groups={groups}
//        />
//        <StackedCanvas
//          //Canvas interactions
//          //Should this be responsible for stacking vs overlapping vs anything else?
//          //Currently thinking we shouldn't bother with this abstraction, just
//          // put it in the base timeline. Or a different layer, probably.
//        >
//          <TimespanLayer
//            //Item interactions
//            items={data}
//            onUpdate={onItemUpdate}
//          />
//        </StackedCanvas>
//      </Timeline>
//    </div>
//  );
export default App;
