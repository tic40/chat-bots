const properties = PropertiesService.getScriptProperties()
// slack
const LINE_TOKEN: string = properties.getProperty('LINE_TOKEN')
const LINE_GROUP_ID: string = properties.getProperty('LINE_GROUP_ID')
const BOT_PHRASE: string = properties.getProperty('BOT_PHRASE')
const SPREAD_SHEET_ID: string = properties.getProperty('SPREAD_SHEET_ID')
const BOT_NAME: string = properties.getProperty('BOT_NAME')
const USER_LOCAL_API_KEY: string = properties.getProperty('USER_LOCAL_API_KEY')
const COMPANY_CODE_NIKKEI_AVE: number = 998407
const DRIVE_FOLDER_WITHINGS: string = properties.getProperty(
  'DRIVE_FOLDER_WITHINGS'
)
const TWITTER_BEARER_TOKEN: string = properties.getProperty(
  'TWITTER_BEARER_TOKEN'
)

const SHEET_NAMES: any = {
  WISHLIST: 'wishlist',
  BOT_PHOTO: 'photo',
  ANNIVERSARY: 'anniversary',
  WITHINGS: 'withings',
  WITHINGS_CHART: 'withingsChart',
  PROVERB: 'proverb'
}

const WEATHER_FORECAST_DAY_ID: any = {
  TODAY: 0,
  TOMORROW: 1,
  DAY_AFTER_TOMORROW: 2
}

const WITHINGS_COLUMNS: any = {
  USERNAME: 1,
  WEIGHT: 2,
  FAT_PERCENT: 3,
  DATE: 4
}

const MESSAGES: any = {
  response: [
    `よんだか${BOT_PHRASE}？`,
    `なんだ${BOT_PHRASE}？`,
    `眠い${BOT_PHRASE}`,
    `お腹空いた${BOT_PHRASE}`,
    `なでて${BOT_PHRASE}`,
    `zzz`,
    `なんか用か${BOT_PHRASE}`,
    `${BOT_NAME} ヘルプで使い方を教える${BOT_PHRASE}`
  ],
  morningCall: [
    `おはよう${BOT_PHRASE}！`,
    `Good morning ${BOT_PHRASE}！`,
    `もう朝だ${BOT_PHRASE}！起きる${BOT_PHRASE}`,
    `今日も1日がんばる${BOT_PHRASE}！`,
    `朝だ${BOT_PHRASE}！はよ起きる${BOT_PHRASE}`
  ],
  eveningCall: [`今日も１日おつかれさま${BOT_PHRASE}！`],
  encourageDietTask: [
    `今日はまだ体重計にのってない${BOT_PHRASE}！`,
    `体重計、忘れてないか${BOT_PHRASE}？`,
    `体重計、まだ乗ってない気がする${BOT_PHRASE}...`,
    `体重計たぶんまだ乗ってない${BOT_PHRASE}...`,
    `体重計、乗ろう${BOT_PHRASE}？`
  ],
  doneDietTask: [
    `Good${BOT_PHRASE}！続けることが大事${BOT_PHRASE}！`,
    `体重計も喜んでる${BOT_PHRASE}！`,
    `体重計に乗り続ける意志力${BOT_PHRASE}！`,
    `がんばる${BOT_PHRASE}！その調子で続ける${BOT_PHRASE}！`,
    `目標達成できそうか${BOT_PHRASE}？`
  ],
  help: [
    `${BOT_NAME}はいろいろなことができる${BOT_PHRASE}\n`,
    `${BOT_NAME}〇〇って何？ で知識検索する${BOT_PHRASE}`,
    `${BOT_NAME}ほしいもの でほしいものリストを出す${BOT_PHRASE}`,
    `${BOT_NAME}翻訳〇〇 で日英翻訳する${BOT_PHRASE}`,
    `${BOT_NAME}天気 で今日の天気を予想する${BOT_PHRASE}`,
    `${BOT_NAME}〇〇 で${BOT_NAME}と会話する${BOT_PHRASE}`,
    `${BOT_NAME}画像 で${BOT_NAME}の画像を出す${BOT_PHRASE}`,
    `${BOT_NAME}体重 で最新の体重を教える${BOT_PHRASE}`,
    `${BOT_NAME}株価 で最新の株価を教える${BOT_PHRASE}`,
    `${BOT_NAME}為替 で最新の為替レートを教える${BOT_PHRASE}`,
    `${BOT_NAME}トレンド で最新のトレンドを教える${BOT_PHRASE}`
  ]
}

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
    comment = `傘が必要かもしれんね`
  }

  const unknownText: string = '-'
  return [
    `${areaName}: ${telop}`,
    `気温(最低/最高): ${min || unknownText} / ${max || unknownText}`,
    comment
  ].join('\n')
}

