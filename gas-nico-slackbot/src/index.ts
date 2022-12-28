const doPost = (e): void => {
  const title = e.parameter.title
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

  if (new RegExp('(.*)(post:)(.+)').test(message)) {
    const matched: string[] = message.match(new RegExp('(.*)(post:)(.+)'))
    const text: string = matched[matched.length - 1]
    postToSlack(text)
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

  if (new RegExp('アルバム', 'i').test(message)) {
    postToSlack(
      `<https://photos.app.goo.gl/P9KGVwa8StvLB7wb6|アルバムはここ>${BOT_PHRASE}！画像をアップしてほしい${BOT_PHRASE}`,
      channelName
    )
    return
  }

  if (new RegExp('(って|とは)(なに|何)').test(message)) {
    const replacedMessage: string = message.replace(/,|、/g, '')
    const q: string = replacedMessage.match(
      new RegExp('(.*?)(って|とは)(なに|何)')
    )[1]
    const urlAndBody: any = getWikipediaUrlAndBody(q.trim())
    if (!urlAndBody) {
      postToSlack(`...それは知らない${BOT_PHRASE}`, channelName)
      return
    }
    postToSlack(`${urlAndBody.body.substr(0, 140)}...`, channelName)
    postToSlack(`詳しくはここ見てな\n${urlAndBody.url}`, channelName)
    return
  }

  if (new RegExp(`(.*)(翻訳して|翻訳)(.+)`).test(message)) {
    const matched: string[] = message.match(
      new RegExp(`(.*)(翻訳して|翻訳)(.+)`)
    )
    const text: string = matched[matched.length - 1]
    const translatedText: string = googleTranslate(text.trim()) || ''
    postToSlack(`${translatedText} ${BOT_PHRASE}`, channelName)
    return
  }

  postToSlack(getUserLocalMessage(message), channelName)
  return

}

function openingCall(): void {
  postToSlack(['おはわん！', whatTheDay()].join('\n'))
}

function dailyTodo(): void {
  const message: string = `今日やるべきことをやろう${BOT_PHRASE}！`
  const trello: string = 'https://trello.com/b/Dk9SG77Y/kazukoやることリスト'
  postToSlack([message, trello].join('\n'))
}

function eveningCall(): void {
  postToSlack('おつわん！')
}

function trendReport(): void {
  postToSlack(
    [
      `現在のトレンドだよ。もうチェックした${BOT_PHRASE}？`,
      `${getTwitterTrendsMessage(getTwitterTrends(23424856))}`
    ].join('\n')
  )
}

function oneGoodPerDay(): void {
  postToSlack(`今日捨てるものを投稿するわん！`, '一日一善')
}

function test(): void {
  Logger.log('execute test')
}
