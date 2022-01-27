import React from 'react'
import { Controlled as CodeMirror } from 'react-codemirror2'
import './Playground.css'
import {
    EvalResult,
    extractVariableValues,
    injectPyCode,
    pyEval,
    Location,
    Scope,
    StepByStepVariables,
    Variable,
    VariableValue,
} from './eval/PyEval'
import Webcam from 'react-webcam'
import { Animated } from 'react-animated-css'
import Splitter, { SplitDirection } from '@devbookhq/splitter'
import SwipeableViews from 'react-swipeable-views'
import VariableBox from './VariableBox'
import Pagination from './components/Pagination'
import YAML from 'yaml'
import Editor, { useMonaco } from '@monaco-editor/react'
import Memomji from './memoji.png'
import ClipLoader from 'react-spinners/ClipLoader'
import {
    runCode,
    getVariables,
    setVariable,
    clearVariables,
    setOptions,
} from './ClientSideRunner'
import 'react-step-progress-bar/styles.css'
import { ProgressBar, Step } from 'react-step-progress-bar'
import { Footer } from './components/Footer'
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

const startSeparator = Math.random().toString(36).substring(7)
const endSeparator = Math.random().toString(36).substring(7)

type Mode = 'user' | 'editor' | 'workspace'

interface PlaygroundProps {
    mode: Mode
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

const initialCode = `# here goes your Python code
x = 0
for i in range(10):
    x += i
    print(i)
    `

const initialTestngCode = `# here goes your testing code`

function Playground(props: PlaygroundProps) {
    const editorRef = React.useRef(null)
    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor
    }
    const monaco = useMonaco()

    React.useEffect(() => {
        // do conditional chaining
        monaco?.languages.typescript.javascriptDefaults.setEagerModelSync(true)
        // or make sure that it exists by other ways
        if (monaco) {
            console.log('here is the monaco instance:', monaco.editor)
        }
    }, [monaco])

    let [monacoDecorations, setMonacoDecorations] = React.useState([])

