document.getElementById("ask").addEventListener("click", async () => {
  const question = document.getElementById("question").value.trim();
  const answerDiv = document.getElementById("answer");

  if (!question) {
    answerDiv.innerText = "❗ Please enter a question.";
    return;
  }

  answerDiv.innerHTML = "🔄 Loading...";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_TEXT" }, async (response) => {
    const pageText = response?.text || "";

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=AIzaSyCuzatZBYZDvnCrqEUvYNFnOqzfNS4FDiI`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Here is the text from a web page:

                    ${pageText}

                    Now answer the following question based only on the information above.

                    Question: ${question}

                    🎯 Your response must be:
                    - Short (1–3 sentences max) unless it is demanded by the question
                    - Directly answer the question
                    - Factual and based on the page
                    - Use Markdown (bold dates/names if appropriate)
                    - No filler or opinions
                    - If the answer is not in the text, say "I don't know."
                    - Do not include any other information or context.
                    - You must answer the question directly.
                    - Do not use phrases like "Based on the information above" or "According to the text."
                    `

                }
              ]
            }
          ]
        })
      }
    );

    const data = await geminiResponse.json();
    const finalAnswer = data.candidates?.[0]?.content?.parts?.[0]?.text || "❌ No response from Gemini.";
    answerDiv.innerHTML = marked.parse(finalAnswer);
  });
});
