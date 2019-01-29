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
        `bot サポート〇〇でサポートが答えるよ`,
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

  if (new RegExp('^(サポート|さぽーと)', 'i').test(message)) {
    const matched: string[] = message.match(
      new RegExp(`(サポート|さぽーと)(.*)`)
    )
    if (!matched || !matched[2]) {
      return
    }
    const responseMessage: string = matched[2].trim()
    postToSlack(getRJKarakuriMessage(responseMessage), channelName)
    return
  }

  if (new RegExp(RJ.join('|')).test(message)) {
    postToSlack(randPickMessageSheet(SHEET_NAMES.RJ), channelName)
    return
  }

  postToSlack(getUserLocalMessage(message), channelName)
  return
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
