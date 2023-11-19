function getCurrentRaidplanUrl() {
  let apiKey = getApiKey()
  var eventId = getEventId(apiKey)
  var ss = SpreadsheetApp.getActiveSpreadsheet()

  var currentRaidplanUrl = "https://raid-helper.dev/raidplan/" + eventId
  Browser.msgBox(currentRaidplanUrl)
}


function getApiKey() {
  let apiKey = INSERT_HERE
  return apiKey
}

function getEventId(apiKey) {
  let apiUrl = "https://raid-helper.dev/api/v2/servers/1016049512093077585/events"
  let options = {"headers": {"Authorization": apiKey},
                 "method": "GET"
                }
  let response = UrlFetchApp.fetch(apiUrl, options)
  let jsonObject = JSON.parse(response)

  let postedEvents = jsonObject.postedEvents
  let eventId = 0
  
  postedEvents.forEach(event => {
    if (event.channelName === "25er-sonntag") {
      eventId = event.id
    }  
  })
  return eventId
}
