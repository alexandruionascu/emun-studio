import Task from 'task.js'
import { builtinFiles } from './SkulptStdlib'
const PyGrammarParser = require('./Py37Grammar')

export interface Variable {
    name: string
    value: any
}

export interface EvalResult {
    error?: string
    output: string
    variables: Variable[]
}

declare var Sk: any
declare var skulptBuiltinFiles: any
declare var process: any

export const pyEval = (
    code: string,
    consoleInput: string
): Promise<EvalResult> => {
    // clear previous tasks in pool
    new Task().terminate()
    let task = new Task({
        requires: {
            // for testing in jest
            Sk: !process.browser
                ? 'skulpt'
                : 'https://cdn.rawgit.com/skulpt/skulpt-dist/0.11.0/skulpt.min.js',
        },
        globals: {
            skulptBuiltinFiles: builtinFiles,
            inputStdinLineNumber: 0,
            inputStdinDataToProcessCursor: 0,
            inputStdinDataToProcess: consoleInput,
        },
    })
    return task.run(
        (code: string, consoleInput: string) => {
            Sk.builtinFiles = skulptBuiltinFiles
            let readModule = (module: any) => Sk.builtinFiles['files'][module]
            Sk.python3 = true
            Sk.externalLibraries = {
                numpy: {
                    path: 'https://raw.githubusercontent.com/waywaaard/skulpt_numpy/master/numpy/__init__.js',
                },
                'numpy.random': {
                    path: 'https://raw.githubusercontent.com/waywaaard/skulpt_numpy/master/numpy/random/__init__.js',
                },
            }
            let inputStdinLineNumber = 0
            let inputStdinDataToProcessCursor = 0
            let inputStdinDataToProcess = consoleInput
            function nextInt() {
                return parseInt(nextString())
            }

            function nextFloat() {
                return parseFloat(nextString())
            }

            function input() {
                let lineStr =
                    inputStdinDataToProcess.split('\n')[inputStdinLineNumber]
                inputStdinLineNumber++
                return Sk.ffi.remapToPy(lineStr)
            }

            function nextString() {
                var next_string = ''
                clearWhitespaces()
                while (
                    inputStdinDataToProcessCursor <
                        inputStdinDataToProcess.length &&
                    !isWhitespace(
                        inputStdinDataToProcess[inputStdinDataToProcessCursor]
                    )
                ) {
                    next_string +=
                        inputStdinDataToProcess[inputStdinDataToProcessCursor]
                    inputStdinDataToProcessCursor += 1
                }
                return Sk.ffi.remapToPy(next_string)
            }

            function nextChar() {
                clearWhitespaces()
                if (
                    inputStdinDataToProcessCursor <
                    inputStdinDataToProcess.length
                ) {
                    return inputStdinDataToProcess[
                        inputStdinDataToProcessCursor++
                    ]
                } else {
                    return '\0'
                }
            }
            function isWhitespace(character: string) {
                return ' \t\n\r\v'.indexOf(character) > -1
            }

            function clearWhitespaces() {
                while (
                    inputStdinDataToProcessCursor <
                        inputStdinDataToProcess.length &&
                    isWhitespace(
                        inputStdinDataToProcess[inputStdinDataToProcessCursor]
                    )
                ) {
                    // ignore the next whitespace character
                    inputStdinDataToProcessCursor += 1
                }
            }

            function runCode(code: string) {
                Sk.importMainWithBody('<stdin>', false, code)
            }

            Sk.builtin.runCode = runCode
            Sk.builtins.runCode = Sk.builtin.runCode

            Sk.builtin.input = input
            Sk.builtins.input = Sk.builtin.input

            Sk.builtin.nextInt = nextInt
            Sk.builtins.nextInt = Sk.builtin.nextInt

            Sk.builtin.nextFloat = nextFloat
            Sk.builtins.nextFloat = Sk.builtin.nextFloat

            Sk.builtin.nextString = nextString
            Sk.builtins.nextString = Sk.builtin.nextString

            Sk.builtin.nextChar = nextChar
            Sk.builtins.nextChar = Sk.builtin.nextChar

            var stdOut = ''

            Sk.builtin.__stdout__ = stdOut
            Sk.builtins.__stdout__ = Sk.builtin.__stdout__

            Sk.configure({
                read: readModule,
                output: function (output: string) {
                    stdOut += output
                    Sk.builtin.__stdout__ = Sk.ffi.remapToPy(stdOut)
                    Sk.builtins.__stdout__ = Sk.builtin.__stdout__
                },
            })

            let variables: Variable[] = []

            try {
                const excludedKeys = [
                    '__doc__',
                    '__file__',
                    '__name__',
                    '__path__',
                ]
                Sk.importMainWithBody('<stdin>', false, code)

                if (Sk.globals) {
                    for (let key in Sk.globals) {
                        if (excludedKeys.indexOf(key) === -1) {
                            variables.push({
                                name: key,
                                value: Sk.builtins.str(Sk.globals[key]).v,
                            })
                        }
                    }
                }
            } catch (e: any) {
                return {
                    output: stdOut,
                    error: e.toString(),
                }
            }
            return {
                output: stdOut,
                variables: variables,
            }
        },
        code,
        consoleInput
    )
}

