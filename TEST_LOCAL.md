# Testing Without Global Install (No Sudo Required)

## Problem
Global npm installs require sudo permissions. Here are ways to test without it:

## Solution 1: Use npx with Local Path (Easiest)

```bash
# Build first
npm run build

# Test directly with node
node dist/index.js --help
node dist/index.js node -e "console.log(undefinedVar)"
```

## Solution 2: Create a Local Alias

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
alias explain="node /home/abhijitam/Desktop/error-explainer/dist/index.js"
```

Then:
```bash
source ~/.bashrc  # or source ~/.zshrc
explain --help
```

## Solution 3: Use npm link (Recommended for Development)

```bash
# In the project directory
npm link

# This creates a symlink in your user's npm global directory
# Now you can use 'explain' command without sudo!
explain --help
explain node -e "console.log(undefinedVar)"

# To unlink later
npm unlink -g error-explain
```

## Solution 4: Install to Custom Location

```bash
# Set npm prefix to a directory you own
mkdir -p ~/.local/npm-global
npm config set prefix ~/.local/npm-global

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH=~/.local/npm-global/bin:$PATH

# Now install without sudo
npm install -g error-explain-1.0.0.tgz

# Use it
explain --help
```

## Solution 5: Test with tsx (Development Only)

```bash
# No build needed, runs TypeScript directly
npx tsx src/index.ts --help
npx tsx src/index.ts node -e "console.log(undefinedVar)"
```

## Recommended: Use npm link

`npm link` is the best option for local development because:
- ✅ No sudo needed
- ✅ Works like a real install
- ✅ Easy to update (just rebuild)
- ✅ Easy to remove (npm unlink)

