import { useEffect, useRef, useState } from 'react'
import { Language } from '../Challenge'
import { Navbar } from '../components/Navbar'
import CodeMirror, { Decoration, EditorView } from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { cpp } from '@codemirror/lang-cpp'
import { codeEditorTheme } from './EditorTheme'
import { Footer } from '../components/Footer'
import { cppRunner, Eval, Step, Variable } from '../Runner'
import VariableBox from '../VariableBox'
import { BorderedContainer } from '../components/BorderedContainer'
import Editor, { useMonaco } from '@monaco-editor/react'
import { RangeSetBuilder } from '@codemirror/rangeset'
import { ClipLoader } from 'react-spinners'

interface ChallengePageProps {
    language: Language
    title: string
    description: string
}

let initialCode = `#include <iostream>
using namespace std;

int main() {
  cout << "Hello" << endl;
  return 0;
}`

export const ChallengePage = (props: ChallengePageProps) => {
    const [code, setCode] = useState(initialCode)
    const [sliderIndex, setSliderIndex] = useState(-1)

    const [res, setRes] = useState<Eval>({
        output: '',
        steps: [],
        error: null,
    })

    const editorRef = useRef(null)
    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor
    }
    const monaco = useMonaco()

    useEffect(() => {
        // do conditional chaining
        monaco?.languages.typescript.javascriptDefaults.setEagerModelSync(true)
        // or make sure that it exists by other ways
        if (monaco) {
            console.log('here is the monaco instance:', monaco.editor)
        }
    }, [monaco])

    let [monacoDecorations, setMonacoDecorations] = useState([])

    useEffect(() => {
        if (!editorRef?.current) {
            return
        }
        let newDecorations = []
        if (currentStep.location) {
            newDecorations.push({
                range: {
                    startLineNumber: currentStep.location.sLine,
                    endLineNumber: currentStep.location.eLine,
                    startColumn: currentStep.location.sColumn,
                    endColumn: currentStep.location.eColumn,
                },
                options: {
                    inlineClassName: 'monaco-inline-highlight',
                    className: 'monaco-highlight',
                },
            })
        }

        setMonacoDecorations(
            (editorRef?.current as any).deltaDecorations(
                monacoDecorations,
                newDecorations
            )
        )
    }, [sliderIndex])

    useEffect(() => {
        setRes(
            cppRunner.runner(code, '', () => {}, {
                maxSteps: 1000,
                maxTimeout: 100,
            })
        )
    }, [code])

    useEffect(() => {
        setSliderIndex(res.steps.length - 1)
    }, [res])

    const currentStep: Step =
        sliderIndex < res.steps.length && sliderIndex >= 0
            ? res.steps[sliderIndex]
            : {
                  variables: [],
              }

    return (
        <div className="challenge-page">
            <Navbar />
            <h1 className="challenge-title">{props.title}</h1>
            <p className="challenge-description">{props.description}</p>

            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    flex: 1,
                }}
            >
                <BorderedContainer>
                    <div className="challenge-editor-container">
                        <Editor
                            width="550px"
                            height="350px"
                            defaultLanguage="cpp"
                            defaultValue={initialCode}
                            loading={
                                <ClipLoader
                                    color={'#948E96'}
                                    loading={true}
                                    size={30}
                                />
                            }
                            options={{
                                formatOnType: true,
                                fontLigatures: true,
                                fontSize: 12,
                            }}
                            onMount={handleEditorDidMount}
                            onChange={(value, event) => {
                                setCode(value ?? '')
                            }}
                        />
                        <input
                            className="challenge-editor-slider"
                            type="range"
                            min={0}
                            max={res.steps.length - 1}
                            onChange={(e) =>
                                setSliderIndex(parseInt(e.target.value))
                            }
                            value={sliderIndex}
                        />
                        <div
                            className="challenge-editor-output"
                            style={{ maxWidth: 500 }}
                        >
                            {res.output.length > 0
                                ? res.output
                                : res.error?.toString()}
                        </div>
                    </div>
                </BorderedContainer>

                <div className="challenge-variables-container">
                    {currentStep.variables.map((v, i) => (
                        <VariableBox
                            loading={false}
                            variableName={v.name}
                            key={i}
                            variableValue={v.value}
                        />
                    ))}
                </div>
            </div>

            <div>{res.output}</div>
            <div>{JSON.stringify(res)}</div>

            <Footer />
        </div>
    )
}
