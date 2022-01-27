import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { Link, Route } from "wouter";
import Playground from './Playground';
import { ChallengePage } from './pages/ChallengePage';
import './Theme.css';

ReactDOM.render(
  <React.StrictMode>
      <Route path="/editor">
        {() => <Playground mode="editor" />}
      </Route>

      <Route path="/challenge">
        {() => <ChallengePage language="C++" title="Daily Queue" />}
      </Route>

      <Route path="/">
        {() => <Playground mode="workspace" />}
      </Route>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
