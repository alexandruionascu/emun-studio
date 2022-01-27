import { Language } from '../Challenge'
import { Navbar } from '../components/Navbar'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { codeEditorTheme } from './EditorTheme'
import { Footer } from '../components/Footer'

interface ChallengePageProps {
    language: Language
    title: string
    description: string
}

const BorderedContainer = (props: { children: any }) => {
    return (
        <div className="bordered-container">
            <div className="bordered-child">{props.children}</div>
        </div>
    )
}

export const ChallengePage = (props: ChallengePageProps) => {
    return (
        <div className="challenge-page">
            <Navbar />
            <h1 className="challenge-title">{props.title}</h1>
            <p className="challenge-description">{props.description}</p>
            <BorderedContainer>
                <div className="challenge-editor-container">
                    <CodeMirror
                        value="print('hey')"
                        height="300px"
                        width="500px"
                        style={{ fontSize: 12 }}
                        className="code-editor"
                        theme={codeEditorTheme}
                        extensions={[python()]}
                        onChange={(value, viewUpdate) => {
                            console.log('value:', value)
                        }}
                    />
                </div>
            </BorderedContainer>

            <Footer />
        </div>
    )
}
