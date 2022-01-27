import { Language } from '../Challenge'
import { Navbar } from '../components/Navbar'

interface ChallengePageProps {
    language: Language
    title: string
}

export const ChallengePage = (props: ChallengePageProps) => {
    return (
        <div className="challenge-page">
            <Navbar />
            <h1 className="challenge-title">{props.title}</h1>
        </div>
    )
}
