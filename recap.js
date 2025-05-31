(async function(){
  // 1) Only run once per thread
  if (window.__hasRecapped) return;
  window.__hasRecapped = true;

  // 2) Gather all user/AI messages
  const convo = oc.thread.messages
    .filter(m => m.author === "user" || m.author === "ai");
  const convoText = convo.map(m => m.content).join("\n");

  // 3) Build and send the recap prompt
  const prompt = [
    oc.character.roleInstruction,
    "",
    "Please provide a concise recap of the above conversation:",
    convoText
  ].join("\n\n");

  const res = await oc.getChatCompletion({
    messages: [{ author: "system", content: prompt }],
    temperature: 0.7
  });
  const recap = res.trim();

  // 4) Post it as a hidden system message
  oc.thread.messages.push({
    author: "system",
    name: oc.character.name,
    avatar: {
      url:   oc.character.avatar.url,
      size:  oc.character.avatar.size,
      shape: oc.character.avatar.shape
    },
    content: recap,
    hiddenFrom: ["ai"]
  });

  // 5) After 10s, click submit to drop updates (no new threads)
  setTimeout(() => {
    let submitBtn = document.querySelector("button.submit");
    if (submitBtn) submitBtn.click();
  }, 10000);
})();