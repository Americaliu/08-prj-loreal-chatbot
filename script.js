const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

// Add your Cloudflare Worker URL later
const WORKER_URL =
  "https://lorean-beauty-assistance.liuweiting20020706.workers.dev/";

// Chatbot instructions
const SYSTEM_PROMPT = `
You are L'Oréal Beauty Assistant, a friendly and
professional AI beauty advisor.

Only answer questions about L'Oréal products,
makeup, skincare, haircare, fragrances, and
related beauty routines.

Recommend L'Oréal products based on the
user's needs, preferences, and concerns.

Ask follow-up questions when needed.
Remember details from earlier messages.

If a question is unrelated to L'Oréal or
beauty topics, politely explain that you
specialize in L'Oréal beauty assistance.

Do not invent product names or make
unsupported claims about products.
Keep responses helpful, friendly, and clear.
`;

// Maintain conversation history
const messages = [{ role: "system", content: SYSTEM_PROMPT }];

chatWindow.innerHTML = "";

// Create chat bubbles
function addMessage(role, content) {
  const bubble = document.createElement("div");

  bubble.className = `msg ${role}`;
  bubble.textContent = content;

  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return bubble;
}

// Welcome message
addMessage(
  "ai",
  "👋 Welcome to L'Oréal Beauty Assistant! " +
    "How can I help you with your beauty routine today?",
);

let latestQuestionElement = null;

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = userInput.value.trim();

  if (!question) return;

  userInput.value = "";

  // Show user message
  addMessage("user", question);

  // Save conversation history
  messages.push({
    role: "user",
    content: question,
  });

  // Remove previous latest-question label
  if (latestQuestionElement) {
    latestQuestionElement.remove();
  }

  // Display latest question above response
  latestQuestionElement = document.createElement("div");
  latestQuestionElement.className = "latest-question";
  latestQuestionElement.textContent = "Latest question: " + question;

  chatWindow.appendChild(latestQuestionElement);

  const replyBubble = addMessage("ai", "Thinking...");

  // Temporary preview before Cloudflare setup
  if (!WORKER_URL) {
    replyBubble.textContent =
      "✨ Your chat interface is working! " +
      "AI responses will be enabled when " +
      "we connect the Cloudflare Worker.";
    return;
  }

  sendBtn.disabled = true;

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;

    if (typeof answer !== "string" || !answer.trim()) {
      throw new Error("Invalid AI response");
    }

    replyBubble.textContent = answer;

    messages.push({
      role: "assistant",
      content: answer,
    });
  } catch (error) {
    console.error(error);

    replyBubble.textContent = "Sorry, something went wrong. Please try again.";
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});
