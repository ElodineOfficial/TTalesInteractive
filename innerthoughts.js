// Track only user messages
let userMessageCounter = 0;

oc.thread.on("MessageAdded", async function({ message }) {
  // Only count user posts
  if (message.author !== "user") return;
  userMessageCounter++;

  // Only trigger on every 3rd user message
  if (userMessageCounter % 3 !== 0) return;

  // Grab the last two messages (regardless of author)
  const lastTwo = oc.thread.messages.slice(-2);
  const combined = lastTwo.map(m => m.content).join(" ");

  // Build the raw system prompt
  let systemPrompt = [
    oc.character.roleInstruction,
    "",
    "Latest conversation:",
    combined,
    "",
    `You are ${oc.character.name}, this is a chance to express your inner thoughts on the current situation.`
  ].join("\n");

  // Replace {{user}} with the actual userName
  const userName = oc.thread.userCharacter.name || "";
  const prompt = systemPrompt.replace(/{{user}}/g, userName);

  // Fetch the “inner thought”
  const reply = await oc.getChatCompletion({
    messages: [{ author: "system", content: prompt }],
    temperature: 0.9,
    stopSequences: ["\n"]
  });

  // Post it as a hidden-from-AI system message, with the character’s own avatar
  oc.thread.messages.push({
    author: "system",
    name: oc.character.name,
    avatar: {
      url: oc.character.avatar.url,
      size: oc.character.avatar.size,
      shape: oc.character.avatar.shape
    },
    content: reply.trim(),
    hiddenFrom: ["ai"],
    expectsReply: false
  });
});