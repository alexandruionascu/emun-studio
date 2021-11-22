import Task from 'task.js';
import { builtinFiles } from './SkulptStdlib';


export interface Variable {
  name: string;
  value: any;
}

export interface EvalResult {
  error?: string;
  output: string;
  variables: Variable[]
}

declare var Sk: any;
declare var skulptBuiltinFiles: any;
declare var process: any;

export const pyEval = (
  code: string,
  consoleInput: string
): Promise<EvalResult> => {
  // clear previous tasks in pool
  new Task().terminate();
  let task = new Task({
    requires: {
      // for testing in jest
      Sk: !process.browser ? 'skulpt' : 'https://cdn.rawgit.com/skulpt/skulpt-dist/0.11.0/skulpt.min.js',
    },
    globals: {
      skulptBuiltinFiles: builtinFiles,
      inputStdinLineNumber: 0,
      inputStdinDataToProcessCursor: 0,
      inputStdinDataToProcess: consoleInput,
    },
  });
  return task.run(
    (code: string, consoleInput: string) => {
      Sk.builtinFiles = skulptBuiltinFiles;
      let readModule = (module: any) => Sk.builtinFiles['files'][module];
      Sk.python3 = true;
      Sk.externalLibraries = {
        numpy: {
          path:
            'https://raw.githubusercontent.com/waywaaard/skulpt_numpy/master/numpy/__init__.js',
        },
        'numpy.random': {
          path:
            'https://raw.githubusercontent.com/waywaaard/skulpt_numpy/master/numpy/random/__init__.js',
        },
      };
      let inputStdinLineNumber = 0;
      let inputStdinDataToProcessCursor = 0;
      let inputStdinDataToProcess = consoleInput;
      function nextInt() {
        return parseInt(nextString());
      }

      function nextFloat() {
        return parseFloat(nextString());
      }

      function input() {
        let lineStr = inputStdinDataToProcess.split('\n')[inputStdinLineNumber];
        inputStdinLineNumber++;
        return Sk.ffi.remapToPy(lineStr);
      }

      function nextString() {
        var next_string = '';
        clearWhitespaces();
        while (
          inputStdinDataToProcessCursor < inputStdinDataToProcess.length &&
          !isWhitespace(inputStdinDataToProcess[inputStdinDataToProcessCursor])
        ) {
          next_string += inputStdinDataToProcess[inputStdinDataToProcessCursor];
          inputStdinDataToProcessCursor += 1;
        }
        return Sk.ffi.remapToPy(next_string);
      }

      function nextChar() {
        clearWhitespaces();
        if (inputStdinDataToProcessCursor < inputStdinDataToProcess.length) {
          return inputStdinDataToProcess[inputStdinDataToProcessCursor++];
        } else {
          return '\0';
        }
      }
      function isWhitespace(character: string) {
        return ' \t\n\r\v'.indexOf(character) > -1;
      }

      function clearWhitespaces() {
        while (
          inputStdinDataToProcessCursor < inputStdinDataToProcess.length &&
          isWhitespace(inputStdinDataToProcess[inputStdinDataToProcessCursor])
        ) {
          // ignore the next whitespace character
          inputStdinDataToProcessCursor += 1;
        }
      }

      function runCode(code: string) {
        Sk.importMainWithBody('<stdin>', false, code);
      }

      Sk.builtin.runCode = runCode;
      Sk.builtins.runCode = Sk.builtin.runCode;

      Sk.builtin.input = input;
      Sk.builtins.input = Sk.builtin.input;

      Sk.builtin.nextInt = nextInt;
      Sk.builtins.nextInt = Sk.builtin.nextInt;

      Sk.builtin.nextFloat = nextFloat;
      Sk.builtins.nextFloat = Sk.builtin.nextFloat;

      Sk.builtin.nextString = nextString;
      Sk.builtins.nextString = Sk.builtin.nextString;

      Sk.builtin.nextChar = nextChar;
      Sk.builtins.nextChar = Sk.builtin.nextChar;

      var stdOut = '';

      Sk.builtin.__stdout__ = stdOut;
      Sk.builtins.__stdout__ = Sk.builtin.__stdout__;

      Sk.configure({
        read: readModule,
        output: function (output: string) {
          stdOut += output;
          Sk.builtin.__stdout__ = stdOut;
          Sk.builtins.__stdout__ = Sk.builtin.__stdout__;
        },
      });

      let variables: Variable[] = [];

      try {
        const excludedKeys = ['__doc__', '__file__', '__name__', '__path__'];
        Sk.importMainWithBody('<stdin>', false, code);

        if (Sk.globals) {
          for (let key in Sk.globals) {
            if (excludedKeys.indexOf(key) === -1) {
       
              variables.push({
                name: key,
                value: Sk.builtins.str(Sk.globals[key]).v
              })
            }
          }
        }

      } catch (e) {
        return {
          output: stdOut,
          error: e.toString()
        };
      }
      return {
        output: stdOut,
        variables: variables
      };
    },
    code,
    consoleInput
  );
};