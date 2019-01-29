const isWeekend = (): boolean => {
  const day: number = new Date().getDay()
  return day === 0 || day === 6
}

const getGmailMessages = ({
  condition,
  max = 50,
  start = 0
}: {
  condition: string
  start: number
  max: number
}): string[] => {
  const threads: any[] = GmailApp.search(condition, start, max)
  return threads.map(thread => {
    const messages: any[] = thread.getMessages()
    for (const m of messages) {
      m.markRead()
    }
    const lastMessage: any = messages[messages.length - 1]
    return formatGmailMessage({ message: lastMessage })
  })
}

const formatGmailMessage = ({
  message,
  maxString = 500
}: {
  message: any
  maxString?: number
}): string => {
  return [
    `subject: ${message.getSubject()}`,
    `from: ${message.getFrom()}`,
    // `DATE: ${message.getDate()}*`,
    message.getPlainBody().slice(0, maxString)
  ].join('\n')
}

const getAllEventsTodayGoogleCalendar = (date = new Date()): string => {
  return CalendarApp.getAllCalendars()
    .map(calendar => {
      const events: any[] = calendar.getEventsForDay(date)
      if (events.length === 0) {
        return null
      }

      return [
        `*${calendar.getName()}*`,
        events.map(event => formatGoogleCalendarEventMessage(event)).join('\n')
      ].join('\n')
    })
    .filter(v => v)
    .join('\n')
}

const formatGoogleCalendarEventMessage = (event: any): string => {
  const startDate: Date = new Date(event.getStartTime())
  const endDate: Date = new Date(event.getEndTime())
  const startTime: string = `${startDate.getHours()}:${(
    '0' + startDate.getMinutes()
  ).slice(-2)}`
  const endTime: string = `${endDate.getHours()}:${(
    '0' + endDate.getMinutes()
  ).slice(-2)}`
  return `${startTime}-${endTime} ${event.getTitle()}`
}

const getElementsByTagName = (element, tagName: string): any[] => {
  const data = []
  const descendants = element.getDescendants()
  for (const key of Object.keys(descendants)) {
    const elt = descendants[key].asElement()
    if (elt && elt.getName() === tagName) {
      data.push(elt)
    }
  }
  return data
}

const postToSlack = (text: string): void => {
  UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
    contentType: 'application/json',
    method: 'post',
    payload: JSON.stringify({
      attachments: [
        {
          color: SLACK_BOT_ATTACHMENT_COLOR,
          text
        }
      ],
      channel: SLACK_CHANNEL,
      icon_emoji: SLACK_BOT_ICON_EMOJI,
      username: SLACK_BOT_USERNAME
    })
  })
}

function gmailGitHubNotifications(): void {
  const maxEmailCount: number = 20
  const GmailMessages = getGmailMessages({
    condition: 'is:unread from:"notifications@github.com"',
    max: maxEmailCount,
    start: 0
  })
  for (const message of GmailMessages) {
    if (message) {
      postToSlack(message)
    }
  }
}

function allEventsTodayGoogleCalendar(): void {
  if (isWeekend()) {
    return
  }
  postToSlack(
    [
      '*All events today*',
      getAllEventsTodayGoogleCalendar() || 'No events.'
    ].join('\n')
  )
}

function githubContributionCountYesterday(): void {
  const contributions: string = UrlFetchApp.fetch(
    `https://github.com/users/${GITHUB_USER_ID}/contributions`
  ).getContentText()
  const TARGET_ELEMENT_NAME: string = 'rect'
  const doc = XmlService.parse(
    contributions.replace('data-repository-hovercards-enabled', '')
  )
  const targetEls = getElementsByTagName(
    doc.getRootElement(),
    TARGET_ELEMENT_NAME
  )
  const targetEl = targetEls[targetEls.length - 2]

  const contributionCount: number = Number(
    targetEl.getAttribute('data-count').getValue()
  )
  const contributionDate: string = targetEl.getAttribute('data-date').getValue()
  postToSlack(
    `Contribution count ${contributionDate}: <https://github.com/${GITHUB_USER_ID}|${contributionCount}>`
  )
}

function createCrowiDiaryToday(): void {
  if (isWeekend()) {
    return
  }
  const now: Date = new Date()
  const formatedDate: string = `${now.getFullYear()}/${(
    '0' +
    (now.getMonth() + 1)
  ).slice(-2)}/${('0' + now.getDate()).slice(-2)}`
  const path: string = `/user/${CROWI_USER_ID}/diary/${formatedDate}`
  const bodyTemplate: string = `
# Diary ${formatedDate}

This page has been created by a script. Please write your diary today and delete this line.

## 今日やったこと

## 次にやること

## 雑感`
  const res = UrlFetchApp.fetch(`${CROWI_URL}/_api/pages.create`, {
    contentType: 'application/json',
    method: 'post',
    payload: JSON.stringify({
      access_token: CROWI_API_TOKEN,
      body: bodyTemplate,
      path
    })
  })
  if (res) {
    postToSlack(`Created a diary for today: <${CROWI_URL}${path}|${path}>`)
  }
}

function sendTestMessageToSlack(): void {
  postToSlack('Hello! This is a test message')
}
