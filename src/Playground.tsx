import React from 'react'
import { Controlled as CodeMirror } from 'react-codemirror2'
import './Playground.css'
import { EvalResult, pyEval, Variable } from './eval/PyEval'
import Webcam from 'react-webcam'
import { Animated } from 'react-animated-css'
import SwipeableViews from 'react-swipeable-views'
import VariableBox from './VariableBox'
import Pagination from './components/Pagination'
import YAML from 'yaml'
import Memomji from './memoji.png'
import { exception } from 'console'
require('codemirror/lib/codemirror.css')
require('codemirror/theme/seti.css')
require('codemirror/mode/python/python')

const Dot = (props: { backgroundColor: string }) => (
    <span
        style={{
            height: 10,
            width: 10,
            backgroundColor: props.backgroundColor,
            borderRadius: '50%',
            display: 'inline-block',
            margin: 2.5,
        }}
    />
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

const startSeparator = Math.random().toString(36).substring(7)
const endSeparator = Math.random().toString(36).substring(7)

interface PlaygroundProps {
    isWorkspace: boolean
}

interface TestResult {
    name: string
    output: string
    passed: boolean
}

const initialTestingInput = `test1: |
   3
   1 2 3

test2: |
   5
   1 2 3 4 5
`

const initialCode = `# here goes your Python code`

const initialTestngCode = `# here goes your testing code`

function Playground(props: PlaygroundProps) {
    const editorRef = React.useRef()
    const [code, setCode] = React.useState<string>(initialCode)
    const [stdin, setStdin] = React.useState<string>('')
    const [stdout, setStdout] = React.useState<string>('')
    const [enginesLoaded, setEnginesLoaded] = React.useState<boolean>(false)
    const [error, setError] = React.useState<string>()
    const [variables, setVariables] = React.useState<Variable[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [testingCode, setTestingCode] = React.useState(initialTestngCode)
    const [testingInput, setTestingInput] = React.useState(initialTestingInput)
    const [codeEditorIdx, setCodeEditorIdx] = React.useState(0)
    const [panelIdx, setPanelIdx] = React.useState(0)
    const [testIdxToRun, setTestIdxToRun] = React.useState(0)
    const [testResults, setTestResults] = React.useState<{
        [key: string]: TestResult
    }>({})

    React.useEffect(() => {
        pyEval(code + '\n', stdin).then((res: EvalResult) => {
            if (variables.length > 0 && res?.error) {
                setIsLoading(true)
            } else {
                setIsLoading(false)
            }

            setStdout(res.output)
            setError(res?.error)
            if (!res?.error) {
                setVariables(res?.variables ?? [])
                // start to run the tests
                setTestIdxToRun(0)
            }
            console.log(res)
        })
    }, [code, stdin, testingCode, testingInput])

    React.useEffect(() => {
        try {
            const tests = YAML.parse(testingInput)
            const testNames = Object.keys(tests)

            if (testIdxToRun >= Object.keys(tests).length || !tests) {
                return
            }

            let testName = testNames[testIdxToRun]

            pyEval(code + '\n' + testingCode, tests[testName])
                .then((testRes: EvalResult) => {
                    setTestResults({
                        ...testResults,
                        [testName]: {
                            name: testName,
                            output: testRes.output,
                            passed: testRes?.error ? false : true,
                        },
                    })
                })
                .then(() => setTestIdxToRun(testIdxToRun + 1))
        } catch (err) {
            // YAML parse fails
            console.log(err)
            setError(err.toString())
        }
    }, [testIdxToRun])

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <header
                style={{
                    padding: '4px 0px 4px 0px',
                    backgroundColor: 'white',
                    width: '100%',
                    borderRadius: '0 0 10px 10px',
                    boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }}
            >
                <span
                    style={{
                        backgroundColor: '#FF3693',
                        marginLeft: 50,
                        borderRadius: 20,
                        color: 'white',
                        padding: 10,
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: 'Muller',
                    }}
                >
                    P1 Lab Playground
                </span>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 50,
                    }}
                >
                    <span
                        style={{
                            fontFamily: 'Muller',
                            fontWeight: 700,
                            color: '#FF3693',
                            fontSize: 16,
                        }}
                    >
                        Alex Ionașcu
                    </span>
                    <img src={Memomji} height={50} />
                </div>
            </header>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 25,
                    flexDirection: 'row',
                    width: '100%',
                    height: '100%',
                    padding: 15,
                    flexWrap: 'wrap',
                }}
            >
                <div
                    style={{
                        backgroundColor: '#FFFFFF',
                        flex: 2,
                        height: 500,
                        minWidth: 500,
                        padding: 15,
                        resize: 'horizontal',

                        borderRadius: 20,
                        boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
                        position: 'relative',
                    }}
                >
                    <WindowButtons />

                    <SwipeableViews
                        index={codeEditorIdx}
                        onChangeIndex={(newIndex: number) =>
                            setCodeEditorIdx(newIndex)
                        }
                        style={{ height: '100%' }}
                    >
                        <CodeMirror
                            className="code-editor"
                            value={code}
                            options={{
                                mode: 'python',
                                theme: 'default',
                            }}
                            onBeforeChange={(editor, data, value) => {
                                setCode(value)
                            }}
                        />

                        <CodeMirror
                            className="code-editor"
                            value={testingCode}
                            options={{
                                mode: 'python',
                                theme: 'default',
                            }}
                            onBeforeChange={(editor, data, value) => {
                                setTestingCode(value)
                            }}
                        />

                        <CodeMirror
                            className="code-editor"
                            value={testingInput}
                            options={{
                                mode: 'text/x-yaml',
                                theme: 'default',
                            }}
                            onBeforeChange={(editor, data, value) => {
                                setTestingInput(value)
                            }}
                        />
                    </SwipeableViews>

                    <Pagination
                        dots={3}
                        index={codeEditorIdx}
                        onChangeIndex={(newIndex: number) =>
                            setCodeEditorIdx(newIndex)
                        }
                    />

                    {error && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 15,
                                margin: 'auto',
                                maxWidth: 350,
                                fontSize: 10,
                                fontWeight: 700,
                                textAlign: 'center',
                                right: 0,
                                left: 0,
                                background: '#FF3693',
                                color: 'white',
                                padding: 15,
                                borderRadius: 25,
                            }}
                        >
                            {error as any}
                        </div>
                    )}
                </div>

                <div
                    style={{
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
                        borderRadius: 25,
                        boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
                        flexDirection: 'column',
                    }}
                >
                    <SwipeableViews
                        index={panelIdx}
                        onChangeIndex={(newIndex: number) =>
                            setPanelIdx(newIndex)
                        }
                        style={{ height: '100%' }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                height: '100%',
                                flexDirection: 'column',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    background: '#FCFCFF',
                                    flex: 1,
                                    padding: 10,
                                    margin: 35,
                                    borderRadius: 20,
                                    boxShadow:
                                        'rgba(0, 0, 0, 0.16) 0px 1px 4px',
                                }}
                            >
                                <h2
                                    style={{ color: '#FF3693', marginLeft: 20 }}
                                >
                                    Input
                                </h2>
                                <textarea
                                    style={{
                                        fontSize: 10,
                                        flex: '1 1',
                                        border: 'none',
                                        background: 'transparent',
                                        resize: 'none',
                                    }}
                                    value={stdin}
                                    onChange={(e) => setStdin(e.target.value)}
                                />
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    background: '#FCFCFF',
                                    flex: 1,
                                    padding: 10,
                                    margin: 35,
                                    borderRadius: 20,
                                    boxShadow:
                                        'rgba(0, 0, 0, 0.16) 0px 1px 4px',
                                }}
                            >
                                <h2
                                    style={{ color: '#FF3693', marginLeft: 20 }}
                                >
                                    Output
                                </h2>
                                <textarea
                                    style={{
                                        fontSize: 10,
                                        flex: '1 1',
                                        border: 'none',
                                        background: 'transparent',
                                        resize: 'none',
                                    }}
                                    value={stdout}
                                />
                            </div>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 15,
                                padding: 30,
                            }}
                        >
                            {variables.map((v, i) => (
                                <VariableBox
                                    loading={isLoading}
                                    colorOrder={i}
                                    variableName={v.name}
                                    variableValue={v.value}
                                    key={i}
                                />
                            ))}
                        </div>
                    </SwipeableViews>
                    <Pagination
                        dots={2}
                        index={panelIdx}
                        onChangeIndex={(newIndex: number) =>
                            setPanelIdx(newIndex)
                        }
                    />
                </div>

                <div
                    style={{
                        backgroundColor: '#FFFFFF',
                        flex: 2,
                        height: 500,
                        minWidth: 500,
                        padding: 40,
                        resize: 'horizontal',
                        marginBottom: 50,
                        borderRadius: 20,
                        boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
                        position: 'relative',
                    }}
                >
                    <span
                        style={{
                            fontFamily: 'Muller',
                            fontWeight: 700,
                            color: '#FF3693',
                            fontSize: 26,
                        }}
                    >
                        Testing
                    </span>

                    {JSON.stringify(testResults)}
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
        </div>
    )
}

export default Playground