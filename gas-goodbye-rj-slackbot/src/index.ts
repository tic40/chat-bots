const properties = PropertiesService.getScriptProperties()

const BOT_NAME: string = properties.getProperty('BOT_NAME')
const BOT_PHRASE: string = properties.getProperty('BOT_PHRASE')
const GITHUB_URL: string = properties.getProperty('GITHUB_URL')
const SLACK_BOT_ICON_EMOJI: string = properties.getProperty(
  'SLACK_BOT_ICON_EMOJI'
)
const SLACK_BOT_USERNAME: string = properties.getProperty('SLACK_BOT_USERNAME')
const SLACK_CHANNEL: string = properties.getProperty('SLACK_CHANNEL')
const SLACK_OUTGOING_WEBHOOK_TOKEN: string = properties.getProperty(
  'SLACK_OUTGOING_WEBHOOK_TOKEN'
)
const SLACK_WEBHOOK_URL: string = properties.getProperty('SLACK_WEBHOOK_URL')
const SPREAD_SHEET_ID: string = properties.getProperty('SPREAD_SHEET_ID')
const USER_LOCAL_API_KEY: string = properties.getProperty('USER_LOCAL_API_KEY')
const RJ: string[] = properties.getProperty('RJ').split(',')
const COMPANY_CODE_RJ: number = Number(
  properties.getProperty('COMPANY_CODE_RJ')
)
const RJ_DAY: number = Number(properties.getProperty('RJ_DAY'))
const TWITTER_BEARER_TOKEN: string = properties.getProperty(
  'TWITTER_BEARER_TOKEN'
)
const PROGRESS_TARGET_CHANNEL: string = properties.getProperty(
  'PROGRESS_TARGET_CHANNEL'
)
const IMGURL_CLIENT_ID: string = properties.getProperty('IMGURL_CLIENT_ID')
const GET_PAIRS_URL: string = properties.getProperty('GET_PAIRS_URL')
const COMPANY_CODE_NIKKEI_AVE: number = 998407

const SHEET_NAMES: any = {
  EVENING_CALL: 'evening_call',
  KYOMO_ICHINICHI: 'kyoumo_ichinichi',
  MISSION: 'mission',
  HOW_IS_PROGRESS: 'how_is_progress',
  OPENING_CALL: 'opening_call',
  WAY: 'way',
  RJ: 'rj',
  RJ_DAY: 'rj_day'
}

const WEATHER_FORECAST_DAY_ID: any = {
  TODAY: 0,
  TOMORROW: 1,
  DAY_AFTER_TOMORROW: 2
}

const isWeekend = (): boolean => {
  const day: number = new Date().getDay()
  return day === 0 || day === 6
}

const randomFromArray = (items: any[]): any => {
  return items[Math.floor(Math.random() * items.length)]
}

const randPickMessageSheet = (sheetName: string): string => {
  const values = getSpreadSheetValues(sheetName)
  return randomFromArray(values)[0]
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
    comment = `傘が必要かもしれん${BOT_PHRASE}`
  }

  const unknownText: string = '-'
  return [
    `${areaName}: ${telop}`,
    `気温(最低/最高): ${min || unknownText} / ${max || unknownText}`,
    comment
  ].join('\n')
}

const weatherForecast = (dayId: number): string => {
  const weatherTokyo = getWeatherForecast(130010)
  if (!weatherTokyo) {
    return
  }
  const targetDays: string[] = ['今日', '明日', '明後日']
  return [
    `${targetDays[dayId]}の天気${BOT_PHRASE}`,
    formatWeatherForecastMessage({ dayId, forecastData: weatherTokyo })
  ].join('\n')
}

const getUserLocalMessage = (text: string): string => {
  const url: string = `https://chatbot-api.userlocal.jp/api/chat?key=${USER_LOCAL_API_KEY}&message=${text}&bot_name=${BOT_NAME}`
  const res = UrlFetchApp.fetch(url)
  return JSON.parse(res.getContentText()).result
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
    .map((t, i) => `${i + 1}. <${t.url}|${t.name}>`)
    .join('\n')
}

