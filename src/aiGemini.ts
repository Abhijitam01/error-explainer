export async function explainWithGemini(stack: string, errorType: string | undefined, message: string | undefined): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return null;
  }

  const prompt = `You are a senior engineer.

Explain this error briefly.

Rules:
- Bullet points only
- No theory
- No assumptions
- No long explanations

Error:
Stack: ${stack}
Type: ${errorType || 'unknown'}
Message: ${message || 'N/A'}

Format:
What happened:
Why it happens:
How to fix:`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text || null;
    }

    return null;
  } catch {
    return null;
  }
}

