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
const RJ: string[] = properties.getProperty('RJ').split(',')
const COMPANY_CODE_RJ: number = Number(
  properties.getProperty('COMPANY_CODE_RJ')
)
const RJ_DAY: number = Number(properties.getProperty('RJ_DAY'))
const TWITTER_BEARER_TOKEN: string = properties.getProperty(
  'TWITTER_BEARER_TOKEN'
)
const PROGRESS_TARGET_CHANNEL: string = properties.getProperty(
  'PROGRESS_TARGET_CHANNEL'
)
const IMGURL_CLIENT_ID: string = properties.getProperty('IMGURL_CLIENT_ID')
const GET_PAIRS_URL: string = properties.getProperty('GET_PAIRS_URL')
const COMPANY_CODE_NIKKEI_AVE: number = 998407

const SHEET_NAMES: any = {
  EVENING_CALL: 'evening_call',
  KYOMO_ICHINICHI: 'kyoumo_ichinichi',
  MISSION: 'mission',
  HOW_IS_PROGRESS: 'how_is_progress',
  OPENING_CALL: 'opening_call',
  WAY: 'way',
  RJ: 'rj',
  RJ_DAY: 'rj_day',
}

const WEATHER_FORECAST_DAY_ID: any = {
  TODAY: 0,
  TOMORROW: 1,
  DAY_AFTER_TOMORROW: 2,
}