    const [code, setCode] = React.useState<string>(initialCode)
    const [stdin, setStdin] = React.useState<string>('')
    const [stdout, setStdout] = React.useState<string>('')
    const [error, setError] = React.useState<string>()
    const [variables, setVariables] = React.useState<Variable[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [testingCode, setTestingCode] = React.useState(initialTestngCode)
    const [testingInput, setTestingInput] = React.useState(initialTestingInput)
    const [codeEditorIdx, setCodeEditorIdx] = React.useState(0)
    const [variableValueIdx, setVariableValueIdx] = React.useState(0)
    const [percent, setPercent] = React.useState(0)
    const [stepByStep, setStepByStep] = React.useState<StepByStepVariables>()
    const [currentLocation, setCurrentLocation] =
        React.useState<Location | null>(null)

    React.useEffect(() => {
        if (
            stepByStep?.locations &&
            stepByStep?.locations[variableValueIdx] &&
            variableValueIdx != stepByStep.locations.length - 1
        ) {
            setCurrentLocation(stepByStep.locations[variableValueIdx] ?? null)
        }
    }, [variableValueIdx])

    React.useEffect(() => {
        if (!currentLocation) return

        setMonacoDecorations(
            (editorRef?.current as any).deltaDecorations(monacoDecorations, [
                {
                    range: {
                        startLineNumber: currentLocation.first_line,
                        endLineNumber: currentLocation.last_line,
                        startColumn: currentLocation.first_column,
                        endColumn: currentLocation.last_column + 1,
                    },
                    options: {
                        inlineClassName: 'monaco-inline-highlight',
                        className: 'monaco-highlight',
                    },
                },
            ])
        )
    }, [currentLocation])

    console.log(currentLocation)
    let variableValues: Scope = {
        scope: 'global',
        variables: [],
    }
    if (stepByStep?.history) {
        variableValues = stepByStep.history[variableValueIdx]
    }

    const [panelIdx, setPanelIdx] = React.useState(0)
    const [testIdxToRun, setTestIdxToRun] = React.useState(0)
    const [testResults, setTestResults] = React.useState<{
        [key: string]: TestResult
    }>({})

    React.useEffect(() => {
        // clear previous decorations when you code
        if (editorRef?.current) {
            setMonacoDecorations(
                (editorRef?.current as any).deltaDecorations(
                    monacoDecorations,
                    []
                )
            )
        }

        let codeToEval =
            props.mode === 'editor' && codeEditorIdx == 1
                ? code + '\n' + testingCode
                : code + '\n'

        const stepByStepCode = injectPyCode(
            code + '\n',
            startSeparator,
            endSeparator
        )

        pyEval(stepByStepCode, stdin).then((res) => {
            if (res.output) {
                console.log(res.output)
                const stepByStep = extractVariableValues(
                    res.output,
                    startSeparator,
                    endSeparator
                )
                setStepByStep(stepByStep)
            }
        })
        pyEval(codeToEval, stdin).then((res: EvalResult) => {
            if (variables.length > 0 && res?.error) {
                setIsLoading(true)
            } else {
                setIsLoading(false)
            }

            setStdout(res.output)
            console.log(res?.error)
            setError(res?.error)
            if (!res?.error) {
                setVariables(res?.variables ?? [])
                // start to run the tests
                setTestIdxToRun(0)
            }
            console.log(res)
        })
    }, [code, stdin, testingCode, testingInput, codeEditorIdx])

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
                            output: testRes?.error ?? '',
                            passed: testRes?.error ? false : true,
                        },
                    })
                })
                .then(() => setTestIdxToRun(testIdxToRun + 1))
        } catch (err: any) {
            // YAML parse fails
            console.log(err)
            setError(err.toString())
        }
    }, [testIdxToRun])

    React.useEffect(() => {
        if (stepByStep?.history) {
            setVariableValueIdx(stepByStep?.history.length - 1)
        }
    }, [stepByStep])

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
                        fontFamily: 'Montserrat',
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
                            fontFamily: 'Montserrat',
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

            <ProgressBar
                percent={percent}
                filledBackground="linear-gradient(to right, #FF3693, #FF3693)" />

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                }}
            >
                <div
                    className="cell"
                    style={{
                        fontFamily: 'Montserrat',
                        fontSize: 14,
                        color: '#695D5D',
                        marginTop: 40,
                    }}
                >
                    Inverseaza dictonarul capitals si si numeste-l countries.
                </div>
                <div className="cell" style={{ marginBottom: 40 }}>
                    <Splitter
                        minWidths={[300, 300]}
                        gutterClassName="cell-custom-gutter"
                        direction={SplitDirection.Horizontal}
                    >
                        <Editor
                            height="400px"
                            defaultLanguage="python"
                            defaultValue={initialCode}
                            loading={
                                <ClipLoader
                                    color={'#948E96'}
                                    loading={true}
                                    size={30}
                                />
                            }
                            options={{
                                fontFamily: 'Fira Code, monospace',
                                //cursorStyle: 'block',
                                formatOnType: true,
                                fontLigatures: true,
                            }}
                            onMount={handleEditorDidMount}
                            onChange={(value, event) => {
                                setCode(value ?? '')
                            }}
                        />

                        <div
                            style={{
                                background: 'white !important',
                                height: '100%',
                            }}
                        >
                            <input
                                type="range"
                                min={0}
                                max={
                                    stepByStep?.history
                                        ? stepByStep.history.length - 1
                                        : 0
                                }
                                onChange={(e) =>
                                    setVariableValueIdx(
                                        parseInt(e.target.value)
                                    )
                                }
                                value={variableValueIdx}
                            />
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: 30,
                                }}
                            >
                                {(variableValues?.variables
                                    ? variableValues.variables
                                    : []
                                ).map((v, i) => (
                                    <VariableBox
                                        loading={isLoading}
                                        colorOrder={i}
                                        variableName={v.name}
                                        variableValue={v.value}
                                        key={i}
                                    />
                                ))}
                            </div>
                        </div>
                    </Splitter>
                </div>
            </div>

            {/*<div className="cell" style={{ height: 650 }}>
                <SwipeableViews
                    index={codeEditorIdx}
                    onChangeIndex={(newIndex: number) =>
                        setCodeEditorIdx(newIndex)
                    }
                    style={{ height: '100%' }}
                >
                    {props.mode == 'editor' && (
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
                    )}
                    {props.mode == 'editor' && (
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
                    )}
                </SwipeableViews>

                {props.mode == 'editor' && (
                    <Pagination
                        dots={3}
                        index={codeEditorIdx}
                        onChangeIndex={(newIndex: number) =>
                            setCodeEditorIdx(newIndex)
                        }
                    />
                )}

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
                className="cell"
                style={{
                    position: 'relative',
                    height: 650,
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}
            >
                <Splitter
                    direction={SplitDirection.Vertical}
                    gutterClassName="cell-custom-gutter"
                >
                    <Splitter
                        direction={SplitDirection.Horizontal}
                        gutterClassName="cell-custom-gutter"
                    >
                        <div>
                            <h2
                                style={{
                                    color: '#FF3693',
                                    marginLeft: 20,
                                    fontFamily: 'Montserrat',
                                    background: 'white',
                                }}
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
                                    height: '100%',
                                    width: '100%',
                                }}
                                value={stdin}
                                onChange={(e) => setStdin(e.target.value)}
                            />
                        </div>

                        <div
                            style={{
                                background: 'white !important',
                                height: '100%',
                            }}
                        >
                            <h2
                                style={{
                                    color: '#FF3693',
                                    marginLeft: 20,
                                    fontFamily: 'Montserrat',
                                }}
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
                                    height: '100%',
                                    width: '100%',
                                }}
                                value={stdout}
                            />
                        </div>
                    </Splitter>
                </Splitter>
                <Pagination
                    dots={2}
                    index={panelIdx}
                    onChangeIndex={(newIndex: number) => setPanelIdx(newIndex)}
                />
                            </div>*/}
            {/* props.mode == 'editor' && (
                    <div
                        className="cell"
                        style={{
                            backgroundColor: '#FFFFFF',
                            flex: 2,
                            height: 700,
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
                                fontFamily: 'Montserrat',
                                fontWeight: 700,
                                color: '#FF3693',
                                fontSize: 26,
                            }}
                        >
                            Testing
                        </span>
                        <textarea
                            style={{ width: 700, height: 700 }}
                            value={injectPyCode(code, '<>', '</>')}
                        />
                        {JSON.stringify(testResults)}
                    </div>
                )}
               {/* <textarea id="filename">Hello from a textarea</textarea> */}

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
            <Footer />
        </div>
    )
}

export default Playground
