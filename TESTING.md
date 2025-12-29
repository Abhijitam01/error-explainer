# Testing Guide

## Local Testing Strategies

### 1. Development Testing (Using tsx)

Test directly with TypeScript during development:

```bash
# Make sure you're in the project directory
cd /home/abhijitam/Desktop/error-explainer

# Test with tsx (no build needed)
npx tsx src/index.ts node broken.js
npx tsx src/index.ts npm run build
```

### 2. Build and Test Locally

Test the built version as users will experience it:

```bash
# Build the project
npm run build

# Test the built version
node dist/index.js node broken.js
```

### 3. Test as Installed Package (Recommended)

This simulates the exact user experience:

```bash
# Build first
npm run build

# Create a tarball (like npm publish would)
npm pack

# Install it globally (or locally)
npm install -g error-explain-1.0.0.tgz

# Now test it
explain node broken.js
explain npm run build

# Uninstall when done testing
npm uninstall -g error-explain
```

### 4. Test with Real Error Scenarios

Create test files to verify different error types:

#### JavaScript Errors
```bash
# Create test file: test-js-error.js
echo "console.log(undefinedVar);" > test-js-error.js
explain node test-js-error.js
```

#### Next.js Errors
```bash
# In a Next.js project
explain npm run dev
# Or create a hydration error
```

#### MongoDB Errors
```bash
# Test with invalid connection
explain node -e "require('mongodb').MongoClient.connect('mongodb://invalid:27017')"
```

#### PostgreSQL Errors
```bash
# Test with invalid query
explain psql -c "SELECT * FROM nonexistent_table;"
```

## Test Cases to Cover

### ✅ Core Functionality
- [ ] Command execution works
- [ ] Error detection for each stack type
- [ ] Error parsing extracts correct fields
- [ ] Rule-based explanations work
- [ ] AI fallback works (with API key)
- [ ] Generic fallback works (without API key)

### ✅ Edge Cases
- [ ] Empty command arguments
- [ ] Commands that succeed (exit code 0)
- [ ] Commands that fail but have no stderr
- [ ] Very long error messages
- [ ] Errors with special characters
- [ ] Missing error type
- [ ] Missing file/line information

### ✅ User Experience
- [ ] Output is readable and well-formatted
- [ ] Colors display correctly
- [ ] No crashes on unexpected input
- [ ] Helpful error messages for tool errors
- [ ] Fast response times

## Automated Testing Setup

Consider adding these test files:

### test/unit/
- `detector.test.ts` - Test stack detection
- `parser.test.ts` - Test error parsing
- `explainer.test.ts` - Test explanation logic

### test/integration/
- `cli.test.ts` - Test full CLI flow
- `real-errors.test.ts` - Test with real error outputs

### Example Test Setup

```bash
# Add to package.json
npm install --save-dev @types/jest jest ts-jest

# Create jest.config.js
# Create test files
```

## Performance Testing

```bash
# Time the execution
time explain npm run build

# Should be fast (< 2 seconds for most cases)
```

## Quality Checklist

Before publishing:
- [ ] All test cases pass
- [ ] Build succeeds without errors
- [ ] No TypeScript errors
- [ ] Package installs correctly
- [ ] CLI works after global install
- [ ] Rules files are included
- [ ] README is accurate
- [ ] Examples in README work

