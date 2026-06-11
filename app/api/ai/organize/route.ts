import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description } = body || {};
    const text = `${title || ''}\n\n${description || ''}`;

    const prompt = `Extract 3-5 actionable tasks from the following brain dump. Respond with VALID JSON only in this format: {"tasks":[{"title":"Task title","description":"Brief description","priority":"High|Medium|Low"}]}. Limit tasks to max 5.\n\nText:\n${text}`;

    // If GROQ is configured, use it
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_URL) {
      const res = await fetch(process.env.GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            { role: 'system', content: 'You convert brain-dump text into JSON tasks. Always respond with valid JSON.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content || '';

      let tasks: any[] = [];
      try {
        const parsed = JSON.parse(content);
        tasks = (parsed.tasks || []).slice(0, 5);
      } catch (e) {
        console.error('JSON parse error:', e);
        // Fallback: extract lines as simple tasks
        const lines = (content || '')
          .split('\n')
          .map((l: string) => l.replace(/^[-\d\.\)\s*"']+/, '').trim())
          .filter((l: string) => l.length > 3)
          .slice(0, 5);
        tasks = lines.map((l: string) => ({ title: l, description: '', priority: 'Medium' }));
      }

      return NextResponse.json({ tasks });
    }

    // Fallback: OpenAI if configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'No AI provider configured' }, { status: 500 });
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You convert brain-dump text into JSON tasks. Always respond with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    const json = await openaiRes.json();
    const content = json.choices?.[0]?.message?.content || '';

    let tasks: any[] = [];
    try {
      const parsed = JSON.parse(content);
      tasks = (parsed.tasks || []).slice(0, 5);
    } catch (e) {
      const lines = (content || '')
        .split('\n')
        .map((l: string) => l.replace(/^[-\d\.\)\s*"']+/, '').trim())
        .filter((l: string) => l.length > 3)
        .slice(0, 5);
      tasks = lines.map((l: string) => ({ title: l, description: '', priority: 'Medium' }));
    }

    return NextResponse.json({ tasks });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
