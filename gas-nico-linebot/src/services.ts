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

const getWikipediaUrlAndBody = (q: string): { url: string; body: string } => {
  const simpleWikipediaApi: string = 'http://wikipedia.simpleapi.net/api'
  const url: string = `${simpleWikipediaApi}?keyword=${encodeURIComponent(
    q
  )}&output=json`
  const res: any = JSON.parse(UrlFetchApp.fetch(url))
  if (!res) {
    return
  }
  return {
    url: res[0].url,
    body: res[0].body
  }
}

const getMoneyRate = (): any[] => {
  const url: string = 'https://www.gaitameonline.com/rateaj/getrate'
  const res = UrlFetchApp.fetch(url)
  return JSON.parse(res.getContentText()).quotes
}

const getMoneyRateByPairCode = (pairCode: string): any => {
  const moneyRate: any[] = getMoneyRate()
  let targetRate = {}
  for (const rate of moneyRate) {
    if (rate.currencyPairCode === pairCode) {
      targetRate = rate
      break
    }
  }
  return targetRate
}

const getMoneyRateMessage = (rate: {
  high: number
  low: number
  ask: number
  bid: number
  currencyPairCode: string
  open: number
}): string => {
  return `Pair: ${rate.currencyPairCode} High: ${rate.high} Low: ${
    rate.low
  } ask: ${rate.ask} bid: ${rate.bid}`
}

const getTwitterTrends = (locationId: number): any[] => {
  const url: string = `https://api.twitter.com/1.1/trends/place.json?id=${locationId}`
  const res = UrlFetchApp.fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`
    }
  })
  return JSON.parse(res.getContentText())[0].trends
}

const getTwitterTrendsMessage = (trends: any[], limit = 10): string => {
  return trends
    .slice(0, limit)
    .map((t, i) => `${i + 1}. ${t.name}`)
    .join('\n')
}

const postToLine = (text: string): void => {
  const API_URL: string = 'https://api.line.me/v2/bot/message/push'
  UrlFetchApp.fetch(API_URL, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_TOKEN}`
    },
    method: 'post',
    payload: JSON.stringify({
      to: LINE_GROUP_ID,
      messages: [
        {
          type: 'text',
          text
        }
      ]
    })
  })
  return
}

const getCurrentWithingsChartImageLink = (): string => {
  const sheet = getSpreadSheet(SHEET_NAMES.WITHINGS_CHART)
  const charts = sheet.getCharts()
  const filename: string = 'graph.png'
  const imageBlob = charts[0]
    .getBlob()
    .getAs('image/png')
    .setName(filename)
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_WITHINGS)
  const files: any[] = folder.getFilesByName(filename)
  // delete old file
  while (files.hasNext()) {
    folder.removeFile(files.next())
  }
  // save image
  const createdFile = folder.createFile(imageBlob)
  return `https://drive.google.com/uc?export=view&id=${createdFile.getId()}`
}

