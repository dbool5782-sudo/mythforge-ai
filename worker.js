export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API: Generate mythology script
    if (url.pathname === "/api/generate" && request.method === "POST") {
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
Create a compelling 45-60 second TikTok narration about the mythological character "${character}".

Rules:
- Write in clear Modern Standard Arabic.
- Make it easy for an Iraqi audience to understand.
- Start with a powerful hook.
- Make it mysterious, exciting and cinematic.
- Explain interesting information.
- Clearly distinguish mythology from established historical facts.
- Do not present uncertain legends as proven facts.
- End with a curiosity-provoking sentence.
- Return ONLY the narration.
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
                  parts: [
                    {
                      text: prompt
                    }
                  ]
                }
              ]
            })
          }
        );

        const data = await response.json();
console.log("Gemini status:", response.status);
console.log("Gemini response:", JSON.stringify(data));
        if (!response.ok) {
  return Response.json(
    {
     error: "Gemini API request failed.",
details: data,
status: response.status 
    },
    { status: 500 }
  );
}

        const script =
          data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!script) {
          return Response.json(
            { error: "Gemini returned an empty response." },
            { status: 500 }
          );
        }

        return Response.json({
          character,
          script
        });

      } catch (error) {
        return Response.json(
          { error: "Server error." },
          { status: 500 }
        );
      }
    }

    // Serve the new website from /public
    return env.ASSETS.fetch(request);
  }
};
