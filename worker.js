export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("MythForge AI is online 🚀", {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }

    try {
      const body = await request.json();
      const character = body.character?.trim();

      if (!character) {
        return Response.json(
          { error: "Please provide a mythological character." },
          { status: 400 }
        );
      }

      const prompt = `
Create a short, engaging TikTok narration about the mythological character "${character}".

Requirements:
- Arabic language.
- Iraqi-friendly Modern Arabic, easy to understand.
- 45-60 seconds when spoken.
- Start with a powerful hook.
- Give interesting factual information.
- End with a curiosity-provoking sentence.
- Do not invent historical facts. Clearly distinguish mythology from established history.
- Return ONLY the narration text.
`;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ]
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return Response.json(
          {
            error: "Gemini API error",
            details: data
          },
          { status: 500 }
        );
      }

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      return Response.json({
        character,
        script: text || "No script was generated."
      });

    } catch (error) {
      return Response.json(
        {
          error: "Server error",
          details: String(error)
        },
        { status: 500 }
      );
    }
  }
};
