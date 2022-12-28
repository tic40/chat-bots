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

  if (new RegExp('とれんど|トレンド|trend', 'i').test(message)) {
    // japan: 23424856 tokyo: 1118370
    postToSlack(
      [
        `現在のトレンドだよ`,
        `${getTwitterTrendsMessage(getTwitterTrends(23424856))}`,
      ].join('\n'),
      channelName
    )
    return
  }

  if (new RegExp(`^ヘルプ|へるぷ|help$`, 'i').test(message)) {
    postToSlack(
      [
        `bot 天気: 天気予報するよ`,
        `bot 編集: メッセージ編集のURLを教えるよ`,
        `bot github: GitHubのURLを教えるよ`,
        `bot 〇〇で会話するよ`,
        `bot 株価{company code}で現在の株価を教えるよ`,
        `bot 日経平均株価で現在の日経平均株価を教えるよ`,
        `bot 為替で現在の為替レートを教えるよ`,
        `bot トレンドで現在のトレンドを教えるよ`,
        `botトリガーは 'b' でもいいよ`,
      ].join('\n'),
      channelName
    )
    return
  }

  if (new RegExp(`^GitHub$`, 'i').test(message)) {
    postToSlack(`${GITHUB_URL}`, channelName)
    return
  }

  if (new RegExp('^日経平均').test(message)) {
    postToSlack(`株価取得中...`, channelName)
    const stockInfo: any = getStockInfoNew('0000')
    if (!stockInfo.name) {
      postToSlack('株価の取得に失敗しました', channelName)
    } else {
      postToSlack(getStockInfoMessage(stockInfo), channelName)
    }
    return
  }

  if (new RegExp('^(NY)?ダウ').test(message)) {
    postToSlack(`株価取得中...`, channelName)
    const stockInfo: any = getStockInfoDow()
    if (!stockInfo.name) {
      postToSlack('株価の取得に失敗しました', channelName)
    } else {
      postToSlack(getStockInfoMessage(stockInfo), channelName)
    }
    return
  }

  if (new RegExp('^ビットコ(イン)?').test(message)) {
    postToSlack(`レート取得中...`, channelName)
    const bitCoinRate = getBitCoinRate()
    if (!bitCoinRate) {
      postToSlack('レートの取得に失敗しました', channelName)
    } else {
      postToSlack(getBitCoinRateMessage(bitCoinRate), channelName)
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

    const stockInfo: any = getStockInfoNew(companyCode)
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

  postToSlack(getUserLocalMessage(message), channelName)
  return
}

function openingCall(): void {
  const d = new Date()
  if (d.getDay() === 1) {
    postToSlack('月曜日がはじまんでい')
  } else {
    postToSlack('そろそろ開店ガラガラ〜')
  }
  postToSlack(`今年も残り \`${daysLeft()}日\` ${BOT_PHRASE}！`)
}

function trendReport(): void {
  postToSlack(
    [
      `現在のトレンドだよ。もうチェックした？`,
      `${getTwitterTrendsMessage(getTwitterTrends(23424856))}`,
    ].join('\n')
  )
}

function eveningCall(): void {
  postToSlack('そろそろ閉店ガラガラ〜')
}

function stockReport(): void {
  if (isWeekend()) {
    return
  }
  postToSlack(`今日のレートチェック${BOT_PHRASE}`)
  postToSlack(
    [
      getStockInfoMessage(getStockInfoNew('0000')),
      getStockInfoMessage(getStockInfoNew(COMPANY_CODE_RJ)),
      getStockInfoMessage(getStockInfoNew(COMPANY_CODE_NOTE)),
      getBitCoinRateMessage(getBitCoinRate()),
    ].join('\n')
  )
}

function test(): void {
  Logger.log('execute test')
}
