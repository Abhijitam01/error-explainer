#!/bin/bash

# Test script for error-explain
# Run this to test various error scenarios

echo "🧪 Testing error-explain..."
echo ""

# Test 1: JavaScript ReferenceError
echo "Test 1: JavaScript ReferenceError"
echo "console.log(undefinedVar);" > /tmp/test-ref-error.js
node /tmp/test-ref-error.js 2>&1 | head -5
echo "---"
explain node /tmp/test-ref-error.js
echo ""
echo ""

# Test 2: JavaScript TypeError
echo "Test 2: JavaScript TypeError"
echo "const obj = null; console.log(obj.property);" > /tmp/test-type-error.js
node /tmp/test-type-error.js 2>&1 | head -5
echo "---"
explain node /tmp/test-type-error.js
echo ""
echo ""

# Test 3: JavaScript SyntaxError
echo "Test 3: JavaScript SyntaxError"
echo "const x = {" > /tmp/test-syntax-error.js
node /tmp/test-syntax-error.js 2>&1 | head -5
echo "---"
explain node /tmp/test-syntax-error.js
echo ""
echo ""

# Test 4: Command not found
echo "Test 4: Command not found"
echo "---"
explain nonexistent-command-that-does-not-exist
echo ""
echo ""

# Test 5: Successful command (should just pass through)
echo "Test 5: Successful command"
echo "---"
explain echo "Hello World"
echo ""
echo ""

# Test 6: Empty arguments
echo "Test 6: Empty arguments"
echo "---"
explain
echo ""
echo ""

# Cleanup
rm -f /tmp/test-*.js

echo "✅ Testing complete!"