const postImageToLine = ({
  imageUrl,
  previewImageUrl
}: {
  imageUrl: string
  previewImageUrl: string
}): void => {
  const API_URL: string = 'https://api.line.me/v2/bot/message/push'
  UrlFetchApp.fetch(API_URL, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_TOKEN}`
    },
    method: 'post',
    payload: JSON.stringify({
      to: LINE_GROUP_ID,
      messages: [
        {
          type: 'image',
          originalContentUrl: imageUrl,
          previewImageUrl: previewImageUrl || imageUrl
        }
      ]
    })
  })
  return
}

const getWeatherForecast = (cityId: number) => {
  // ref: http://weather.livedoor.com/weather_hacks/webservice
  const baseUrl: string =
    'http://weather.livedoor.com/forecast/webservice/json/v1'
  const res: any = UrlFetchApp.fetch(`${baseUrl}?city=${cityId}`, {
    method: 'get'
  })
  if (!res) {
    return {}
  }
  return JSON.parse(res.getContentText())
}

const formatWeatherForecastMessage = ({
  dayId,
  forecastData
}: {
  dayId: number
  forecastData: any
}): string => {
  const telop: string = forecastData.forecasts[dayId].telop
  const areaName: string = forecastData.location.city
  const temp = forecastData.forecasts[dayId].temperature
  const min: number = Number(temp.min && temp.min.celsius)
  const max: number = Number(temp.max && temp.max.celsius)
  let comment: string = ''
  if (/雨/.test(telop)) {
    comment = `傘が必要かも${BOT_PHRASE}`
  }

  const unknownText: string = '-'
  return [
    `${areaName}: ${telop}`,
    `気温(最低/最高): ${min || unknownText} / ${max || unknownText}`,
    comment
  ]
    .filter(v => v)
    .join('\n')
}

const weatherForecast = (dayId: number): string => {
  const weatherTokyo = getWeatherForecast(130010)
  const weatherKochi = getWeatherForecast(390010)
  if (!weatherTokyo || !weatherKochi) {
    return
  }
  const targetDays: string[] = ['今日', '明日', '明後日']
  return [
    `${targetDays[dayId]}の天気${BOT_PHRASE}!`,
    formatWeatherForecastMessage({ dayId, forecastData: weatherTokyo }),
    '',
    formatWeatherForecastMessage({ dayId, forecastData: weatherKochi })
  ].join('\n')
}

const getStockInfo = (companyCode: number): any => {
  const url: string = `https://stocks.finance.yahoo.co.jp/stocks/detail/?code=${companyCode}`
  const contentText: string = UrlFetchApp.fetch(url).getContentText()

  const matchedName: string[] = contentText.match(
    new RegExp(`(<th class="symbol"><h1>)(.+)(</h1></th>)`)
  )
  if (!matchedName) {
    return {}
  }
  const name: string = matchedName[2]

  const matchedPrice: string[] = contentText.match(
    new RegExp(`(<td class="stoksPrice">)([0-9|,|\.]+)(</td>)`)
  )
  if (!matchedPrice) {
    return {}
  }
  const price: string = matchedPrice[2]

  const matchedComparison: string[] = contentText.match(
    new RegExp(
      `<td class="change"><span class="yjSt">前日比</span><span class="(.*)yjMSt">(.+)</span></td>`
    )
  )
  if (!matchedComparison) {
    return {}
  }
  const comparison: string = matchedComparison[2]
  return { name, price, comparison }
}

const getStockInfoMessage = (stockInfo: {
  name: string
  price: string
  comparison: string
}): string => {
  return `${stockInfo.name} の現在の株価は ${stockInfo.price}円 前日比${
    stockInfo.comparison
  } です`
}

const getUserLocalMessage = (text: string): string => {
  const url: string = `https://chatbot-api.userlocal.jp/api/chat?key=${USER_LOCAL_API_KEY}&message=${text}&bot_name=${BOT_NAME}`
  const res = UrlFetchApp.fetch(url)
  return JSON.parse(res.getContentText()).result
}

const googleTranslate = (text: string, from = 'ja', to = 'en'): any => {
  return LanguageApp.translate(text, from, to)
}

const getLastWithingsMeasure = (): any => {
  const sheet: any = getSpreadSheet(SHEET_NAMES.WITHINGS)
  const lastRow: number = sheet.getLastRow()
  return {
    username: sheet.getRange(lastRow, WITHINGS_COLUMNS.USERNAME).getValue(),
    weight: sheet.getRange(lastRow, WITHINGS_COLUMNS.WEIGHT).getValue(),
    fatPercent: sheet
      .getRange(lastRow, WITHINGS_COLUMNS.FAT_PERCENT)
      .getValue(),
    date: sheet.getRange(lastRow, WITHINGS_COLUMNS.DATE).getValue()
  }
}

const amazonWishList = (): void => {
  const lows: any[] = getSpreadSheetValues(SHEET_NAMES.WISHLIST)
  const messages = []
  const wishlistUrl: string = getSpreadSheetUrl(SHEET_NAMES.WISHLIST)

  for (const low of lows) {
    messages.push(`${low[0]}: ${low[1]}`)
  }
  if (!messages) {
    return
  }
  postToLine(messages.join('\n'))
  postToLine(
    [
      `ほしいものリスト変更する場合はここから変更できる${BOT_PHRASE}`,
      wishlistUrl
    ].join('\n')
  )
  return
}

const whatTheDay = (): string => {
  const lows: any[] = getSpreadSheetValues(SHEET_NAMES.ANNIVERSARY)
  const d: Date = new Date()
  const today: string = `${d.getMonth() + 1}/${d.getDate()}`
  for (const low of lows) {
    if (low[0] === today) {
      const subject: string = low[1]
      const target: string = low[2]
      if (!subject) {
        return
      }

      if (subject === '誕生日') {
        postToLine(`今日は${target}の誕生日！おめでと${BOT_PHRASE}！`)
      } else {
        postToLine(`今日は${subject}だ${BOT_PHRASE}！`)
      }
      return
    }
  }
  return `今日は${today}、今年もあと${daysLeft()}日${BOT_PHRASE}`
}
