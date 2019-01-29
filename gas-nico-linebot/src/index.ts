const handleWebhookFromLine = (json: any): void => {
  if (json.events[0].type !== 'message') {
    return
  }
  if (json.events[0].source.groupId !== LINE_GROUP_ID) {
    return
  }
  if (!json.events[0].message.text) {
    return
  }

  const BOT_NAME_REGEXP_STRING: string = `(${BOT_NAME}ちゃん|${BOT_NAME}ー|${BOT_NAME}〜|${BOT_NAME})`
  const message: string = json.events[0].message.text.trim()

  if (new RegExp(`^${BOT_NAME_REGEXP_STRING}$`).test(message)) {
    const response: any[] = getSpreadSheetValues(SHEET_NAMES.RESPONSE)
    postToLine(randomFromArray(response)[0])
    return
  }

  if (
    new RegExp(`^${BOT_NAME_REGEXP_STRING}(.*?)(って|とは)(なに|何)`).test(
      message
    )
  ) {
    const replacedMessage: string = message.replace(/,|、/g, '')
    const q: string = replacedMessage.match(
      new RegExp(`^${BOT_NAME_REGEXP_STRING}(.*?)(って|とは)(なに|何)`)
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
    postToLine(weatherForecast(dayId))
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
    postToLine(
      [
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
      ].join('\n')
    )
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

  const doneDietTask: any[] = getSpreadSheetValues(SHEET_NAMES.DONE_DIET_TASK)
  postToLine(randomFromArray(doneDietTask)[0])
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
  const messages: any[] = getSpreadSheetValues(SHEET_NAMES.MORNING_CALL)
  postToLine([randomFromArray(messages)[0], whatTheDay()].join('\n'))
}

function encourageDietTask(): void {
  const now: Date = new Date()
  const today: string = `${now.getFullYear()}/${now.getMonth() +
    1}/${now.getDate()}`
  const lastData: any = getLastWithingsMeasure()
  if (lastData.date === today) {
    return
  }
  const messages: any[] = getSpreadSheetValues(SHEET_NAMES.ENCOURAGE_DIET_TASK)
  postToLine(
    [
      randomFromArray(messages)[0],
      `最後に計測したのは ${lastData.date} だ${BOT_PHRASE}`
    ].join('\n')
  )
}

function eveningCall(): void {
  const messages: any[] = getSpreadSheetValues(SHEET_NAMES.EVENING_CALL)
  postToLine(randomFromArray(messages)[0])
  postToLine(weatherForecast(WEATHER_FORECAST_DAY_ID.TOMORROW))
}

function trendReport(): void {
  postToLine(
    [
      `現在のトレンドだよ。もうチェックした${BOT_PHRASE}？`,
      `${getTwitterTrendsMessage(getTwitterTrends(23424856))}`
    ].join('\n')
  )
}

function tweet(): void {
  const randInt = Math.floor(Math.random() * Math.floor(4))
  if (randInt === 1) {
    const messages: any[] = getSpreadSheetValues(SHEET_NAMES.TWEET)
    postToLine(randomFromArray(messages)[0])
  }
}

function test(): void {
  Logger.log('execute test')
}