// DFS
const getAllAssignmentsRec = (node: Code, scope = 'global'): Code[] => {
    let assignments: Code[] = []

    if (node.type == 'assign' || node.type == 'for' || node.type == 'call') {
        node.scope = scope
        assignments.push(node)
    }

    if (node.type == 'def') {
        if ((node as any).params.length > 0) {
            for (let param of (node as any).params) {
                assignments.push(param, (node as any).name)
            }
        }
    }

    if (!node.code) {
        return assignments
    }
    // look for children
    for (let childNode of node.code) {
        assignments = assignments.concat(getAllAssignmentsRec(childNode, scope))
    }
    return assignments
}

const tabsToSpaces = (data: string, tabSize = 4) => {
    let charIndex = data.indexOf('\t')
    const newLineIndex = data.substr(0, charIndex).lastIndexOf('\n')

    if (charIndex === -1) {
        return data
    }

    charIndex -= newLineIndex > 0 ? newLineIndex : 0
    let buffer = charIndex % tabSize

    if (charIndex < tabSize) {
        buffer = charIndex
    } else if (charIndex === tabSize) {
        buffer = 0
    }

    /**
     * Converting tab character to appropriate number of spaces
     */
    while (charIndex < data.length) {
        if (data[charIndex] === '\t') {
            data = data.replace(data[charIndex], ' '.repeat(tabSize - buffer))
            charIndex += tabSize - buffer
            buffer = 0
            continue
        } else {
            buffer++
        }

        if (buffer >= tabSize || data[charIndex] === '\n') {
            buffer = 0
        }
        charIndex++
    }

    return data
}
export interface VariableValue {
    name: string
    value: string
    location: Location
    scope: string
}

export interface Scope {
    scope: string
    variables: VariableValue[]
}
export interface StepByStepVariables {
    history: Scope[]
    locations: Location[]
}

export const extractVariableValues = (
    output: string,
    startSeparator: string,
    endSeparator: string
): StepByStepVariables => {
    let varValues: VariableValue[][] = []
    let currentVariables: { [varName: string]: VariableValue } = {}
    let start = output.split(startSeparator)
    let currentScopeName = 'global'
    let locations: Location[] = []
    let scopeHistory: Scope[] = []

    const addScope = () => {
        // we make a copy since Object.values
        // doens't seem to work here
        let copy = []
        for (let key in currentVariables) {
            copy.push(currentVariables[key])
        }

        if (copy.length > 0) {
            scopeHistory.push({
                variables: copy,
                scope: currentScopeName,
            })
        }
    }

    for (const elem of start) {
        if (elem.trim().length > 0) {
            const [
                startSep,
                varName,
                varValue,
                startLine,
                startCol,
                endLine,
                endCol,
                scope,
                endSep,
            ] = elem.split('$')
            if (currentScopeName !== scope) {
                addScope()
                locations.push({
                    first_line: parseInt(startLine),
                    first_column: parseInt(startCol),
                    last_line: parseInt(endLine),
                    last_column: parseInt(endCol),
                })
                currentScopeName = scope
                currentVariables = {}
            }
            currentVariables[varName] = {
                name: varName,
                value: varValue,
                location: {
                    first_line: parseInt(startLine),
                    first_column: parseInt(startCol),
                    last_line: parseInt(endLine),
                    last_column: parseInt(endCol),
                },
                scope: scope,
            }

            addScope()
            locations.push({
                first_column: parseInt(startCol),
                first_line: parseInt(startLine),
                last_line: parseInt(endLine),
                last_column: parseInt(endCol),
            })
        }
    }

    return {
        history: scopeHistory,
        locations: locations,
    }
}

