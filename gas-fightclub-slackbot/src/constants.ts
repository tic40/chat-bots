const properties = PropertiesService.getScriptProperties()

const BOT_NAME: string = properties.getProperty('BOT_NAME')
const BOT_PHRASE: string = properties.getProperty('BOT_PHRASE')
const SLACK_BOT_ICON_EMOJI: string = properties.getProperty(
  'SLACK_BOT_ICON_EMOJI'
)
const SLACK_BOT_USERNAME: string = properties.getProperty('SLACK_BOT_USERNAME')
const SLACK_CHANNEL: string = properties.getProperty('SLACK_CHANNEL')
const SLACK_OUTGOING_WEBHOOK_TOKEN: string = properties.getProperty(
  'SLACK_OUTGOING_WEBHOOK_TOKEN'
)
const SLACK_WEBHOOK_URL: string = properties.getProperty('SLACK_WEBHOOK_URL')
const USER_LOCAL_API_KEY: string = properties.getProperty('USER_LOCAL_API_KEY')
const TWITTER_BEARER_TOKEN: string = properties.getProperty(
  'TWITTER_BEARER_TOKEN'
)
const SPREAD_SHEET_ID: string = properties.getProperty('SPREAD_SHEET_ID')
const DM_FROM_CHATBOT_APP_TOKEN = properties.getProperty(
  'DM_FROM_CHATBOT_APP_TOKEN'
)
const DM_FROM_CHATBOT_APP_DM_CHANNEL_ID = properties.getProperty(
  'DM_FROM_CHATBOT_APP_DM_CHANNEL_ID'
)
