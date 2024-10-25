chrome.alarms.clear('main')
chrome.alarms.clear('stateChanged')
chrome.storage.local.set({ state: 'stoped', ciclesCount: 0 });


// Vars: state['stoped', 'focus', 'paused', 'resting', 'longResting'], ciclesCount(0..4), counter[0...5]
// Alarms: stateChanged[1], main[5, 25]

// On popup
  // click start
    // create an alarm 'stateChanged' each 1 second
    // 'state' = 'focus'
    // alarm 'main'[25]
    // ciclesCount = 0
  // click stop
    // clear alarm [stateChanged, main]
    // update badge


// On background
  // On alarm 'stateChanged'
    // each minute
      // update badge counter/icon

  // On alarm 'main'
    // if state == 'focus'
      // ciclesCount += 1
      // 'state' = 'resting'
      // alarm 'main'[5]
    // if state == 'resting'
      // 'state' = 'focus'
      // alarm 'main'[25]

async function playAudio(source) {
  if (!(await chrome.offscreen.hasDocument())) { // prevent double creation
    await chrome.offscreen.createDocument({
      url: "audio.html",
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: "play sound effects",
    });
  }

  await chrome.runtime.sendMessage({
    target: "offscreen",
    playAudio: { source: source }
  });
}


function notify({ title, message }) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "./icon.png",
    title: title,
    message: message
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name == 'stateChanged') {
    chrome.storage.local.get(['state']).then((res) => {
      chrome.alarms.get('main').then((alarm) => {
        if (alarm) {
          let restInSeconds = (new Date(alarm.scheduledTime) - new Date) / 1000

          if (Math.floor(restInSeconds) / 60 == 5) {
            playAudio('mp3/tomato-squish-80465.mp3');
            notify({title: '5 min', message: 'message'})
          }

          chrome.action.setBadgeText({ text: `${Math.round(restInSeconds/60)}` });
        }
      })
    });
  } else if (alarm.name == 'main') {
    chrome.storage.local.get(['state', 'ciclesCount']).then((res) => {
      if (res.state == 'focus') {
        playAudio('mp3/clock-alarm-8761.mp3');
        notify({title: 'Finish working', message: 'message'})
        chrome.storage.local.set({ state: 'resting', ciclesCount: res.ciclesCount + 1 });
        chrome.action.setBadgeBackgroundColor({ color: "blue" });

        chrome.alarms.create('main',{
          delayInMinutes: 5,
        });
      } else if (res.state == 'resting') {
        playAudio('mp3/alarmclockring03-254788.mp3');
        notify({title: 'Time to focus', message: 'message'})

        chrome.alarms.create('main',{
          delayInMinutes: 25,
        });
        chrome.storage.local.set({ state: 'focus' });
        chrome.action.setBadgeBackgroundColor({ color: "green" });
        chrome.action.setBadgeText({ text: "25" });
      }
    })
  }
})





