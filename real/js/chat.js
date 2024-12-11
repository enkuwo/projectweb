const WapiUrl = "https://2ce6-199-223-235-174.ngrok-free.app/generate"; // Ensure "/generate" endpoint is included
async function sendMessage() {
  const userMessage = document.getElementById('userMessage').value.trim();

  if (!userMessage) {
    alert('Please enter a message.');
    return;
  }

  appendMessage('user', userMessage);
  document.getElementById('userMessage').value = ''; // Clear input

  appendMessage('assistant', 'Thinking...'); // Temporary loading indicator

  try {
    const response = await fetch(WapiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userMessage,
        max_length: 100, // Number of tokens
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      removeLastMessage(); // Remove "Thinking..." message
      appendMessage('assistant', data.generated_text);
    } else {
      removeLastMessage();
      appendMessage('assistant', "Sorry, there was an error processing your request.");
    }
  } catch (error) {
    console.error("Error:", error);
    removeLastMessage();
    appendMessage('assistant', "Unable to connect to the server. Please try again later.");
  }
}

function appendMessage(role, message) {
  const chatMessages = document.querySelector('.chat-messages');
  const newMessage = document.createElement('div');
  newMessage.className = role === 'user' ? 'user-message' : 'assistant-message';
  newMessage.textContent = message;
  chatMessages.appendChild(newMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
}

function removeLastMessage() {
  const chatMessages = document.querySelector('.chat-messages');
  const lastMessage = chatMessages.lastChild;
  if (lastMessage) {
    chatMessages.removeChild(lastMessage);
  }
}