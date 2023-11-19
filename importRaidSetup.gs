function importRaidSetup() {
  let apiKey = getApiKey();
  var eventId = getEventId(apiKey);
  var raidSetup = getRaidSetup(apiKey, eventId);

  var ss = SpreadsheetApp.getActiveSpreadsheet(); 
  writeRaidSetup(ss, raidSetup, 1);
  writeRunTimestamp(ss, "admin", "O11")
}

function btnImportRaidSetup() {
  var confirm = Browser.msgBox('Raidsetup importieren','Bist du dir sicher, dass du das ausführen möchtest?', Browser.Buttons.OK_CANCEL);
  if(confirm=='ok'){ 
    importRaidSetup()
    Browser.msgBox("Raidsetup wurde importiert");
  }
}


function getApiKey() {
  let apiKey = INSERT_HERE;
  return apiKey;
}

function getEventId(apiKey) {
  let apiUrl = INSERT_HERE;
  let options = {"headers": {"Authorization": apiKey},
                 "method": "GET"
                }
  let response = UrlFetchApp.fetch(apiUrl, options);
  let jsonObject = JSON.parse(response);

  let postedEvents = jsonObject.postedEvents;
  let eventId = 0;
  
  postedEvents.forEach(event => {
    if (event.channelName === "25er-sonntag") {
      eventId = event.id;
    }  
  })
  return eventId;
}

function getRaidSetup(apiKey, eventId) {
  let apiUrl = "https://raid-helper.dev/api/raidplan/" + eventId;
  let options = {"headers": {"Authorization": apiKey},
                 "method": "GET"
                }
  let response = UrlFetchApp.fetch(apiUrl, options);
  let jsonObject = JSON.parse(response);

  let raidSetup = [];
  jsonObject.raidDrop.forEach ( slot => {
    raidSetup.push(slot.userid);
  })
  return raidSetup;
}

function writeRaidSetup(spreadsheet, raidSetup, rowStart) {
  let sheet = spreadsheet.getSheetByName("RaidSetup");
  for (let i = 0; i < raidSetup.length; i++) {
    let row = rowStart + i
    sheet.getRange("A" + row).setValue(raidSetup[i]);
  }
}

function writeIntoCell(ss, data, table, cell) {
  let sheet = ss.getSheetByName(table);
  sheet.getRange(cell).setValue(data);
}

function writeRunTimestamp(ss, table, cell) {
  let timestamp = Date.now();
  let date = new Date(timestamp).toLocaleString("tr-TR")
  writeIntoCell(ss, date, table, cell)
}
