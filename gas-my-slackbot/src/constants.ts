const properties = PropertiesService.getScriptProperties()
// slack
const SLACK_WEBHOOK_URL: string = properties.getProperty('SLACK_WEBHOOK_URL')
const SLACK_CHANNEL: string = properties.getProperty('SLACK_CHANNEL')
const SLACK_BOT_ICON_EMOJI: string =
  properties.getProperty('SLACK_BOT_ICON_EMOJI') || ':sunglasses:'
const SLACK_BOT_USERNAME: string =
  properties.getProperty('SLACK_BOT_USERNAME') || 'gas-my-slack-channel-bot'
const SLACK_BOT_ATTACHMENT_COLOR: string =
  properties.getProperty('SLACK_BOT_ATTACHMENT_COLOR') || '#ffa500'
// GitHuib
const GITHUB_USER_ID: string = properties.getProperty('GITHUB_USER_ID')

// crowi
const CROWI_USER_ID: string = properties.getProperty('CROWI_USER_ID')
const CROWI_API_TOKEN: string = properties.getProperty('CROWI_API_TOKEN')
const CROWI_URL: string = properties.getProperty('CROWI_URL')
