function importParses() {
  var confirm = Browser.msgBox('Parses importieren','Bist du dir sicher, dass du das ausführen möchtest?', Browser.Buttons.OK_CANCEL);
  if(confirm=='ok'){ 
    let accessToken = getAccessToken();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetParses = ss.getSheetByName("Parses"); 
    var sheetPlayerRatings = ss.getSheetByName("PlayerRatings")
    var reportId = getRaidId(ss);
    
    var raidData = getRaidData(accessToken, reportId);  
    var raidDate = getRaidDate(raidData);
    var rankedCharacters = getRankedCharacters(raidData);
    var encounterData = getBossParses(raidData);

    sheetPlayerRatings.appendRow(["------ NEW IMPORT BELOW ------"]);

    rankedCharacters.forEach(currentPlayer => {    
      var playerParses = buildPlayerParses(encounterData, currentPlayer);
      var currentPlayerAvgParse = 0;
      var tmpSum = 0;
      for (var i =0 ; i < playerParses.length; i++) {
        tmpSum += playerParses[i];
      }
      if (tmpSum != 0) {
        currentPlayerAvgParse = Math.floor(tmpSum / playerParses.length);

        Logger.log([currentPlayer, currentPlayerAvgParse, reportId, raidDate]);
        sheetPlayerRatings.appendRow([currentPlayer, 100, null, null, reportId, raidDate])
        sheetParses.appendRow([currentPlayer, currentPlayerAvgParse, reportId, raidDate]);
      }
    })
    writeRunTimestamp(ss, "admin", "O3")
    Browser.msgBox("Parses wurden importiert");
  }
}


function getAccessToken() {
  let accessToken = INSERT_HERE  
  
  return accessToken;
}

function getRaidId(ss) {
  let sheet = ss.getSheetByName("admin");
  let reportUrl = sheet.getRange("K5").getValue();
  let reportId = reportUrl.split("reports/");

  return reportId[1];
}

function getRaidData(accessToken, reportId) {
  let query = "query {reportData {report (code:\"" + reportId + "\"){startTime rankedCharacters{name} rankings}}}";
  let apiUrl = "https://classic.warcraftlogs.com/api/v2/client";
  let options = {"headers": {"Authorization": "Bearer " + accessToken,
                              "Content-Type": "application/json"
                              },
                  "payload": JSON.stringify({query}),
                  "method": "POST"
                  }
  let response = UrlFetchApp.fetch(apiUrl, options);
  let jsonObject = JSON.parse(response);

  return jsonObject;
}

function getRankedCharacters(raidData) {
  let rankedCharactersDataArray = raidData.data.reportData.report.rankedCharacters;
  let rankedCharacters = [];

  rankedCharactersDataArray.forEach(character => {
    rankedCharacters.push(character.name);
  })

  return rankedCharacters;
}

function getRaidDate(raidData) {
  let startTimeDataArray = raidData.data.reportData.report.startTime;
  let date = new Date(startTimeDataArray).toLocaleDateString("ru-RU")

  return date;
}

function getBossParses(raidData) {
  let bossParses = [];
  let encounterData = raidData.data.reportData.report.rankings.data;

  for (let i = 0; i < encounterData.length; i++) {
    let zone = encounterData[i].zone;
    let encounter = encounterData[i].encounter;
    let tanks = encounterData[i].roles.tanks.characters;
    let healers = encounterData[i].roles.healers.characters;
    let dps = encounterData[i].roles.dps.characters;
   
    //if ((zone == 1018) && (encounter.id == 629 || encounter.id == 633 || encounter.id == 641 || encounter.id == 645)) {
    if ((zone == 1020) && (encounter.id != 847)) {
      let players = [];

      Logger.log(zone + " " + encounter.name);

      for (let j = 0; j < tanks.length; j++) {
        let character = tanks[j];
        let playerName = character.name;
        let playerParse = character.rankPercent;
        players.push([playerName, playerParse]);
      }

      for (let j = 0; j < healers.length; j++) {
        let character = healers[j];
        let playerName = character.name;
        let playerParse = character.rankPercent;
        players.push([playerName, playerParse]);
      }

      for (let j = 0; j < dps.length; j++) {
        let character = dps[j];
        let playerName = character.name;
        let playerParse = character.rankPercent;
        players.push([playerName, playerParse]);
      }

      Logger.log([encounter.name, ...players]);
      bossParses.push([encounter.name, ...players]);
    }
  }
  return bossParses;
}

function buildPlayerParses(encounterData, player) {
  let playerParses = [];

  for (var i = 0; i < encounterData.length; i++) {
    for (var j = 0; j < encounterData[i].length; j++) {
      if (encounterData[i][j][0] === player) {
        playerParses.push(encounterData[i][j][1]);
      }
    }
  }
  return playerParses;
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
