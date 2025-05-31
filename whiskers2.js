// Initialize a counter to keep track of the number of messages
let messageCounter = 0;

// Listen for a new message being added
oc.thread.on("MessageAdded", async function({message}) {
  // Increment the counter each time a new message is added
  messageCounter++;

  // Check if the counter is divisible by 5
  if (messageCounter % 5 === 0) {
    // Check if the last two messages are from the user or AI
    if ((oc.thread.messages.at(-1).author === "user" || oc.thread.messages.at(-1).author === "ai") &&
        (oc.thread.messages.at(-2).author === "user" || oc.thread.messages.at(-2).author === "ai")) {
      
      // Get the content of the last two messages and concatenate them
      const lastMessageContent1 = oc.thread.messages.at(-2).content;
      const lastMessageContent2 = oc.thread.messages.at(-1).content;
      const combinedLastMessageContent = `${lastMessageContent1} ${lastMessageContent2}`;

      // Use chat completion to summarize the combined last messages
      const result = await oc.getChatCompletion({
        messages: [{author: "system", content: `You are a sassy and satirical commentator who breaks the 4th wall to interrupt text based gameplay. Your job is to roast their choices. Here's the latest interaction: [${combinedLastMessageContent}] Be sarcastic, teasing, crass, and witty in your commentary. Use allegory and observation to playfully mock the user. You are snarky and enjoy caustic humor. Your responses should have a troll like tone to them. Dark humor is part of your personality, feel free to use puns and be absurd. `}],
        temperature: 0.9,
        stopSequences: ["\n"]
      });

      // Push the summarized message to the message feed
      oc.thread.messages.push({
            author: "system",
            name: "Detective Whiskers",
              avatar: {
    url: "https://ttalesinteractive.com/graphics/mittensCBot.png?",
    size: 1.39, 
    shape: "portrait"
  },
            
        content: `${result.trim()}`,
hiddenFrom: ["ai"]
      });
    }
  }
});