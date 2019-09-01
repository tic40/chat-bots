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
const SHEET_NAMES: any = {
  ANNIVERSARY: 'anniversary',
  BOT_PHOTO: 'photo',
  DONE_DIET_TASK: 'doneDietTask',
  ENCOURAGE_DIET_TASK: 'encourageDietTask',
  EVENING_CALL: 'eveningCall',
  MORNING_CALL: 'morningCall',
  RESPONSE: 'response',
  TWEET: 'tweet',
  WISHLIST: 'wishlist',
  WITHINGS: 'withings',
  WITHINGS_CHART: 'withingsChart'
}
const WEATHER_FORECAST_DAY_ID: any = {
  TODAY: 0,
  TOMORROW: 1,
  DAY_AFTER_TOMORROW: 2
}

const WITHINGS_COLUMNS: any = {
  USERNAME: 1,
  WEIGHT: 2,
  FAT_PERCENT: 3,
  DATE: 4
}
