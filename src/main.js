function notifyGarbage(date) {

  var properties = PropertiesService.getScriptProperties().getProperties();

  var spreadsheet = SpreadsheetApp.openById(properties.SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(properties.SHEET_NAME);

  // ごみ収集日の判定結果が格納されている範囲
  var startRow = 2
  var startCol = isToday(date) ? 6 : 7;
  var numRows = sheet.getLastRow() - startRow + 1;
  var numCols = 1

  // ごみ収集日の判定結果を取得
  var values = sheet.getSheetValues(startRow, startCol, numRows, numCols)

  // 収集日に該当するものがあれば通知
  for (var i = 0; i < numRows; i++) {
    if (values[i][0]) {
      var r = startRow + i;
      var c = 3;
      var type = sheet.getRange(r, c).getValue();
      var when = isToday(date) ? "今日" : "明日";
      postNotification(when, type);
    }
  }
}


function postNotification(when, type) {

  var properties = PropertiesService.getScriptProperties().getProperties();
  var webhook = properties.WEBHOOK_URL;

  var channel = "#general";
  var username = "ごみの日";
  var icon_emoji = ":recycle:";
  var attachment = {
    "title": type,
    "title_link": properties.CALENDAR_URL,
    "text": when + "は" + type + "の収集日です。"
  };

  Slack.postMessage(webhook, channel, username, icon_emoji, "", [attachment])
}


function isToday(date) {
  return date.toLowerCase() == "today";
}


function notifyTodaysGarbage() {
  Trigger.deleteTrigger("notifyTodaysGarbage");
  notifyGarbage("today");
}


function notifyTomorrowsGarbage() {
  Trigger.deleteTrigger("notifyTomorrowsGarbage");
  notifyGarbage("tomorrow");
}


// この関数を時間主導型のトリガーに指定しておく
function main() {
  Trigger.createTrigger( 7, 30, "notifyTodaysGarbage");
  Trigger.createTrigger(22,  0, "notifyTomorrowsGarbage");
}
