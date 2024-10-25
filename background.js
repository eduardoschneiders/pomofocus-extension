chrome.alarms.clear('main')
chrome.alarms.clear('stateChanged')
chrome.storage.local.set({ state: 'paused', ciclesCount: 0 });


// Vars: state['paused', 'focus', 'resting', 'longResting'], ciclesCount(0..4), counter[0...5]
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




chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name == 'stateChanged') {
    chrome.storage.local.get(['state']).then((res) => {
      chrome.alarms.get('main').then((alarm) => {
        if (alarm) {
          console.log('alarm main: ', alarm)
          let restInSeconds = (new Date(alarm.scheduledTime) - new Date) / 1000
          chrome.action.setBadgeText({ text: `${Math.floor(restInSeconds/60)}:${Math.round(restInSeconds % 60)}` });
        }
      })
    });
  } else if (alarm.name == 'main') {
    chrome.storage.local.get(['state', 'ciclesCount']).then((res) => {
      if (res.state == 'focus') {
        chrome.storage.local.set({ state: 'resting', ciclesCount: res.ciclesCount + 1 });
        chrome.action.setBadgeBackgroundColor({ color: "blue" });

        chrome.alarms.create('main',{
          delayInMinutes: 1,
        });
      } else if (res.state == 'resting') {
        chrome.alarms.create('main',{
          delayInMinutes: 2,
        });
        chrome.storage.local.set({ state: 'focus' });
        chrome.action.setBadgeBackgroundColor({ color: "green" });
      }
    })
  }
})





