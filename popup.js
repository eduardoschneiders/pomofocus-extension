document.getElementById("start-btn").addEventListener(('click'), () => {
  chrome.action.setBadgeBackgroundColor({ color: "green" });
  chrome.action.setBadgeText({ text: "3:00" });

  chrome.alarms.create('stateChanged', {
    periodInMinutes: 1 / 60,
  });

  chrome.alarms.create('main',{
    delayInMinutes: 2,
  });

  chrome.storage.local.set({ state: 'focus', ciclesCount: 0 });
  refreshState()
})

document.getElementById("pause-btn").addEventListener(('click'), () => {
  chrome.action.setBadgeBackgroundColor({ color: "white" });

  chrome.alarms.get('main').then((alarm) => {
    if (alarm) {
      chrome.storage.local.get(['state']).then((res) => {
        chrome.storage.local.set({
          restInMins: (new Date(alarm.scheduledTime) - new Date) / 1000 / 60,
          previousState: res.state
        });

        chrome.storage.local.set({ state: 'paused' });
        chrome.alarms.clear('main')
        chrome.alarms.clear('stateChanged')

        refreshState()
      })
    }
  })
})

document.getElementById("continue-btn").addEventListener(('click'), () => {
  chrome.storage.local.get(['restInMins', 'previousState']).then((res) => {
    chrome.action.setBadgeBackgroundColor({ color: res.previousState == 'focus' ? 'green' : 'blue' });
    chrome.storage.local.set({ state: res.previousState });

    chrome.alarms.create('stateChanged', {
      periodInMinutes: 1 / 60,
    });

    chrome.alarms.create('main',{
      delayInMinutes: res.restInMins,
    });

    refreshState()
  })
})

document.getElementById("stop-btn").addEventListener(('click'), () => {
  chrome.alarms.clear('main')
  chrome.alarms.clear('stateChanged')
  chrome.action.setBadgeText({ text: '' });
  chrome.storage.local.set({ state: 'paused' });

  refreshState()
})







function refreshState() {
  chrome.storage.local.get(['state', 'ciclesCount']).then((res) => {
    let state = { paused: 'Paused', focus: 'Focusing', resting: 'Resting' }
    document.getElementById('state').textContent = `#${res.ciclesCount} - ${state[res.state]}`
  })

  chrome.storage.local.get(['state']).then((res) => {
    if (res.state == 'focus' || res.state == 'resting') {
      document.getElementById('start-btn').style.visibility = "hidden";
    }
  })
}

refreshState()
