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

function scrapeAndSlackNotify(channelName = '通知', replyOnlyAvailable = false) {
  if (!replyOnlyAvailable) {
    postToSlack(
      '<https://as.its-kenpo.or.jp/apply/empty_calendar?s=NFV6TjlRV2Fta0hid0JYWTlJWFpzeDJieVJuYnZOMlh2ZG1KM1ZtYmZsSGR3MVdaOTQyYnBSM1loOTFiblpTWjFKSGQ5a0hkdzFXWg%3D%3D|IT健保宿空き状況> チェック開始...',
      channelName
    )
  }

  const mp = {
    // ホテルハーヴェスト伊東: 'https://as.its-kenpo.or.jp/apply/empty_calendar?s=Mll6TjlRV2Fta0hid0JYWTlJWFpzeDJieVJuYnZOMlh2ZG1KM1ZtYmZsSGR3MVdaOTQyYnBSM1loOTFiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    // ホテルハーヴェスト那須: 'https://as.its-kenpo.or.jp/apply/empty_calendar?s=ell6TjlRV2Fta0hid0JYWTlJWFpzeDJieVJuYnZOMlh2ZG1KM1ZtYmZsSGR3MVdaOTQyYnBSM1loOTFiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    // トスラブ箱根ビオーレ: 'https://as.its-kenpo.or.jp/apply/empty_calendar?s=NFV6TjlRV2Fta0hid0JYWTlJWFpzeDJieVJuYnZOMlh2ZG1KM1ZtYmZsSGR3MVdaOTQyYnBSM1loOTFiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    // トスラブ箱根和奏林: 'https://as.its-kenpo.or.jp/apply/empty_calendar?s=NVV6TjlRV2Fta0hid0JYWTlJWFpzeDJieVJuYnZOMlh2ZG1KM1ZtYmZsSGR3MVdaOTQyYnBSM1loOTFiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    // トスラブ館山ルアーナ: 'https://as.its-kenpo.or.jp/apply/empty_calendar?s=PT1RTTJjVFBrbG1KbFZuYzAxVFp5Vkhkd0YyWWZWR2JuOTJiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    // ラビスタ観音崎テラス: 'https://as.its-kenpo.or.jp/apply/empty_calendar?s=PUlETnpJVFBrbG1KbFZuYzAxVFp5Vkhkd0YyWWZWR2JuOTJiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    // ホテル日航アリビラ: 'https://as.its-kenpo.or.jp/apply/empty_calendar?s=PT13TnhRak05UVdhbWtIYndCWFk5SVhac3gyYnlSbmJ2TjJYdmRtSjNWbWJmbEhkdzFXWjk0MmJwUjNZaDkxYm5aU1oxSkhkOWtIZHcxV1o%3D',
    // リソルの森: 'https://as.its-kenpo.or.jp/apply/empty_calendar?s=M2dUTngwRFpwWlNaMUpIZDlrSGR3MVda',
    鎌倉パークホテル: 'https://as.its-kenpo.or.jp/apply/empty_calendar?s=d0FUTzlRV2Fta0hid0JYWTlJWFpzeDJieVJuYnZOMlh2ZG1KM1ZtYmZsSGR3MVdaOTQyYnBSM1loOTFiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    ホテルハーヴェスト旧軽井沢: 'https://as.its-kenpo.or.jp/apply/empty_calendar?s=PT1RT3hnVFBrbG1KbFZuYzAxVFp5Vkhkd0YyWWZWR2JuOTJiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    ラビスタ富士河口湖: 'https://as.its-kenpo.or.jp/apply/empty_calendar?s=MmdUTngwRFpwWlNaMUpIZDlrSGR3MVda',
    蓼科東急ホテル: 'https://as.its-kenpo.or.jp/apply/empty_calendar?s=MUVqTXgwRFpwWlNaMUpIZDlrSGR3MVdaｖ',
    ホテルオークラ東京ベイ: 'https://as.its-kenpo.or.jp/apply/empty_calendar?s=PUFETnpJVFBrbG1KbFZuYzAxVFp5Vkhkd0YyWWZWR2JuOTJiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    熱海後楽園ホテル: 'https://as.its-kenpo.or.jp/apply/empty_calendar?s=PUVETnpJVFBrbG1KbFZuYzAxVFp5Vkhkd0YyWWZWR2JuOTJiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    アオアヲナルトリゾート: 'https://as.its-kenpo.or.jp/apply/empty_calendar?s=PT1nTnhRak05UVdhbWtIYndCWFk5SVhac3gyYnlSbmJ2TjJYdmRtSjNWbWJmbEhkdzFXWjk0MmJwUjNZaDkxYm5aU1oxSkhkOWtIZHcxV1o%3D',
    軽井沢マリオットホテル: 'https://as.its-kenpo.or.jp/apply/empty_calendar?s=PT13TXhRak05UVdhbWtIYndCWFk5SVhac3gyYnlSbmJ2TjJYdmRtSjNWbWJmbEhkdzFXWjk0MmJwUjNZaDkxYm5aU1oxSkhkOWtIZHcxV1o%3D',
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
    if (!replyOnlyAvailable) {
      postToSlack('```現在空きはないよ```', channelName)
    }
  } else {
    postToSlack(['<@URU9GHSAE>', '```', ...messages, '```'].join('\n'), channelName)
  }
}

