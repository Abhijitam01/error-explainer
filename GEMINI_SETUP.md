# Setting Up Gemini API Key

## Step 1: Get Your API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (it looks like: `AIzaSy...`)

## Step 2: Set the API Key

### Option 1: Temporary (Current Terminal Session Only)

```bash
export GEMINI_API_KEY=your_api_key_here
```

This only works for the current terminal session. When you close the terminal, you'll need to set it again.

### Option 2: Permanent (Recommended)

Add to your shell configuration file:

**For Bash:**
```bash
echo 'export GEMINI_API_KEY=your_api_key_here' >> ~/.bashrc
source ~/.bashrc
```

**For Zsh:**
```bash
echo 'export GEMINI_API_KEY=your_api_key_here' >> ~/.zshrc
source ~/.zshrc
```

**For Fish:**
```bash
echo 'set -gx GEMINI_API_KEY your_api_key_here' >> ~/.config/fish/config.fish
source ~/.config/fish/config.fish
```

### Option 3: Secure (Using .env file - requires code changes)

If you want to keep the key in a file (not recommended for production):

1. Create `.env` file in project root:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

2. Add `.env` to `.gitignore` (already done)

3. Use a package like `dotenv` to load it (would require code changes)

## Step 3: Verify It Works

Test that the API key is set:

```bash
echo $GEMINI_API_KEY
```

You should see your API key printed.

## Step 4: Test with error-explain

Try an error that doesn't have a rule (to trigger AI fallback):

```bash
explain node -e "throw new Error('CustomTestError')"
```

If the API key is working, you should see an AI-generated explanation instead of the generic fallback.

## Security Best Practices

1. **Never commit your API key to git** - It's already in `.gitignore`
2. **Don't share your API key** - Keep it private
3. **Use environment variables** - Don't hardcode in scripts
4. **Rotate keys if exposed** - If you accidentally share it, generate a new one

## Troubleshooting

### API key not working?

1. **Check if it's set:**
   ```bash
   echo $GEMINI_API_KEY
   ```

2. **Verify the key is correct:**
   - Make sure there are no extra spaces
   - Make sure you copied the entire key

3. **Check if it's exported:**
   ```bash
   env | grep GEMINI
   ```

4. **Restart your terminal** after adding to `.bashrc`/`.zshrc`

5. **Test the API directly:**
   ```bash
   curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$GEMINI_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"test"}]}]}'
   ```

### Still not working?

- Make sure you're using the same terminal session where you set the variable
- Try setting it again: `export GEMINI_API_KEY=your_key`
- Check for typos in the key
- Verify your Google AI Studio account is active

## How It Works

The tool checks for `GEMINI_API_KEY` in this order:
1. First tries to find a rule in JSON files (fast, no API call)
2. If no rule found, checks for `GEMINI_API_KEY` environment variable
3. If API key exists, calls Gemini API
4. If no API key or API fails, shows generic explanation

So the API key is only used as a fallback when there's no matching rule!

