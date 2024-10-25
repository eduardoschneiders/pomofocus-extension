chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.playAudio && message.target === "offscreen") {
    const audio = new Audio(message.playAudio.source);
    audio.play();
    sendResponse("Audio played");
  }
});
