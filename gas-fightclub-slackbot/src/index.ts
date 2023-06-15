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

  if (new RegExp('(.*)(post:)(.+)').test(message)) {
    const matched: string[] = message.match(new RegExp('(.*)(post:)(.+)'))
    const text: string = matched[matched.length - 1]
    postToSlack(text)
    return
  }
  if (new RegExp('宿|IT健保宿|健保宿', 'i').test(message)) {
    scrapeAndSlackNotify(channelName)
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

  postToSlack(getUserLocalMessage(message), channelName)
  return
}

function trendReport() {
  postToSlack(
    [
      `現在のトレンドだよ。もうチェックした？`,
      `${getTwitterTrendsMessage(getTwitterTrends(23424856))}`,
    ].join('\n')
  )
}

function triggerScrapeAndSlackNotify() {
  scrapeAndSlackNotify('通知')
}

function scrapeAndSlackNotify(channelName = '通知') {
  postToSlack(
    '[<https://as.its-kenpo.or.jp/apply/empty_calendar?s=NFV6TjlRV2Fta0hid0JYWTlJWFpzeDJieVJuYnZOMlh2ZG1KM1ZtYmZsSGR3MVdaOTQyYnBSM1loOTFiblpTWjFKSGQ5a0hkdzFXWg%3D%3D|IT健保宿空き状況> チェック開始]',
    channelName
  )
  const mp = {
    トスラブ箱根ビオーレ:
      'https://as.its-kenpo.or.jp/apply/empty_calendar?s=NFV6TjlRV2Fta0hid0JYWTlJWFpzeDJieVJuYnZOMlh2ZG1KM1ZtYmZsSGR3MVdaOTQyYnBSM1loOTFiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    トスラブ箱根和奏林:
      'https://as.its-kenpo.or.jp/apply/empty_calendar?s=NVV6TjlRV2Fta0hid0JYWTlJWFpzeDJieVJuYnZOMlh2ZG1KM1ZtYmZsSGR3MVdaOTQyYnBSM1loOTFiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    トスラブ館山ルアーナ:
      'https://as.its-kenpo.or.jp/apply/empty_calendar?s=PT1RTTJjVFBrbG1KbFZuYzAxVFp5Vkhkd0YyWWZWR2JuOTJiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    ホテルハーヴェスト伊東:
      'https://as.its-kenpo.or.jp/apply/empty_calendar?s=Mll6TjlRV2Fta0hid0JYWTlJWFpzeDJieVJuYnZOMlh2ZG1KM1ZtYmZsSGR3MVdaOTQyYnBSM1loOTFiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    ホテルハーヴェスト那須:
      'https://as.its-kenpo.or.jp/apply/empty_calendar?s=ell6TjlRV2Fta0hid0JYWTlJWFpzeDJieVJuYnZOMlh2ZG1KM1ZtYmZsSGR3MVdaOTQyYnBSM1loOTFiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    鎌倉パークホテル:
      'https://as.its-kenpo.or.jp/apply/empty_calendar?s=d0FUTzlRV2Fta0hid0JYWTlJWFpzeDJieVJuYnZOMlh2ZG1KM1ZtYmZsSGR3MVdaOTQyYnBSM1loOTFiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
  }

  const regex = /<p>(\d+)<\/p><spanclass="icon">(○|△)<\/span>/g
  const message = []
  const res = {}
  Object.keys(mp).map((k) => {
    res[k] = []
  })

  for (const k in mp) {
    const date = new Date()
    for (let i = 0; i < 3; i++) {
      const joinDate = getFirstDayOfMonth(date)
      const url = mp[k] + `&join_date=${joinDate}`
      const content = UrlFetchApp.fetch(url)
        .getContentText()
        .replace(/\s+/g, '')
      let match
      while ((match = regex.exec(content))) {
        if (match) {
          date.setDate(match[1])
          const day = getDayOfWeek(date.getDay())
          res[k].push(`${date.getMonth() + 1}/${match[1]}(${day})`)
        }
      }
      date.setMonth(date.getMonth() + 1)
    }
  }

  const messages = []
  for (const k in res) {
    const arr = Array.from(new Set(res[k]))
    if (arr.length === 0) continue
    message.push(`${k}: ${arr.join(', ')}`)
  }
  if (message.length === 0) {
    postToSlack('```現在空きはないよ```', channelName)
  } else {
    postToSlack(['```', ...message, '```'].join('\n'), channelName)
  }
}

function test(): void {
  Logger.log('execute test')
}
