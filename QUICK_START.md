# Quick Start - Testing Locally

## 🚀 Fastest Way to Test

### Option 1: Test as Published Package (Best - Simulates Real User Experience)

```bash
# 1. Build the project
npm run build

# 2. Create a package tarball
npm pack

# 3. Install it globally (simulates npm install -g error-explain)
npm install -g error-explain-1.0.0.tgz

# 4. Test it!
explain --help
explain --version
explain node -e "console.log(undefinedVar)"

# 5. Clean up when done
npm uninstall -g error-explain
rm error-explain-1.0.0.tgz
```

### Option 2: Test During Development (Fast Iteration)

```bash
# Use tsx to run TypeScript directly (no build needed)
npx tsx src/index.ts --help
npx tsx src/index.ts node -e "console.log(undefinedVar)"
```

### Option 3: Test Built Version Locally

```bash
# Build first
npm run build

# Run the built version
node dist/index.js --help
node dist/index.js node -e "console.log(undefinedVar)"
```

## 🧪 Test Scenarios

### Test JavaScript Errors

```bash
# ReferenceError
explain node -e "console.log(undefinedVar)"

# TypeError  
explain node -e "const x = null; x.property"

# SyntaxError
explain node -e "const x = {"
```

### Test Help and Version

```bash
explain --help
explain -h
explain --version
explain -v
```

### Test with Real Projects

```bash
# In a Next.js project
explain npm run dev

# In a Node.js project
explain npm run build

# With any failing command
explain npm run nonexistent-script
```

## ✅ Quality Checklist

Before publishing, verify:

- [ ] `npm run build` succeeds
- [ ] `explain --help` shows help
- [ ] `explain --version` shows version
- [ ] Test with a real JavaScript error
- [ ] Test with a successful command (should pass through)
- [ ] Test with empty args (should show help)
- [ ] Install as package and test globally

## 🐛 Common Issues

### "Command not found: explain"
- Make sure you installed the package: `npm install -g error-explain-1.0.0.tgz`
- Or use: `node dist/index.js` instead

### "Cannot find module"
- Run `npm run build` first
- Make sure `dist/rules/` directory exists with JSON files

### Build fails
- Check TypeScript errors: `npx tsc --noEmit`
- Verify all imports are correct

## 📝 Next Steps

1. Test with your own error scenarios
2. Add more error types to rules
3. Test AI integration (set GEMINI_API_KEY)
4. Get feedback from users
5. Iterate based on feedback

