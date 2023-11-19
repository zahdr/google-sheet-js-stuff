function fix_bis_list() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()

  delete_duplica_rows(ss)
}

function btn_fix_bis_list() {
  fix_bis_list()
  Browser.msgBox("BIS Listen wurden fixed.")
}

function delete_duplica_rows (ss) {
  let sheet = ss.getSheetByName("BISListen")
  let max_rows = sheet.getLastRow()
  let data = sheet.getRange("I1:I" + max_rows).getValues()

  for (let i = max_rows - 1; i > 1; i--) {
    if (data[i][0] == data[i-1][0]) {
      sheet.deleteRow(i)
      console.log("DELETED ROW " + i)
    }
  }
  return 1
}
