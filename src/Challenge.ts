export type Language = 'Python3' | 'C++' | 'Python2'
export type Tag = 'dict' | 'basic'

interface ITestcases {
    testCases: {
        [variable: string]: any[]
    }
}

export interface FlashChallenge extends ITestcases {
    statement: string;    
    language: Language;
    initialCode: string;
    solutionCode: string;
    tags: Tag[],
    matchVariables: string[]
    time: number
}



export const example1: FlashChallenge = {
    statement: 'Creeaza un dictionar countries si inverseaza dictionarul capitals.',
    initialCode: `capitals = __testcase__('capitals')`,
    language: 'Python3',
    testCases: {
        'capitals': [
            {
                'France': 'Paris',
                'Spain': 'Madrid'
            },
            {
                'Italy': 'Roma',
                'Austria': 'Viena'
            }
        ]
    },
    solutionCode: `countries = {}
    for country, capital in capitals.items():
     countries[capital] = country`,
    tags: ['dict', 'basic'],
    matchVariables: ['countries'],
    time: 60
}

interface Runner {
    language: Language,
    runCode: (code: string, maxSteps: 10000, onStdout: (str: string) => void) => void
}