import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { Link, Route } from "wouter";
import Playground from './Playground';

ReactDOM.render(
  <React.StrictMode>
      <Route path="/playground">
        {() => <Playground isWorkspace={true} />}
      </Route>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
