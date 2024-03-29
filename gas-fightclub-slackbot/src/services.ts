const postToSlack = (
  text: string,
  channelName: string = SLACK_CHANNEL,
  imageUrl = null
): void => {
  const payload = {
    text,
    channel: channelName,
    icon_emoji: SLACK_BOT_ICON_EMOJI,
    username: SLACK_BOT_USERNAME,
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

const postToSlackDmChannel = (message: string) => {
  UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {
    method: 'post',
    headers: { contentType: 'application/json' },
    payload: {
      token: DM_FROM_CHATBOT_APP_TOKEN,
      channel: DM_FROM_CHATBOT_APP_DM_CHANNEL_ID,
      text: message,
    },
  })
}

const getRate = () => {
  const url = 'https://finance.yahoo.co.jp/quote/USDJPY=FX'
  const contentText: string = UrlFetchApp.fetch(url).getContentText()

  const matched = contentText.match(
    new RegExp(
      /{\\"countryCode\\":\\"USDJPY\\",\\"name\\":\\"米ドル\/円\\",\\"bid\\":{\\"value\\":\\"[\d|\.]+\\"},\\"ask\\":{\\"value\\":\\"([\d|\.]+)\\"}/
    )
  )
  return !matched ? '' : matched[1]
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

const getWikipediaUrlAndBody = (q: string): { url: string; body: string } => {
  const simpleWikipediaApi: string = 'http://wikipedia.simpleapi.net/api'
  const url: string = `${simpleWikipediaApi}?keyword=${encodeURIComponent(
    q
  )}&output=json`
  const res: any = JSON.parse(UrlFetchApp.fetch(url))
  if (!res) {
    return
  }
  return {
    url: res[0].url,
    body: res[0].body,
  }
}