const weatherForecast = (dayId: number): void => {
  const weatherTokyo = getWeatherForecast(130010)
  const weatherKochi = getWeatherForecast(390010)
  if (!weatherTokyo || !weatherKochi) {
    return
  }
  const targetDays: string[] = ['今日', '明日', '明後日']
  postToLine(
    [
      `${targetDays[dayId]}の天気${BOT_PHRASE}!`,
      formatWeatherForecastMessage({ dayId, forecastData: weatherTokyo }),
      formatWeatherForecastMessage({ dayId, forecastData: weatherKochi })
    ].join('\n')
  )
  return
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

const handleWebhookFromWithings = (json: any): void => {
  const lastData: any = getLastWithingsMeasure()
  const lastWeight: number = lastData.weight || json.weight
  const lastFatPercent: number = lastData.fatPercent || json.fatPercent
  const diffs: any = {
    weight: addSignToNumber(Math.floor((json.weight - lastWeight) * 100) / 100),
    fatPercent: addSignToNumber(
      Math.floor((json.fatPercent - lastFatPercent) * 100) / 100
    )
  }
  postToLine(
    [
      `${json.username}が体重計に乗ったよ`,
      `体重: ${json.weight} kg (${diffs.weight})`,
      `体脂肪: ${json.fatPercent} % (${diffs.fatPercent})`,
      `計測日: ${json.date}`
    ].join('\n')
  )

  const date: Date = new Date(
    json.date.slice(0, json.date.indexOf('at')).trim()
  )
  const formattedDate: string = `${date.getFullYear()}/${date.getMonth() +
    1}/${date.getDate()}`
  const sheet: any = getSpreadSheet(SHEET_NAMES.WITHINGS)
  const nextRow: number = sheet.getLastRow() + 1
  sheet.getRange(nextRow, WITHINGS_COLUMNS.USERNAME).setValue(json.username)
  sheet.getRange(nextRow, WITHINGS_COLUMNS.WEIGHT).setValue(json.weight)
  sheet
    .getRange(nextRow, WITHINGS_COLUMNS.FAT_PERCENT)
    .setValue(json.fatPercent)
  sheet.getRange(nextRow, WITHINGS_COLUMNS.DATE).setValue(formattedDate)

  // post chart image
  const imageUrl: string = getCurrentWithingsChartImageLink()
  postImageToLine({
    imageUrl,
    previewImageUrl: imageUrl
  })
  postToLine(randomFromArray(MESSAGES.doneDietTask))
  return
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

const whatTheDay = (): void => {
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
      } else if (subject === '命日') {
        postToLine(
          `今日は${target}の命日だ${BOT_PHRASE}。思い出すと寂しくなる${BOT_PHRASE}...`
        )
      } else {
        postToLine(`今日は${subject}だ${BOT_PHRASE}！`)
      }
      return
    }
  }
  postToLine(`今日は${today}、今年もあと${daysLeft()}日${BOT_PHRASE}`)
  return
}

