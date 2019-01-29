const isWeekend = (): boolean => {
  const day: number = new Date().getDay()
  return day === 0 || day === 6
}

const randomFromArray = (items: any[]): any => {
  return items[Math.floor(Math.random() * items.length)]
}

const addSignToNumber = (num: number): string => {
  return num > 0 ? `+${num}` : num
}

const daysLeft = (): number => {
  const now: Date = new Date()
  const firstDay: Date = new Date(now.getFullYear() + 1, 0, 1)
  const diff: number = (firstDay.getTime() - now.getTime()) / 1000
  return Math.floor(diff / (24 * 60 * 60))
}

const getSpreadSheetUrl = (sheetName: string): string => {
  const spreadSheet: any = SpreadsheetApp.openById(SPREAD_SHEET_ID)
  const sheet: any = spreadSheet.getSheetByName(sheetName)
  return `${spreadSheet.getUrl()}#gid=${sheet.getSheetId()}`
}

const getSpreadSheet = (sheetName: string): any => {
  const spreadSheet: any = SpreadsheetApp.openById(SPREAD_SHEET_ID)
  return spreadSheet.getSheetByName(sheetName)
}

const getSpreadSheetValues = (sheetName: string): any[] => {
  return getSpreadSheet(sheetName)
    .getDataRange()
    .getValues()
}

const getGroupId = (json: any): void => {
  const UID: number = json.events[0].source.userId
  const GID: number = json.events[0].source.groupId
  const sheet = getSpreadSheet('Sheet1')
  sheet.getRange(1, 1).setValue(GID)
  return
}
