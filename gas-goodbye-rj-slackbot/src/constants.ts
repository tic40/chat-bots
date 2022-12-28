const properties = PropertiesService.getScriptProperties()
const BOT_NAME: string = properties.getProperty('BOT_NAME')
const BOT_PHRASE: string = properties.getProperty('BOT_PHRASE')
const GITHUB_URL: string = properties.getProperty('GITHUB_URL')
const SLACK_BOT_ICON_EMOJI: string = properties.getProperty(
  'SLACK_BOT_ICON_EMOJI'
)
const SLACK_BOT_USERNAME: string = properties.getProperty('SLACK_BOT_USERNAME')
const SLACK_CHANNEL: string = properties.getProperty('SLACK_CHANNEL')
const SLACK_OUTGOING_WEBHOOK_TOKEN: string = properties.getProperty(
  'SLACK_OUTGOING_WEBHOOK_TOKEN'
)
const SLACK_WEBHOOK_URL: string = properties.getProperty('SLACK_WEBHOOK_URL')
const SPREAD_SHEET_ID: string = properties.getProperty('SPREAD_SHEET_ID')
const USER_LOCAL_API_KEY: string = properties.getProperty('USER_LOCAL_API_KEY')
const COMPANY_CODE_RJ: number = Number(
  properties.getProperty('COMPANY_CODE_RJ')
)
const COMPANY_CODE_NOTE: number = Number(
  properties.getProperty('COMPANY_CODE_NOTE')
)
const TWITTER_BEARER_TOKEN: string = properties.getProperty(
  'TWITTER_BEARER_TOKEN'
)
const COMPANY_CODE_NIKKEI_AVE = 998407
const WEATHER_FORECAST_DAY_ID = {
  TODAY: 0,
  TOMORROW: 1,
  DAY_AFTER_TOMORROW: 2,
}
