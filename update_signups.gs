function testingUpdateSignup() {
  updateSignup("dev");
}

function btnUpdateSignup() {
  var confirm = Browser.msgBox('Signups importieren','Bist du dir sicher, dass du das ausführen möchtest?', Browser.Buttons.OK_CANCEL);
  if(confirm=='ok'){
    updateSignup("prod");
  } 
}


function updateSignup(env) {
  let apiKey = getApiKey();
  var eventId = getEventId(apiKey);

  var [playersAvailable, playersUnavailable] = getPlayersResponse(apiKey, eventId);
  var ss = SpreadsheetApp.getActiveSpreadsheet(); 
  var raidsetup = fetchRaidSetup(ss)

  Logger.log("playersAvailable - " + playersAvailable);
  Logger.log("Raidsetup - " + raidsetup)

  let rowOffset = 6;
  var textboxResult = updateSignupsAndBenches(env, ss, rowOffset, playersAvailable, raidsetup);

  textboxResult += "\\nUNCHANGED:\\n";
  for (let i = 0; i < playersUnavailable.length; i++) {
    textboxResult += playersUnavailable[i] + "\\n";
  }

  if (env == "prod") {
    updateRaidCount(ss);
    writeRunTimestamp(ss, "admin", "O19"); 
  }
  Browser.msgBox(textboxResult);
}


function getApiKey() {
  let apiKey = INSERT_HERE
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

function getPlayersResponse(apiKey, eventId) {
  let apiUrl = "https://raid-helper.dev/api/v2/events/" + eventId;
  let options = {"headers": {"Authorization": apiKey},
                 "method": "GET"
                }
  let response = UrlFetchApp.fetch(apiUrl, options);
  let jsonObject = JSON.parse(response);
  let playerResponseArray = jsonObject.signUps;

  let playersAbsence = [];
  let playersPresent = [];

  playerResponseArray.forEach (player => {
    if (player.className == "Absence" || player.className == "Tentative" || player.className == "Bench" || player.className == "Late") {
      playersAbsence.push(player.name);
    } else {
      playersPresent.push(player.userId);
    }
  })
  return [playersPresent, playersAbsence];
}

function fetchRaidSetup(ss) {
  let sheet = ss.getSheetByName("RaidSetup");
  let raidsetup = sheet.getRange("A1:A25").getValues();

  let output = []

  for (let i = 0; i < raidsetup.length; i++) {
    output.push(raidsetup[i][0])
  }

  return output
}

function updateSignupsAndBenches(env, ss, rowOffset, dataPlayersAvailable, dataRaidsetup) {
  let tableName = "";
  if (env == "prod") {
    tableName = "Member";
  } else if (env == "dev") {
    tableName = "testing";
  }

  let textboxOutput = "";
  let listSignupsPlusOne = "";
  let listBenchesPlusOne = "";
  let changesSignup = 0;
  let changesBench = 0;
  let sheet = ss.getSheetByName(tableName);
  let playersName = sheet.getRange("B6:B45").getValues();
  let playersDiscordUserid = sheet.getRange("G6:G45").getValues();
  let playersSignup = sheet.getRange("J6:J45").getValues();
  let playersBenches = sheet.getRange("K6:K45").getValues();

  for (let i = 0; i < playersDiscordUserid.length; i++) {
    let currentDiscordUserid = playersDiscordUserid[i][0];  
    let currentPlayerSignups = playersSignup[i][0];
    let currentPlayerBenches = playersBenches[i][0];
    let currentPlayerName = playersName[i][0];
    let currentRow = rowOffset + i;

    if (dataPlayersAvailable.includes(currentDiscordUserid)) {
      //SIGNUP+1
      changesSignup += 1;
      let currentPlayerNewSignup = currentPlayerSignups + 1;
      let currentSignupCell = "J" + currentRow;

      listSignupsPlusOne += currentPlayerName + ": " + currentPlayerSignups + " -> " + currentPlayerNewSignup + "\\n";

      if (env == "prod") {
        writeIntoCell(ss, currentPlayerNewSignup, tableName, currentSignupCell)
      }
      
      if (!dataRaidsetup.includes(currentDiscordUserid)) {
        //BENCH+1
        changesBench += 1;
        let currentPlayerNewBenches = currentPlayerBenches + 1;
        let currentBenchCell = "K" + currentRow;

        listBenchesPlusOne += currentPlayerName + ": " + currentPlayerBenches + " -> " + currentPlayerNewBenches + "\\n";

        if (env == "prod") {
          writeIntoCell(ss, currentPlayerNewBenches, tableName, currentBenchCell)
        }
      }
    }
  }

  textboxOutput += "Signup Changes: " + changesSignup + "\\n";
  textboxOutput += listSignupsPlusOne;
  textboxOutput += "\\n";
  textboxOutput += "Bench Changes: " + changesBench + "\\n";
  textboxOutput += listBenchesPlusOne;
  textboxOutput += "\\n";

  return textboxOutput;
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

function updateRaidCount(ss) {
  let sheet = ss.getSheetByName("Member");
  let raids = sheet.getRange("M3").getValue();
  sheet.getRange("M3").setValue(raids + 1);
}
