function createAddonExport() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()

  var allPlayerData = gatherPlayerBaseData(ss)
  var exportArray = buildExportArray(ss, allPlayerData)
  var exportString = arrayToString(exportArray)

  Logger.log(allPlayerData)

  writeIntoCell(ss, exportString, "AddonExport", "A1")
  writeRunTimestamp(ss, "admin", "O27")
}

function buttonCreateAddonExport() {
  createAddonExport()
  Browser.msgBox("Data Export wurde erstellt")
}


function gatherPlayerBaseData(ss) {
  let sheet = ss.getSheetByName("Member")
  let playerNames = sheet.getRange("B6:B45").getValues()
  let playerAttendances = sheet.getRange("M6:M45").getValues()
  let playerAvailableRaids = sheet.getRange("J6:J45").getValues()
  let playerBisItems = sheet.getRange("N6:N45").getValues()
  let playerTopThreeItemsReceived = sheet.getRange("O6:O45").getValues()
  let playerLastParseAvgs = sheet.getRange("P6:P45").getValues()
  let playerLastRatingAvgs = sheet.getRange("Q6:Q45").getValues()
  let overallRaids = sheet.getRange("M3").getValue()
  let playerJoinedAtId = sheet.getRange("H6:H45").getValues()

  let output = {}

  for (let i = 0; i < playerNames.length; i++) {
    let attendanceMod = getAttendanceMod(playerAttendances[i][0])
    let playerRaidsWithoutBis = 1 - (playerBisItems[i] / playerAvailableRaids[i]) 
    let playerName = playerNames[i][0]
    let lastParseAvg = playerLastParseAvgs[i][0]
    let lastRatingAvg = playerLastRatingAvgs[i][0]
    let playerMaxRaids = overallRaids - playerJoinedAtId[i][0] + 1
    let topThreeItemsReceived = playerTopThreeItemsReceived[i][0]
    let bisItemsReceived = playerBisItems[i][0]

    if (playerRaidsWithoutBis < 0) {
       playerRaidsWithoutBis = 0
    }

    output[playerName] = {attendanceMod, playerRaidsWithoutBis, lastParseAvg, lastRatingAvg, playerMaxRaids, topThreeItemsReceived, bisItemsReceived}
  }
  return output
}

function getAttendanceMod(attendance) {
  if (attendance >= 0.75) {
    return 1
  } else if (attendance >= 0.7) {
    return 0.8
  } else if (attendance >= 0.6) {
    return 0.7
  } else {
    return 0.5
  }
}

function buildExportArray(ss, playerData) {
  let sheet = ss.getSheetByName("BISListen")
  let lootType = sheet.getRange("A:A").getValues()
  let playerNames = sheet.getRange("D:D").getValues()
  let playerPrios = sheet.getRange("I:I").getValues()
  let itemIds = sheet.getRange("K:K").getValues()
  let receivedAts = sheet.getRange("N:N").getValues()

  let output = []

  for (let i = 0; i < lootType.length; i++) {
    if (lootType[i][0] == "wishlist") {
      let playerName = playerNames[i][0]
      let playerPrio = playerPrios[i][0]
      let itemId = itemIds[i][0]
      let receivedAt = receivedAts[i][0]
      let itemRating = calculateItemRating(playerName, playerPrio, playerData)
      let avgParse = ((playerData[playerName].lastParseAvg*100).toFixed(2).toString()) + "%"
      let bisItemsReceived = playerData[playerName].bisItemsReceived
      let topThreeItemsReceived = playerData[playerName].topThreeItemsReceived

      if (receivedAt == "" && playerName != "") {
        // {{Item ID; Player priority; BIS list priority; Player name; BIS received; TOP3 received; Player parse}}
        output.push([itemId, itemRating, playerPrio, playerName, bisItemsReceived, topThreeItemsReceived, avgParse])
      }
    }
  }
  return output
}

function calculateItemRating(playerName, itemPrio, playerData) {
  let prioPercentage = (17-itemPrio) / 16
  let attendanceMod = playerData[playerName].attendanceMod
  let playerRating = playerData[playerName].lastRatingAvg
  let raidsWithoutBis = playerData[playerName].playerRaidsWithoutBis
  let playerMaxRaids = playerData[playerName].playerMaxRaids

  let newcomerMod = 0
  if (playerMaxRaids >= 4) {
    newcomerMod = 1
  } else {
    newcomerMod = playerMaxRaids / 4
  }

  if (itemPrio <= 3) {
    raidsWithoutBis = 1
  }

  let output = ((prioPercentage * attendanceMod * playerRating * 0.9) + (raidsWithoutBis * 0.1)) * newcomerMod
  return ((output*100).toFixed(2).toString()) + "%"
}

function arrayToString(data) {
  let output = "{"

  data.forEach(item => {
    const entry = `{${item[0]};${item[1]};${item[2]};${item[3]};${item[4]};${item[5]};${item[6]}},`
    output += entry
  });

  output = output.slice(0, -1)
  output = output + "}"
  return output;
}

function writeIntoCell(ss, data, table, cell) {
  let sheet = ss.getSheetByName(table)
  sheet.getRange(cell).setValue(data)
}

function writeRunTimestamp(ss, table, cell) {
  let timestamp = Date.now()
  let date = new Date(timestamp).toLocaleString("tr-TR")
  writeIntoCell(ss, date, table, cell)
}
