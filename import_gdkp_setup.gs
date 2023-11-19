function import_raid_setup() {
  let api_key = get_api_key()
  let event_id = get_event_id(api_key)
  let raid_setup = get_raid_setup(api_key, event_id)
  var ss = SpreadsheetApp.getActiveSpreadsheet()

  write_raid_setup(ss, raid_setup, 4, 13)
  write_raid_setup(ss, raid_setup, 19, 1)
  Browser.msgBox("Raidsetup wurde importiert")
}


function get_api_key() {
  let api_key = INSERT_HERE
  return api_key
}

function get_event_id(key) {
  let api_url = INSERT_HERE
  let options = {"headers": {"Authorization": key},
                 "method": "GET"
                }
  let response = UrlFetchApp.fetch(api_url, options)
  let json_object = JSON.parse(response)

  let posted_events = json_object.postedEvents
  let event_id = 0
  
  posted_events.forEach(event => {
    if (event.channelName === "icc25-mittwoch") {
      event_id = event.id
    }  
  })
  return event_id
}

function get_raid_setup(key, event) {
  // name, class, ms, type, range
  let api_url = "https://raid-helper.dev/api/raidplan/" + event
  let options = {"headers": {"Authorization": key},
                 "method": "GET"
                }
  let response = UrlFetchApp.fetch(api_url, options)
  let json_object = JSON.parse(response)

  let raid_setup = []
  json_object.raidDrop.forEach ( slot => {
    let translated_spec = translate_spec(slot.spec)
    raid_setup.push([slot.name, translated_spec.player_class, translated_spec.spec, translated_spec.type, translated_spec.range])
  })
  console.log(raid_setup)
  return raid_setup
}

function translate_spec(spec) {
  let dict = {
    "Blood_Tank": {player_class: "Death Knight", spec: "Blood", type: "Tank", range: "Melee"},
    "Frost_Tank": {player_class: "Death Knight", spec: "Frost", type: "Tank", range: "Melee"},
    "Unholy_Tank": {player_class: "Death Knight", spec: "Unholy", type: "Tank", range: "Melee"},
    "Blood_DPS": {player_class: "Death Knight", spec: "Blood", type: "DPS", range: "Melee"},
    "Frost_DPS": {player_class: "Death Knight", spec: "Frost", type: "DPS", range: "Melee"},
    "Unholy_DPS": {player_class: "Death Knight", spec: "Unholy", type: "DPS", range: "Melee"},
    
    "Arms": {player_class: "Warrior", spec: "Arms", type: "DPS", range: "Melee"},
    "Fury": {player_class: "Warrior", spec: "Fury", type: "DPS", range: "Melee"},
    "Protection": {player_class: "Warrior", spec: "Protection", type: "Tank", range: "Melee"},

    "Balance": {player_class: "Druid", spec: "Balance", type: "DPS", range: "Range"},
    "Feral": {player_class: "Druid", spec: "Feral", type: "DPS", range: "Melee"},
    "Restoration": {player_class: "Druid", spec: "Restoration", type: "Heal", range: "Range"},
    "Guradian": {player_class: "Druid", spec: "Guardian", type: "Tank", range: "Melee"},

    "Holy1": {player_class: "Paladin", spec: "Holy", type: "Heal", range: "Range"},
    "Protection1": {player_class: "Paladin", spec: "Protection", type: "Tank", range: "Melee"},
    "Retribution": {player_class: "Paladin", spec: "Retribution", type: "DPS", range: "Melee"},

    "Assassination": {player_class: "Rogue", spec: "Assassination", type: "DPS", range: "Melee"},
    "Combat": {player_class: "Rogue", spec: "Combat", type: "DPS", range: "Melee"},
    "Subtlety": {player_class: "Rogue", spec: "Subtlety", type: "DPS", range: "Melee"},

    "Beastmastery": {player_class: "Hunter", spec: "Beast Mastery", type: "DPS", range: "Range"},
    "Marksmanship": {player_class: "Hunter", spec: "Marksmanship", type: "DPS", range: "Range"},
    "Survival": {player_class: "Hunter", spec: "Survival", type: "DPS", range: "Range"},

    "Arcane": {player_class: "Mage", spec: "Arcane", type: "DPS", range: "Range"},
    "Fire": {player_class: "Mage", spec: "Fire", type: "DPS", range: "Range"},
    "Frost": {player_class: "Mage", spec: "Frost", type: "DPS", range: "Range"},

    "Affliction": {player_class: "Warlock", spec: "Affliction", type: "DPS", range: "Range"},
    "Demonology": {player_class: "Warlock", spec: "Demonology", type: "DPS", range: "Range"},
    "Destruction": {player_class: "Warlock", spec: "Destruction", type: "DPS", range: "Range"},

    "Discipline": {player_class: "Priest", spec: "Discipline", type: "Heal", range: "Range"},
    "Holy": {player_class: "Priest", spec: "Holy", type: "Heal", range: "Range"},
    "Shadow": {player_class: "Priest", spec: "Shadow", type: "DPS", range: "Range"},
    "Smite": {player_class: "Priest", spec: "Smite", type: "DPS", range: "Range"},

    "Elemental": {player_class: "Shaman", spec: "Elemental", type: "DPS", range: "Range"},
    "Enhancement": {player_class: "Shaman", spec: "Enhancement", type: "DPS", range: "Melee"},
    "Restoration1": {player_class: "Shaman", spec: "Restoration", type: "Heal", range: "Range"},
  }  

  return dict[spec]
}

function write_raid_setup(spreadsheet, setup, row_start, column_start) {
  let sheet = spreadsheet.getSheetByName("data")
  for (let i = 0; i < setup.length; i++) {
    let row = row_start + i
    let column = column_start
    for (let j = 0; j <= 5; j++) {
      column += 1
      sheet.getRange(row, column).setValue(setup[i][j])
    }
  }
}
