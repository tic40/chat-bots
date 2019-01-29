const isWeekend = (): boolean => {
  const day: number = new Date().getDay()
  return day === 0 || day === 6
}

const randomFromArray = (items: any[]): any => {
  return items[Math.floor(Math.random() * items.length)]
}

const randPickMessageSheet = (sheetName: string): string => {
  const values = getSpreadSheetValues(sheetName)
  return randomFromArray(values)[0]
}

const daysLeft = (): number => {
  const now: Date = new Date()
  const firstDay: Date = new Date(now.getFullYear() + 1, 0, 1)
  const diff: number = (firstDay.getTime() - now.getTime()) / 1000
  return Math.floor(diff / (24 * 60 * 60))
}
