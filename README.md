# error-explain

A CLI tool that explains errors from JavaScript, TypeScript, Next.js, MongoDB, and PostgreSQL with AI-powered explanations.

## Installation

```bash
npm install -g error-explain
```

## Usage

Run any command and get an explained error output:

```bash
explain npm run build
explain node script.js
explain next dev
```

The tool will:
1. Execute your command
2. Detect the error stack (JavaScript, Next.js, MongoDB, PostgreSQL)
3. Parse the error details
4. Provide explanations with:
   - What happened
   - Why it happens
   - How to fix it

## Features

- **Stack Detection**: Automatically detects JavaScript, Next.js, MongoDB, and PostgreSQL errors
- **Rule-Based Explanations**: Uses curated rules for common error types
- **AI-Powered Fallback**: Falls back to Gemini AI for unknown errors (requires API key)
- **Pretty Output**: Color-coded terminal output for easy reading

## AI Integration (Optional)

To enable AI-powered explanations for unknown errors, set the `GEMINI_API_KEY` environment variable:

```bash
export GEMINI_API_KEY=your_api_key_here
```

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

## Examples

### JavaScript Error
```bash
$ explain node broken.js

❌ ReferenceError
   at broken.js:5:10
   x is not defined

What happened:
Variable or function is used before it's declared or doesn't exist

Why it happens:
The code references a name that hasn't been defined in the current scope

✅ How to fix:
  • Check if the variable/function name is spelled correctly
  • Ensure the variable is declared before use (use const/let/var)
  • Verify imports if it's from another module
  • Check variable scope (global vs local)
```

### Next.js Error
```bash
$ explain npm run dev

❌ HydrationError
   at app/page.tsx:12:5
   Server and client HTML mismatch

What happened:
Server-rendered HTML doesn't match client-rendered HTML

Why it happens:
Different output between server and client render, often from browser APIs or random values

✅ How to fix:
  • Remove browser-only APIs (window, document) from initial render
  • Use useEffect for client-only code
  • Avoid Date.now() or Math.random() in render
  • Check for conditional rendering based on client state
```

## Supported Stacks

- **JavaScript/TypeScript**: ReferenceError, TypeError, SyntaxError, RangeError, etc.
- **Next.js**: HydrationError, ModuleNotFound, ServerClientMismatch
- **MongoDB**: ConnectionRefused, AuthenticationFailed, SchemaValidationError
- **PostgreSQL**: RelationNotFound, AuthenticationFailed, SyntaxError

## Requirements

- Node.js >= 18.0.0

## License

MIT

