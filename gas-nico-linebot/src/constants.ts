const properties = PropertiesService.getScriptProperties()
const LINE_TOKEN: string = properties.getProperty('LINE_TOKEN')
const LINE_GROUP_ID: string = properties.getProperty('LINE_GROUP_ID')
const BOT_PHRASE: string = properties.getProperty('BOT_PHRASE')
const SPREAD_SHEET_ID: string = properties.getProperty('SPREAD_SHEET_ID')
const BOT_NAME: string = properties.getProperty('BOT_NAME')
const USER_LOCAL_API_KEY: string = properties.getProperty('USER_LOCAL_API_KEY')
const COMPANY_CODE_NIKKEI_AVE: number = 998407
const DRIVE_FOLDER_WITHINGS: string = properties.getProperty(
  'DRIVE_FOLDER_WITHINGS'
)
const TWITTER_BEARER_TOKEN: string = properties.getProperty(
  'TWITTER_BEARER_TOKEN'
)

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
