const postToSlack = (
  text: string,
  channelName: string = SLACK_CHANNEL,
  { imageUrl } = {}
): void => {
  const payload = {
    text,
    channel: channelName,
    icon_emoji: SLACK_BOT_ICON_EMOJI,
    username: SLACK_BOT_USERNAME,
    attachments: null,
  }
  if (imageUrl) {
    payload.attachments = [
      {
        image_url: imageUrl,
      },
    ]
  }

  UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
    contentType: 'application/json',
    method: 'post',
    payload: JSON.stringify(payload),
  })
}

/*
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
  return getSpreadSheet(sheetName).getDataRange().getValues()
}
*/

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
  return `Pair: ${rate.currencyPairCode} High: ${rate.high} Low: ${rate.low} ask: ${rate.ask} bid: ${rate.bid}`
}

const getStockInfoDow = (): any => {
  const url: string = 'https://m.finance.yahoo.co.jp/stock?code=%5Edji'
  const contentText: string = UrlFetchApp.fetch(url).getContentText()
  const matchedPrice: string[] = contentText.match(
    new RegExp(`(<span class="_3BGK5SVf">)(.+?)(</span>)`)
  )
  if (!matchedPrice) return {}
  const price = matchedPrice[2]

  const matchedComparison: string[] = contentText.match(
    new RegExp(
      `(<span class="_3HWBPedk"><span></span><span class="_3BGK5SVf">)(.+?)(</span>)`
    )
  )
  if (!matchedComparison) {
    return {}
  }
  const comparison: string = matchedComparison[2]
  return { name: 'NYダウ', price, comparison }
}

const getBitCoinRate = (): { ask: number; bid: number; mid: number } => {
  const url = 'https://bitflyer.com/api/echo/price'
  return JSON.parse(UrlFetchApp.fetch(url).getContentText())
}

const getStockInfoNew = (companyCode: string) => {
  const url = `https://kabutan.jp/stock/chart?code=${companyCode}`
  const contentText: string = UrlFetchApp.fetch(url).getContentText()

  const matchedName: string[] = contentText.match(
    new RegExp(`<title>(.+)[(【].+</title>`)
  )
  const matchedPrice: string[] = contentText.match(
    new RegExp(`<span class="kabuka">(.+)</span>`)
  )
  const matchedDiffPrice: string[] = contentText.match(
    new RegExp(`<dd><span class="(up|down)">(.+)</span></dd>`)
  )
  const matchedDiffPer: string[] = contentText.match(
    new RegExp(`<dd><span class="(up|down)">(.+)</span>%</dd>`)
  )

  if (!matchedName || !matchedPrice || !matchedDiffPrice || !matchedDiffPer) {
    return {}
  }
  const name: string = matchedName[1]
  const price: string = matchedPrice[1]
  const comparison: string = `${matchedDiffPrice[2]}(${matchedDiffPer[2]}%)`
  return { name, price, comparison }
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
  return `${stockInfo.name} の現在の株価は ${stockInfo.price} 前日比${stockInfo.comparison} です`
}

const getBitCoinRateMessage = (rate: {
  ask: number
  mid: number
  bid: number
}): string => {
  return `ビットコインの現在の買値は ${Math.floor(
    rate.ask
  ).toLocaleString()} 円です`
}

const getTwitterTrends = (locationId: number): any[] => {
  const url: string = `https://api.twitter.com/1.1/trends/place.json?id=${locationId}`
  const res = UrlFetchApp.fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
    },
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
    'みこちゃん',
  ]
  const minDay: number = 0
  const maxDay: number = 4
  const messages: string[] = []
  for (const i = minDay; i <= maxDay; i++) {
    let statuses: any = names.map((name) => {
      return {
        name,
        time: '',
        imgFullPath: '',
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
          '```',
        ].join('\n')
      )
      continue
    }

    for (const str of matched) {
      const name: string = str.match(
        new RegExp(/<li class="name"><a[^>]*>([\s\S]*?)<\/a><\/li>/)
      )[1]

      statuses = statuses.map((st) => {
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
          .map((st) => {
            return st.time
              ? `<${st.imgFullPath}|${st.name}>: ${st.time}`
              : `${st.name}: 出勤なし`
          })
          .join('\n'),
        '```',
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
      Authorization: `Client-ID ${IMGURL_CLIENT_ID}`,
    },
    payload: JSON.stringify({
      image: data,
    }),
  })
  if (!res) {
    return
  }
  return JSON.parse(res).data.link
}