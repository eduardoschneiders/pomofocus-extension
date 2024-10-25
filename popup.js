document.getElementById("start-btn").addEventListener(('click'), () => {
  chrome.action.setBadgeBackgroundColor({ color: "green" });
  chrome.action.setBadgeText({ text: "25" });

  chrome.alarms.create('stateChanged', {
    periodInMinutes: 1,
  });

  chrome.alarms.create('main',{
    delayInMinutes: 25,
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
      periodInMinutes: 1,
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
  chrome.storage.local.set({ state: 'stoped' });

  refreshState()
})







function refreshState() {
  chrome.storage.local.get(['state', 'ciclesCount']).then((res) => {
    let state = { stoped: 'Stoped', focus: 'Focusing', paused: 'Paused', resting: 'Resting' }
    document.getElementById('state').textContent = `#${res.ciclesCount} - ${state[res.state]}`

    document.getElementById('start-btn').style.display = "block";
    document.getElementById('pause-btn').style.display = "block";
    document.getElementById('continue-btn').style.display = "block";
    document.getElementById('stop-btn').style.display = "block";

    if (res.state == 'stoped') {
      document.getElementById('pause-btn').style.display = "none";
      document.getElementById('continue-btn').style.display = "none";
      document.getElementById('stop-btn').style.display = "none";
    } else if (res.state == 'focus') {
      document.getElementById('start-btn').style.display = "none";
      document.getElementById('continue-btn').style.display = "none";
    } else if (res.state == 'paused') {
      document.getElementById('start-btn').style.display = "none";
      document.getElementById('pause-btn').style.display = "none";
      document.getElementById('stop-btn').style.display = "none";
    } else if (res.state == 'resting') {
      document.getElementById('start-btn').style.display = "none";
    }
  })
}

refreshState()
