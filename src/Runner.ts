import JSCPP from 'JSCPP'

interface RunLimit {
    maxSteps: number
    maxTimeout: number
}

export interface IRunner {
    runner: (
        code: string,
        input: string,
        onStdout: (str: string) => void,
        limit: RunLimit
    ) => Eval
}

export interface Variable {
    name: string
    value: any
    type: string
}

export interface Location {
    sLine: number
    eLine: number
    sColumn: number
    eColumn: number
}

export interface Step {
    location?: Location
    variables: Variable[]
}

export interface Eval {
    output: string
    error: string | null
    steps: Step[]
}

export const cppRunner: IRunner = {
    runner: (
        code: string,
        input: string,
        onStdout: (str: string) => void,
        limit: RunLimit
    ): Eval => {
        let accumulatedStdout: string[] = []
        try {
            let cppDebugger = JSCPP.run(code, input, {
                debug: true,
                stdio: {
                    write: (s: string) => {
                        accumulatedStdout.push(s)
                        onStdout(s)
                    },
                },
            })

            cppDebugger.stopConditions = {
                isStatement: true,
                positionChanged: true,
                lineChanged: true,
            }

            let done: boolean = cppDebugger.next()
            let line: number = 0
            let steps: Step[] = []

            while (!done) {
                line++
                if (line > limit.maxSteps) {
                    throw new Error('Time limit exceeded.')
                }

                let step: Partial<Step> = {}
                // get all variables with .variable() method
                step.variables = cppDebugger
                    .variable()
                    .filter(
                        (v: Variable) =>
                            ['cin', 'cout', 'main', 'endl'].indexOf(v.name) ===
                            -1
                    )

                if (steps.length > 0 && cppDebugger.prevNode) {
                    steps[steps.length - 1].location = cppDebugger.prevNode
                }


                steps.push(step as Step)
                done = cppDebugger.continue()
            }

            console.log(accumulatedStdout.join(''))
            return {
                steps: steps,
                error: null,
                output: accumulatedStdout.join(''),
            }
        } catch (err: any) {
            console.table(err)
            if (!err || !err.replace) {
                return {
                    output: accumulatedStdout.join(''),
                    error: err,
                    steps: [],
                }
            }
            let formattedErr = err
                .replace(/(\\t|\\n|\\r|Error:ERROR:)/g, '')
                .replace('<position unavailable>', '')
            if (formattedErr.indexOf('---') > 1) {
                formattedErr = formattedErr.substr(
                    0,
                    formattedErr.indexOf('---')
                )
            }
            formattedErr = formattedErr.replace(
                'Parsing Failure',
                'Compile error'
            )
            return {
                error: formattedErr,
                output: accumulatedStdout.join(''),
                steps: [],
            }
        }
    },
}