const getChitoseMessage = (): string => {
  const baseUrl: string = `http://girlsbar-chitose.com/schedule/`
  const names: string[] = [
    'えみりちゃん',
    'さやちゃん',
    'しおりちゃん',
    'ななせちゃん',
    'ひなのちゃん',
    'みこちゃん'
  ]
  const minDay: number = 0
  const maxDay: number = 2
  const messages: string[] = []
  for (const i = minDay; i <= maxDay; i++) {
    let statuses: any = names.map(name => {
      return {
        name,
        time: '',
        imgFullPath: ''
      }
    })

    const currentUrl: string = `${baseUrl}?day=${i}`
    let contentText: string = UrlFetchApp.fetch(currentUrl).getContentText()
    contentText = contentText.replace(/\t/g, '')
    contentText = contentText.replace(/\s\s/g, '')
    contentText = contentText.replace(/\n/g, '')

    const scheduleDate: string = contentText
      .match(new RegExp(/<h2>(.*?出勤スケジュール)<\/h2>/m))[1]
      .trim()

    const matched: string[] = contentText.match(
      new RegExp(/<ul class="girlsul">([\s\S]*?)<\/ul>/gm)
    )
    if (!matched) {
      messages.push(
        [
          '```',
          `<${currentUrl}|${scheduleDate}>`,
          'まだスケジュールがないかも？',
          '```'
        ].join('\n')
      )
      continue
    }

    for (const str of matched) {
      const name: string = str.match(
        new RegExp(/<li class="name"><a[^>]*>([\s\S]*?)<\/a><\/li>/)
      )[1]

      statuses = statuses.map(st => {
        if (st.name === name) {
          const time: string = str.match(
            new RegExp(/<li class="time">([\s\S]*?)<\/li>/)
          )[1]
          const imgSrc: string = str.match(new RegExp(/<img src="(.*?)"/))[1]
          const imgFullPath = `http://girlsbar-chitose.com/${imgSrc}`
          st.time = time
          st.imgFullPath = imgFullPath
        }
        return st
      })
    }
    messages.push(
      [
        '```',
        `<${currentUrl}|${scheduleDate}>`,
        statuses
          .map(st => {
            return st.time
              ? `<${st.imgFullPath}|${st.name}>: ${st.time}`
              : `${st.name}: 出勤なし`
          })
          .join('\n'),
        '```'
      ].join('\n')
    )
  }

  return `${messages.join('\n')}`
}

const getPairsScreenshotUrl = (): string => {
  const url: string = GET_PAIRS_URL
  const imageBlob: any = UrlFetchApp.fetch(url).getBlob()
  const data: string = Utilities.base64Encode(imageBlob.getBytes())

  // upload image to imgurl
  const res: any = UrlFetchApp.fetch('https://api.imgur.com/3/image', {
    contentType: 'application/json',
    method: 'post',
    headers: {
      Authorization: `Client-ID ${IMGURL_CLIENT_ID}`
    },
    payload: JSON.stringify({
      image: data
    })
  })
  if (!res) {
    return
  }
  return JSON.parse(res).data.link
}

const doPost = (e): void => {
  const token: string = e.parameter.token
  const triggerWord: string = e.parameter.trigger_word
  const userName: string = e.parameter.user_name
  const channelName: string = e.parameter.channel_name
  const message: string = e.parameter.text.replace(triggerWord, '').trim()

  if (token !== SLACK_OUTGOING_WEBHOOK_TOKEN) {
    return
  }
  if (userName === 'slackbot') {
    return
  }

  if (new RegExp('天気').test(message)) {
    let dayId: number = WEATHER_FORECAST_DAY_ID.TODAY
    if (message.indexOf('明日') !== -1) {
      dayId = WEATHER_FORECAST_DAY_ID.TOMORROW
    } else if (message.indexOf('明後日') !== -1) {
      dayId = WEATHER_FORECAST_DAY_ID.DAY_AFTER_TOMORROW
    }
    postToSlack(weatherForecast(dayId), channelName)
    return
  }

  if (new RegExp('とれんど|トレンド|trend', 'i').test(message)) {
    // japan: 23424856 tokyo: 1118370
    postToSlack(
      [
        `現在のトレンドだよ`,
        `${getTwitterTrendsMessage(getTwitterTrends(23424856))}`
      ].join('\n'),
      channelName
    )
    return
  }

  if (new RegExp('^ミッション|みっしょん|mission', 'i').test(message)) {
    postToSlack(randPickMessageSheet(SHEET_NAMES.MISSION), channelName)
    return
  }

  if (new RegExp('^ウェイ|うぇい|way', 'i').test(message)) {
    postToSlack(randPickMessageSheet(SHEET_NAMES.WAY), channelName)
    return
  }

  if (new RegExp('^(今日|きょう)も(一|[０-９ 0-9]*)(日|にち)').test(message)) {
    postToSlack(randPickMessageSheet(SHEET_NAMES.KYOMO_ICHINICHI), channelName)
    return
  }

  if (new RegExp(`^ヘルプ|へるぷ|help$`, 'i').test(message)) {
    postToSlack(
      [
        `bot 天気: 天気予報するよ`,
        `bot ミッション: ミッションを教えるよ`,
        `bot ウェイ: ウェイ！`,
        `bot 今日も１日: がんばる${BOT_PHRASE}`,
        `bot 編集: メッセージ編集のURLを教えるよ`,
        `bot github: GitHubのURLを教えるよ`,
        `bot 〇〇で会話するよ`,
        `bot 株価{company code}で現在の株価を教えるよ`,
        `bot 日経平均株価で現在の日経平均株価を教えるよ`,
        `bot 為替で現在の為替レートを教えるよ`,
        `bot トレンドで現在のトレンドを教えるよ`,
        `botトリガーは 'b' でもいいよ`
      ].join('\n'),
      channelName
    )
    return
  }

  if (new RegExp(`^GitHub$`, 'i').test(message)) {
    postToSlack(`${GITHUB_URL}`, channelName)
    return
  }

  if (new RegExp('^編集|edit$', 'i').test(message)) {
    postToSlack(
      `ここから編集${BOT_PHRASE}！\n${getSpreadSheetUrl(
        SHEET_NAMES.KYOMO_ICHINICHI
      )}`,
      channelName
    )
    return
  }

  if (new RegExp('^日経平均').test(message)) {
    postToSlack(`株価取得中...`, channelName)
    const stockInfo: any = getStockInfo(COMPANY_CODE_NIKKEI_AVE)
    if (!stockInfo.name) {
      postToSlack('株価の取得に失敗しました', channelName)
    } else {
      postToSlack(getStockInfoMessage(stockInfo), channelName)
    }
    return
  }

  if (new RegExp('^株価').test(message)) {
    postToSlack(`株価取得中...`, channelName)
    let companyCode: number = COMPANY_CODE_RJ
    const matched = message.match(new RegExp(`(株価)([0-9]+)(.*)`))
    if (matched) {
      companyCode = Number(matched[2])
    }

    const stockInfo: any = getStockInfo(companyCode)
    if (!stockInfo.name) {
      postToSlack('株価の取得に失敗しました', channelName)
    } else {
      postToSlack(getStockInfoMessage(stockInfo), channelName)
    }
    return
  }

  if (new RegExp('^為替').test(message)) {
    postToSlack('現在の為替レート取得中...', channelName)
    const rate: any = getMoneyRateByPairCode('USDJPY')
    if (!rate || !rate.ask) {
      postToSlack('為替レートの取得に失敗しました', channelName)
      return
    }
    postToSlack(getMoneyRateMessage(rate), channelName)
    return
  }

  if (new RegExp('^ちとせ|(例|れい)の(アレ|あれ)').test(message)) {
    postToSlack(`データ取得中...`, channelName)
    postToSlack(getChitoseMessage(), channelName)
    return
  }

  if (
    new RegExp('^(ぺあーず|ペアーズ|pairs|例)の(すくしょ|スクショ)', 'i').test(
      message
    )
  ) {
    postToSlack(`データ取得中...ちょっと時間かかるかも`, channelName)
    postToSlack('スクショとったよ', channelName, {
      imageUrl: getPairsScreenshotUrl()
    })
    return
  }

  if (new RegExp(RJ.join('|')).test(message)) {
    postToSlack(randPickMessageSheet(SHEET_NAMES.RJ), channelName)
    return
  }

  postToSlack(getUserLocalMessage(message), channelName)
  return
}

