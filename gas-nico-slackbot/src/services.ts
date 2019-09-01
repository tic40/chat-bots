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

const getUserLocalMessage = (text: string): string => {
  const url: string = `https://chatbot-api.userlocal.jp/api/chat?key=${USER_LOCAL_API_KEY}&message=${text}&bot_name=${SLACK_BOT_USERNAME}`
  const res = UrlFetchApp.fetch(url)
  return JSON.parse(res.getContentText()).result
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
  return `今日は${today}、今年も残り \`${daysLeft()}日\` ${BOT_PHRASE}`
}

const getWikipediaUrlAndBody = (q: string): { url: string; body: string } => {
  const simpleWikipediaApi: string = 'http://wikipedia.simpleapi.net/api'
  const url: string = `${simpleWikipediaApi}?keyword=${encodeURIComponent( q)}&output=json`
  const res: any = JSON.parse(UrlFetchApp.fetch(url))
  if (!res) { return }
  return {
    url: res[0].url,
    body: res[0].body
  }
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