const handleWebhookFromLine = (json: any): void => {
  if (json.events[0].type !== 'message') {
    return
  }
  if (json.events[0].source.groupId !== LINE_GROUP_ID) {
    return
  }

  const BOT_NAME_REGEXP_STRING: string = `(${BOT_NAME}ちゃん|${BOT_NAME}ー|${BOT_NAME}〜|${BOT_NAME})`
  const message: string = json.events[0].message.text.trim()

  if (new RegExp(`^${BOT_NAME_REGEXP_STRING}$`).test(message)) {
    postToLine(randomFromArray(MESSAGES.response))
    return
  }

  if (new RegExp(`^${BOT_NAME_REGEXP_STRING}(.*)って(なに|何)`).test(message)) {
    const replacedMessage: string = message.replace(/,|、/g, '')
    const q: string = replacedMessage.match(
      new RegExp(`${BOT_NAME_REGEXP_STRING}(.*)って(なに|何)`)
    )[2]
    const urlAndBody: any = getWikipediaUrlAndBody(q.trim())
    if (!urlAndBody) {
      postToLine(`...それは知らない${BOT_PHRASE}`)
      return
    }
    postToLine(`${urlAndBody.body.substr(0, 140)}...`)
    postToLine(`詳しくはここ見てな\n${urlAndBody.url}`)
    return
  }

  if (
    new RegExp(`^${BOT_NAME_REGEXP_STRING}.*(ほしいもの|欲しいもの)`).test(
      message
    )
  ) {
    amazonWishList()
    return
  }

  if (new RegExp(`^${BOT_NAME_REGEXP_STRING}(.*)画像`).test(message)) {
    const photos: any[] = getSpreadSheetValues(SHEET_NAMES.BOT_PHOTO)
    const imageUrl: string = randomFromArray(photos)[0]
    postImageToLine({
      imageUrl,
      previewImageUrl: imageUrl
    })
    return
  }

  if (new RegExp(`^${BOT_NAME_REGEXP_STRING}(.*)体重`).test(message)) {
    const lastData: any = getLastWithingsMeasure()
    if (!lastData.weight) {
      postToLine(`データがない${BOT_PHRASE}`)
      return
    }
    const imageUrl: string = getCurrentWithingsChartImageLink()
    postImageToLine({
      imageUrl,
      previewImageUrl: imageUrl
    })
    return
  }

  if (
    new RegExp(`^${BOT_NAME_REGEXP_STRING}(.*)(翻訳して|翻訳)(.+)`).test(
      message
    )
  ) {
    const matched: string[] = message.match(
      new RegExp(`^${BOT_NAME_REGEXP_STRING}(.*)(翻訳して|翻訳)(.+)`)
    )
    const text: string = matched[matched.length - 1]
    const translatedText: string = googleTranslate(text.trim())
    postToLine(translatedText || '...')
    return
  }

  if (new RegExp(`^${BOT_NAME_REGEXP_STRING}(.*)天気`).test(message)) {
    let dayId: number = WEATHER_FORECAST_DAY_ID.TODAY
    if (message.indexOf('明日') !== -1) {
      dayId = WEATHER_FORECAST_DAY_ID.TOMORROW
    } else if (message.indexOf('明後日') !== -1) {
      dayId = WEATHER_FORECAST_DAY_ID.DAY_AFTER_TOMORROW
    }
    weatherForecast(dayId)
    return
  }

  if (new RegExp(`^${BOT_NAME_REGEXP_STRING}(.*)為替`).test(message)) {
    postToLine('現在の為替レート取得中...')
    const rate: any = getMoneyRateByPairCode('USDJPY')
    if (!rate || !rate.ask) {
      postToLine('為替レートの取得に失敗しました')
      return
    }
    postToLine(getMoneyRateMessage(rate))
    return
  }

  if (
    new RegExp(`^${BOT_NAME_REGEXP_STRING}(.*)(ヘルプ|へるぷ|help)`, 'i').test(
      message
    )
  ) {
    postToLine(MESSAGES.help.join('\n'))
    return
  }

  if (
    new RegExp(
      `^${BOT_NAME_REGEXP_STRING}(.*)(とれんど|トレンド|trend)`,
      'i'
    ).test(message)
  ) {
    // japan: 23424856 tokyo: 1118370
    postToLine(
      [
        `現在のトレンドだ${BOT_PHRASE}`,
        `${getTwitterTrendsMessage(getTwitterTrends(23424856))}`
      ].join('\n')
    )
    return
  }

  if (new RegExp(`^${BOT_NAME_REGEXP_STRING}(.*)株価`).test(message)) {
    postToLine(`株価取得中...`)
    const companyCode: number = 998407 // nikkei average code
    const stockInfo: any = getStockInfo(companyCode)
    if (!stockInfo.name) {
      postToLine('株価の取得に失敗しました')
    } else {
      postToLine(getStockInfoMessage(stockInfo))
    }
    return
  }

  if (new RegExp(`${BOT_NAME_REGEXP_STRING}(.*)`).test(message)) {
    const matchedMessages: string[] = message.match(
      new RegExp(`^${BOT_NAME_REGEXP_STRING}(.*)`)
    )
    let matchedMessage: string = matchedMessages[matchedMessages.length - 1]
    matchedMessage = matchedMessage.replace(/^(,|、|\.)/, '').trim()
    if (!matchedMessage) {
      return
    }
    postToLine(getUserLocalMessage(matchedMessage))
    return
  }
  return
}