const postToSlack = (
  text: string,
  channelName: string = SLACK_CHANNEL,
  { imageUrl } = {}
): void => {
  const payload = {
    text,
    channel: channelName,
    icon_emoji: SLACK_BOT_ICON_EMOJI,
    username: SLACK_BOT_USERNAME
  }
  if (imageUrl) {
    payload.attachments = [
      {
        image_url: imageUrl
      }
    ]
  }

  UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
    contentType: 'application/json',
    method: 'post',
    payload: JSON.stringify(payload)
  })
}

function openingCall(): void {
  postToSlack(randPickMessageSheet(SHEET_NAMES.OPENING_CALL))
  if (new Date().getDate() === RJ_DAY) {
    postToSlack(randPickMessageSheet(SHEET_NAMES.RJ_DAY))
  } else {
    postToSlack(`今年も残り \`${daysLeft()}日\` ${BOT_PHRASE}！`)
  }
}

function trendReport(): void {
  postToSlack(
    [
      `現在のトレンドだよ。もうチェックした？`,
      `${getTwitterTrendsMessage(getTwitterTrends(23424856))}`
    ].join('\n')
  )
}

function eveningCall(): void {
  postToSlack(randPickMessageSheet(SHEET_NAMES.EVENING_CALL))
  postToSlack(weatherForecast(WEATHER_FORECAST_DAY_ID.TOMORROW))
}

function stockReport(): void {
  if (isWeekend()) {
    return
  }
  postToSlack(`今日の株価と為替レート${BOT_PHRASE}`)
  postToSlack(
    [
      getStockInfoMessage(getStockInfo(COMPANY_CODE_NIKKEI_AVE)),
      getStockInfoMessage(getStockInfo(COMPANY_CODE_RJ))
    ].join('\n')
  )
  postToSlack(
    [`為替レート`, getMoneyRateMessage(getMoneyRateByPairCode('USDJPY'))].join(
      '\n'
    )
  )
}

function howIsProgress(): void {
  postToSlack(
    randPickMessageSheet(SHEET_NAMES.HOW_IS_PROGRESS),
    PROGRESS_TARGET_CHANNEL
  )
}

function chitose(): void {
  postToSlack(
    `例の出勤スケジュール${BOT_PHRASE}\n${getChitoseMessage()}`,
    PROGRESS_TARGET_CHANNEL
  )
}

function pairs(): void {
  postToSlack('例のスクショぞい', PROGRESS_TARGET_CHANNEL, {
    imageUrl: getPairsScreenshotUrl()
  })
}

function test(): void {
  Logger.log('execute test')
}
