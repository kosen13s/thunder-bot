import { MessageHandler } from '../types'
import { generateSayArgument } from '../wrapper/bolt'

export const rollDice = (
  diceCount: number,
  maxNumber: number
): string | undefined => {
  if (diceCount === 0 || maxNumber === 0) {
    return
  }
  if (diceCount > 256) {
    return `${diceCount}個のダイスが要求されましたが、振れるダイスの数は256個までです。`
  }
  if (diceCount * maxNumber > 1e8) {
    return 'ダイスの出目の合計の最大値が1億を超えたため、thunder-botはダイスの実行を中止しました。'
  }

  const numbers = Array.from(
    Array(diceCount),
    () => Math.floor(maxNumber * Math.random()) + 1
  )
  const sum = numbers.reduce((sum, num) => sum + num)

  return `${diceCount}D${maxNumber} => ${numbers}\n合計: ${sum}`
}

export const dice: MessageHandler = ({ message, context, say }) => {
  const diceCount = parseInt(context.matches[1], 10)
  const maxNumber = parseInt(context.matches[2], 10)

  const result = rollDice(diceCount, maxNumber)
  if (result) {
    say(generateSayArgument(message, result))
  }
}
