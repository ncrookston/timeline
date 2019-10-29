import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

//import './App.css';
import Timeline from './Timeline';

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
const data = [
  {
    id: '1',
    span: [0, 4],
    group: 'a'
  },
  {
    id: '2',
    span: [3, 7],
    group: 'a'
  },
  {
    id: '5',
    span: [5, 9],
    group: 'a'
  },
  {
    id: '3',
    span: [1, 5],
    group: 'b'
  },
  {
    id: '4',
    span: [5, 10],
    group: 'c'
  },
];

function App() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Timeline
        groups={groups}
        data={data}
        initialSpan={[0,10]}
      />
    </div>
  );
}

export default App;
