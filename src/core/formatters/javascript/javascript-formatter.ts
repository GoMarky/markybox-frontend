import { BaseFormatter, CodeStatement } from '@/core/formatters/formatter/base-formatter';
import { IAbstractKeyApplicator } from '@/core/formatters/formatter/base-applicator';
import { JavascriptKeyApplicator } from '@/core/formatters/javascript/javascript-applicator';
import { IAbstractFormatterFactory } from '@/core/formatters/formatter/base-factory';
import { JavascriptFactory } from '@/core/formatters/javascript/javascript-factory';
import { EditorGlobalContext } from '@/core/renderer/system/EditorGlobalContext';

const GLOBAL_VARIABLES_LIST = [
  "URIError",
  "WeakMap",
  "WeakSet",
  "WebAssembly",
  "TypeError",
  "Uint8Array",
  "Uint16Array",
  "Uint32Array",
  "undefined",
  "Promise",
  "Proxy",
  "RangeError",
  "ReferenceError",
  "Reflect",
  "RegExp",
  "Set",
  "SharedArrayBuffer",
  "SharedWorker",
  "String",
  "Buffer",
  "Symbol",
  "SyntaxError",
  "Int16Array",
  "Int32Array",
  "Int8Array",
  "InternalError",
  "isFinite",
  "isNaN",
  "JSON",
  "Map",
  "Math",
  "NaN",
  "Number",
  "Object",
  "parseInt",
  "parseFloat",
  "Array",
  "BigUint64Array,",
  "Boolean",
  "DataView",
  "Date,",
  "decodeURI,",
  "decodeURIComponent,",
  "encodeURI,",
  "encodeURIComponent",
  "unescape",
  "eval",
  "EvalError",
  "FinalizationRegistry",
  "Float32Array",
  "Float64Array",
  "globalThis",
  "global",
  "Infinity",
  'Function',
  'Atomics',
  'BigInt',
  'BigInt64',
  'AsyncGenerator',
  'ArregateError',
  'Error',
  'Array',
  'Buffer',
  'AsyncFunction',
  'console',
  "window",
  "document",
  "location",
  "customElements",
  "history",
  "navigator",
  "origin",
  "screen",
  "crypto",
  "indexedDB",
  "sessionStorage",
  "localStorage",
  "alert",
  "atob",
  "blur",
  "btoa",
  "cancelAnimationFrame",
  "cancelIdleCallback",
  "captureEvents",
  "clearInterval",
  "clearTimeout",
  "confirm",
  "createImageBitmap",
  "fetch",
  "matchMedia",
  "open",
  "print",
  "prompt",
  "queueMicrotask",
  "requestAnimationFrame",
  "requestIdleCallback",
  "setInterval",
  "setTimeout",
  "navigation",
];

const KEYWORDS_LIST = [
  "set",
  "readonly",
  "from",
  "import",
  "global",
  "declare",
  "object",
  "class",
  "async",
  "await",
  "return",
  "true",
  "false",
  "any",
  "extends",
  "static",
  "let",
  "package",
  "implements",
  "interface",
  "function",
  "new",
  "try",
  "yeild",
  "const",
  "continue",
  "do",
  "catch",
  "in",
  "this",
  "break",
  "as",
  "switch",
  "case",
  "if",
  "throw",
  "else",
  "var",
  "number",
  "string",
  "get",
  "module",
  "type",
  "instanceof",
  "typeof",
  "public",
  "private",
  "enum",
  "export",
  "finally",
  "for",
  "while",
  "void",
  "null",
  "super"
];

export class JavascriptCodeFormatter extends BaseFormatter {
  public readonly applicator: IAbstractKeyApplicator;
  public readonly factory: IAbstractFormatterFactory;

  constructor(context: EditorGlobalContext) {
    super('js', context);

    this.applicator = new JavascriptKeyApplicator(context);
    this.factory = new JavascriptFactory();
  }

  public parseKeyword(input: string): CodeStatement | undefined {

    switch (true) {
      case KEYWORDS_LIST.includes(input):
        return CodeStatement.VariableDeclaration;
      case GLOBAL_VARIABLES_LIST.includes(input):
        return CodeStatement.GlobalVariable;
      default:
        return CodeStatement.Text;
    }
  }
}