export function injectPyCode(
    code: string,
    startSeparator: string,
    endSeparator: string
): string {
    let assignments: Code[] = []
    let noTabsCode = tabsToSpaces(code)
    try {
        let res: ParsedPython = PyGrammarParser.parse(noTabsCode + '\n')
        console.log(res)

        if (res.code || (res as any).params) {
            for (let childNode of res.code) {
                let scope = 'global'
                if (childNode.type == 'def') {
                    scope = (childNode as any).name
                }
                assignments = assignments.concat(
                    getAllAssignmentsRec(childNode, scope)
                )
            }
        }
    } catch (ex) {
        console.log(ex)
    } finally {
    }

    console.log(assignments)
    let lineNum = 1
    let injectedLines: { [line: string]: boolean } = {}
    let lines = (noTabsCode + '\n').split('\n')
    let newLines = []
    for (let line of lines) {
        if (injectedLines[line]) {
            continue
        }
        newLines.push(line)
        for (let assignment of assignments) {
            if (assignment.type == 'for') {
                assignment.location = assignment.decl_location
            }
            if (assignment.location?.last_line === lineNum) {
                const hash = Math.random().toString(36).substring(7)
                let varIds = []
                if (assignment.type == 'parameter') {
                    varIds.push((assignment as any).name)
                } else if (assignment.type == 'call') {
                    console.log('hey its a call', assignment)
                    // else it's just a function call, not a method
                    if ((assignment as any)?.func?.value?.id) {
                        varIds.push((assignment as any).func.value.id)
                    } else {
                        for (let arg of (assignment as any).args ?? []) {
                            if (arg?.actual?.id) {
                                varIds.push(arg.actual.id)
                            }
                        }
                    }
                } else if (assignment.targets?.length > 0) {
                    for (let target of assignment.targets) {
                        if (target.type == 'list' || target.type == 'tuple') {
                            for (let item of (target as any).items) {
                                varIds.push(item.id)
                            }
                        } else if (target.type == 'name') {
                            varIds.push(target.id)
                        } else if (
                            target.type == 'dot' &&
                            (target as any).value.id
                        ) {
                            varIds.push((target as any).value.id)
                        } else if (
                            target.type == 'index' &&
                            (target as any).value.id
                        ) {
                            varIds.push((target as any).value.id)
                        }
                    }
                } else {
                    for (let target of assignment?.target ?? []) {
                        varIds.push(target.id)
                    }
                }
                let nextLine = lines[lineNum] ?? ''
                const identValNextLine =
                    nextLine.length - nextLine.trimLeft().length
                const ident = ' '.repeat(
                    assignment.targets?.length > 0
                        ? assignment.location.first_column
                        : identValNextLine
                )
                for (let varId of varIds) {
                    const injectedLine = `${ident}print("${startSeparator}", "${varId}", ${varId}, ${assignment.location.first_line}, ${assignment.location.first_column}, ${assignment.location.last_line}, ${assignment.location.last_column}, "${assignment.scope}", "${endSeparator}", sep="$") #${hash}`
                    injectedLines[injectedLine] = true
                    newLines.push(injectedLine)
                }
            }
        }
        lineNum++
    }
    const generatedCode = newLines.join('\n')
    return generatedCode
}

export interface Location {
    first_line: number
    last_line: number
    first_column: number
    last_column: number
}

export interface Target {
    type: string
    id: string
    location: Location
}

export interface Source {
    type: string
    value: number
    location: Location
}

export interface Func {
    type: string
    id: string
    location: Location
}

export interface Actual {
    type: string
    value: number
    location: Location
}

export interface Arg {
    type: string
    actual: Actual
    location: Location
}

export interface Iter {
    type: string
    func: Func
    args: Arg[]
    location: Location
}

export interface Location {
    first_line: number
    last_line: number
    first_column: number
    last_column: number
}

export interface Func {
    type: string
    id: string
    location: Location
}

export interface Location {
    first_line: number
    last_line: number
    first_column: number
    last_column: number
}

export interface Actual {
    type: string
    id: string
    location: Location
}

export interface DeclLocation {
    first_line: number
    first_column: number
    last_line: number
    last_column: number
}

export interface Code {
    scope?: string
    type: string
    targets: Target[]
    sources: Source[]
    location: Location
    target: Target[]
    iter: Iter[]
    code: Code[]
    decl_location: DeclLocation
}

export interface ParsedPython {
    type: string
    code: Code[]
    location: Location
}
