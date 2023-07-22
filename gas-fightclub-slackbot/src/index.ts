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
  if (
    new RegExp(
      '赤チャンネル|あかちゃんねる|赤ちゃんねる|わくわくあかちゃんねる|わくわく赤ちゃんねる',
      'i'
    ).test(message)
  ) {
    wakubaby(channelName)
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

function scrapeAndSlackNotify(channelName = '通知') {
  postToSlack(
    '<https://as.its-kenpo.or.jp/apply/empty_calendar?s=NFV6TjlRV2Fta0hid0JYWTlJWFpzeDJieVJuYnZOMlh2ZG1KM1ZtYmZsSGR3MVdaOTQyYnBSM1loOTFiblpTWjFKSGQ5a0hkdzFXWg%3D%3D|IT健保宿空き状況> チェック開始',
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
    messages.push(`${k}: ${arr.join(', ')}`)
  }
  if (messages.length === 0) {
    postToSlack('```現在空きはないよ```', channelName)
  } else {
    postToSlack(['```', ...messages, '```'].join('\n'), channelName)
  }
}

function wakubaby(channelName = '通知') {
  postToSlack(
    '<http://www.tani.com/wakuwaku.html|只今のわくわく赤チャンネル>',
    channelName,
    `http://61.196.233.105:5001/-wvhttp-01-/image.cgi?v=jpg:320x240&&r=${Math.random()}`
  )
}

function recordRate() {
  // 週末は停止
  if (isWeekend()) return
  const d = new Date()
  const hour = d.getHours()
  // 月曜朝除く
  if (d.getDay() === 1 && 0 <= hour && hour <= 7) return

  const now = getRate()
  const sheet = getSpreadSheet('USD/JPY')
  // 末尾に append
  sheet.appendRow([new Date(), now])
  // 行数
  const length = sheet.getDataRange().getValues().length
  // 30 行越えたら古いものから削除
  if (length > 30) sheet.deleteRows(1, length - 30)
}

function notifyRate() {
  // 週末は停止
  if (isWeekend()) return
  const hour = new Date().getHours()
  // 深夜-早朝除く
  if (1 <= hour && hour <= 7) return

  const now = getRate()
  if (now === '') {
    postToSlackDmChannel('レート取得に失敗しました')
    return
  }

  const sheet = getSpreadSheet('USD/JPY')
  const values = sheet
    .getDataRange()
    .getValues()
    .map((v) => Number(v[1]))
  let message = `${now}`
  if (values.length >= 30) {
    const mn = Math.min(...values)
    const mx = Math.max(...values)
    const diff = mx - mn
    message += `: 直近30minのdiffが ${diff} です.`
    if (diff < 0.06) message += `レンジの可能性あり`
  }

  postToSlackDmChannel(message)
}

function triggerScrapeAndSlackNotify() {
  scrapeAndSlackNotify('通知')
}
function triggerWakubaby() {
  wakubaby('通知')
}

function test(): void {
  Logger.log('execute test')
}
