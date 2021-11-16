import React from 'react';
import { ReactMediaRecorder } from "react-media-recorder";
import Editor from '@monaco-editor/react';
import ControlledEditor from "@monaco-editor/react";
import { Controlled as CodeMirror } from 'react-codemirror2';
import './App.css';
import { EvalResult, pyEval } from './eval/PyEval';
import Webcam from "react-webcam";
import { Animated } from 'react-animated-css';
import SwipeableViews from 'react-swipeable-views';
import VariableBox from './VariableBox';
import Pagination from './components/Pagination';
import { runCode, setEngine, setOptions, loadEngines } from 'client-side-python-runner';
import Task from 'task.js';
import Memomji from './memoji.png';
require('codemirror/lib/codemirror.css');
require('codemirror/theme/seti.css');
require('codemirror/mode/python/python');

declare var ClientSidePython: any;
declare var WorkerWindow: any;
declare var Pyodide: any;


const Dot = (props: { backgroundColor: string }) => (
  <span style={{
    height: 10,
    width: 10,
    backgroundColor: props.backgroundColor,
    borderRadius: '50%',
    display: 'inline-block',
    margin: 2.5,
  }} />
)

const WindowButtons = () => (
  <div style={{ paddingBottom: 7 }}>
    <Dot backgroundColor="#FD5F56" />
    <Dot backgroundColor="#FEBD2E" />
    <Dot backgroundColor="#26C93F" />
  </div>
)

/*const VariableBox = (props: { name: string, value: string }) => (
  <Animated
    animationIn="flipInX"
    animationOut="flipInY"
    animateOnMount={true}
    isVisible={true}
  >
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <span style={{
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        backgroundColor: '#2CE4C8',
        width: 20,
        height: 20,
        padding: 10,
        borderRadius: 5,
        fontFamily: 'Jost'
      }}>{props.value}</span>
      <span style={{ fontFamily: 'Jost', color: 'white' }}>{props.name}</span>
    </div>
  </Animated>
)*/



const startSeparator = Math.random().toString(36).substring(7);
const endSeparator = Math.random().toString(36).substring(7);

function App() {
  const editorRef = React.useRef();
  const [code, setCode] = React.useState<string>('');
  const [stdin, setStdin] = React.useState<string>('');
  const [stdout, setStdout] = React.useState<string>('');
  const [enginesLoaded, setEnginesLoaded] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>();



  React.useEffect(() => {
    pyEval(code, stdin).then((res: EvalResult) => {
      setStdout(res.output);
      setError(res?.error)
    });

    /*console.log(injectPyCode(code, startSeparator, endSeparator));
    let evalres = pyEval(injectPyCode(code, startSeparator, endSeparator), stdin);
    if (code.trim().length == 0) {
      setVariableValues([]);
      return;
    }
    if (evalres.output) {
      setVariableValues(extractVariableValues(evalres?.output, startSeparator, endSeparator));
      setStdout(evalres.output);
    }*/
  }, [code])

  const [index, setIndex] = React.useState(0);

  loadEngines(["pyodide", "skulpt", "brython"]).then(() => {
    setEnginesLoaded(true);
  })


  return (
    <div style={{  width: '100%', height: '100%' }}>
      <header style={{padding: '4px 0px 4px 0px', backgroundColor: 'white', width: '100%', borderRadius: '0 0 10px 10px', boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{backgroundColor: '#FF3693', marginLeft: 50, borderRadius: 20, color: 'white', padding: 10, fontSize: 10, fontWeight: 700, fontFamily: 'Muller'}}>P1 Lab Playground</span>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 50}}>
          <span style={{fontFamily: 'Muller', fontWeight: 700, color: '#FF3693', fontSize: 16}}>Alex Ionașcu</span>
          <img src={Memomji} height={50}  />
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 25,  flexDirection: 'row', width: '100%', height: '100%', padding: 15, flexWrap: 'wrap' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            flex: 2,
            height: 500,
            minWidth: 500,
            padding: 15,
            resize: 'horizontal',

            borderRadius: 20,
            boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
            position: 'relative'
          }}>
            <WindowButtons />

            <SwipeableViews index={index} onChangeIndex={(newIndex: number) => setIndex(newIndex)}>
              <CodeMirror
                className="code-editor"
                value={code}
                options={{
                  mode: 'python',
                  theme: 'default'
                }}
                onBeforeChange={(editor, data, value) => {
                  setCode(value);
                }}
              />

              <div>
                <h1>hello</h1>
              </div>
            </SwipeableViews>

            <Pagination dots={3} index={index} onChangeIndex={(newIndex: number) => setIndex(newIndex)} />
            {error &&
              <div style={{ position: 'absolute', bottom: 15, margin: 'auto', maxWidth: 350, fontSize: 10, fontWeight: 700, textAlign: 'center', right: 0, left: 0, background: '#FF3693', color: 'white', padding: 15, borderRadius: 25 }}>
                {(error as any)}
              </div>
            }
          </div>

        
        <div style={{
          flex: 1,
          height: 500,
          padding: 15,
          minWidth: 500,
          overflow: 'scroll',
          position: 'relative',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          background: '#FFFFFF',
          borderRadius: "25px 0px 0px 25px",
          boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
          flexDirection: 'column'
        }}>
          <SwipeableViews index={index} onChangeIndex={(newIndex: number) => setIndex(newIndex)}>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', background: '#FCFCFF', flex: 1, padding: 10, margin: 35, borderRadius: 20, boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px' }}>
                <h2 style={{ color: '#FF3693', marginLeft: 20 }}>Input</h2>
                <textarea style={{ flex: '1 1', border: 'none', background: 'transparent', resize: 'none' }}
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                />

              </div>

              <div style={{ display: 'flex', flexDirection: 'column', background: '#FCFCFF', flex: 1, padding: 10, margin: 35, borderRadius: 20, boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px' }}>
                <h2 style={{ color: '#FF3693', marginLeft: 20 }}>Output</h2>
                <textarea style={{ flex: '1 1', border: 'none', background: 'transparent', resize: 'none' }}
                  value={stdout}
                />
              </div>
            </div>
            <div>
              <h2>Hey</h2>
            </div>
          </SwipeableViews>
          <Pagination dots={2} index={index} onChangeIndex={(newIndex: number) => setIndex(newIndex)} />
        </div>

      </div>


      {/*<header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <ReactMediaRecorder
          screen
          video={{
            frameRate: 30,
          }}
          render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
            <div>
              <p>{status}</p>
              <button onClick={startRecording}>Start Recording</button>
              <button onClick={stopRecording}>Stop Recording</button>
              <video src={mediaBlobUrl ?? ''} controls={true} autoPlay={true} loop={true} />
              <button onClick={() => {
                let anchor = document.createElement('a');
                document.body.appendChild(anchor);
              
                (anchor as any).style = 'display: none';
                (anchor as any).href = mediaBlobUrl;
                anchor.download = 'file';
                anchor.click();
              
                document.body.removeChild(anchor);
              }}>download</button>
            </div>
          )}
        />
      </header>
            </div>*/}
    </div>);
}

export default App;