function sushiScrapeAndSlackNotify(channelName = '通知') {
  const mp = {
    鮨一新ディナーテーブル席: 'https://as.its-kenpo.or.jp/apply/calendar?s=PWN6TXdJVFBrbG1KbFZuYzAxVFp5Vkhkd0YyWWZWR2JuOTJiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    鮨一新ディナーカウンター席: 'https://as.its-kenpo.or.jp/apply/calendar?s=PWt6TXdJVFBrbG1KbFZuYzAxVFp5Vkhkd0YyWWZWR2JuOTJiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    鮨一新ランチテーブル席: 'https://as.its-kenpo.or.jp/apply/calendar?s=PUlETndJVFBrbG1KbFZuYzAxVFp5Vkhkd0YyWWZWR2JuOTJiblpTWjFKSGQ5a0hkdzFXWg%3D%3D',
    鮨一新ランチカウンター席: 'https://as.its-kenpo.or.jp/apply/calendar?s=PUVETndJVFBrbG1KbFZuYzAxVFp5Vkhkd0YyWWZWR2JuOTJiblpTWjFKSGQ5a0hkdzFXWg%3D%3D'
  }

  const regex = /data-join-time="([0-9]{4}-[0-9]{2}-[0-9]{2})" data-use-time="([0-9]{2}:[0-9]{2})">(○|△)<\/td>/g
  const res = {}
  Object.keys(mp).map((k) => {
    res[k] = []
  })

  for (const k in mp) {
    const date = new Date()
    for (let i = 0; i < 15; i++) {
      date.setDate(date.getDate() + 7);
      // yyyy-mm-dd
      const joinDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const url = mp[k] + `&join_date=${joinDate}`
      const content = UrlFetchApp.fetch(url).getContentText()
      let match
      while ((match = regex.exec(content))) {
        if (match) {
          const day = getDayOfWeek((new Date(match[1])).getDay())
          res[k].push(`${match[1].slice(5).replace('-','/')}(${day})${match[2]}`)
        }
      }
    }
  }

  const messages = []
  for (const k in res) {
    const arr = Array.from(new Set(res[k]))
    if (arr.length === 0) continue
    messages.push(`${k}: ${arr.join(', ')}`)
  }
  if (messages.length) {
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
  // 60 超えたら古いものから削除
  if (length > 60) sheet.deleteRows(1, length - 60)
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
  const messages = [`[now] ${now}`]
  const f = (arr) => {
    const mn = Math.min(...arr)
    const mx = Math.max(...arr)
    return (mx - mn) * 100
  }
  if (values.length >= 30) {
    const diff30 = f(values.slice(0, 30))
    const diff60 = f(values)
    messages.push(`[diff/30-60] ${diff30.toFixed(1)} ${diff60.toFixed(1)}`)
    messages.push(
      `[min-max/60] ${Math.min(...values)} - ${Math.max(...values)}`
    )
    if (diff30 <= 6.0 || diff60 <= 10.0) messages.push(` / レンジの可能性あり`)
  }
  postToSlackDmChannel(messages.join('\n'))
}

function triggerKenpoChecker() {
  const now = new Date()
  if (now.getMinutes() % 10 === 0) {
    scrapeAndSlackNotify('通知', true)
  }
}
function triggerSushiChecker() {
  const now = new Date()
  if (now.getMinutes() % 15 === 0) {
    sushiScrapeAndSlackNotify('通知')
  }
}
function triggerWakubabyChecker() {
  const now = new Date()
  if ([7,12,18].includes(now.getHours()) && now.getMinutes() === 0) {
    wakubaby('通知')
  }
}

function test(): void {
  Logger.log('execute test')
}