const doPost = (e): void => {
  const json: any = JSON.parse(e.postData.getDataAsString())

  if (json.title === 'withings') {
    handleWebhookFromWithings(json)
    return
  }
  handleWebhookFromLine(json)
  return
}

function morningCall(): void {
  postToLine(randomFromArray(MESSAGES.morningCall))
  whatTheDay()
}

function encourageDietTask(): void {
  const now: Date = new Date()
  const today: string = `${now.getFullYear()}/${now.getMonth() +
    1}/${now.getDate()}`
  const lastData: any = getLastWithingsMeasure()
  if (lastData.date === today) {
    return
  }
  postToLine(randomFromArray(MESSAGES.encourageDietTask))
  postToLine(`最後に計測したのは ${lastData.date} だ${BOT_PHRASE}`)
}

function eveningCall(): void {
  postToLine(randomFromArray(MESSAGES.eveningCall))
  weatherForecast(WEATHER_FORECAST_DAY_ID.TOMORROW)

  if (isWeekend()) {
    return
  }
  postToLine(
    [
      `今日の株価と為替レートだ${BOT_PHRASE}`,
      getStockInfoMessage(getStockInfo(COMPANY_CODE_NIKKEI_AVE)),
      getMoneyRateMessage(getMoneyRateByPairCode('USDJPY'))
    ].join('\n')
  )
}

function trendReport(): void {
  postToLine(
    [
      `現在のトレンドだよ。もうチェックした${BOT_PHRASE}？`,
      `${getTwitterTrendsMessage(getTwitterTrends(23424856))}`
    ].join('\n')
  )
}

function test(): void {
  Logger.log('execute test')
}

/*
function getProverb(): void {
  const url: string = 'http://www.meigensyu.com/quotations/index/'
  const firstPage: number = 1
  const lastPage = 98

  const ary = []
  for (const i = firstPage; i <= lastPage; i++) {
    const contentText: string = UrlFetchApp.fetch(`${url}page${i}.html`).getContentText()
    const matched: string[] = contentText.match( new RegExp(`(<div class="text">)(.+)(</div>)`, 'g'))
    for (const str of matched) {
      const m = str.match(new RegExp('^<div class="text">([^<]+)'))
      ary.push(m[1])
    }
  }
  Logger.log(ary.length)
  const spreadSheet: any = SpreadsheetApp.openById(SPREAD_SHEET_ID)
  const sheet = spreadSheet.getSheetByName(SHEET_NAMES.PROVERB)
  for (const i = 0; i < ary.length; i++) {
    sheet.getRange(i+1, 1).setValue(ary[i])
  }
}
*/
