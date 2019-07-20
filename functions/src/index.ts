import * as functions from 'firebase-functions'
import { App, ExpressReceiver } from '@slack/bolt'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((_, response) => {
  response.send('Hello from Firebase!')
})

// ref: https://github.com/seratch/bolt-on-cloud-functions-for-firebase

const config = functions.config()

const expressReceiver = new ExpressReceiver({
  signingSecret: config.slack.secret,
  endpoints: '/events',
})

const app = new App({
  receiver: expressReceiver,
  token: config.slack.bot.token,
})

app.error(console.log)
app.message(/\b(\d+)D(\d+)\b/i, ({ context, say }) => {
  const diceCount = parseInt(context.matches[1], 10)
  const maxNumber = parseInt(context.matches[2], 10)

  if (diceCount === 0 || maxNumber === 0) {
    return
  }
  if (diceCount > 256) {
    say(
      `${diceCount}個のダイスが要求されましたが、振れるダイスの数は256個までです。`
    )
    return
  }
  if (diceCount * maxNumber > 1e8) {
    say(
      'ダイスの出目の合計の最大値が1億を超えたため、thunder-botはダイスの実行を中止しました。'
    )
    return
  }
  const numbers = Array.from(
    Array(diceCount),
    () => Math.floor(maxNumber * Math.random()) + 1
  )

  const sum = numbers.reduce((sum, num) => sum + num)

  say(`${diceCount}D${maxNumber} => ${numbers}\n合計: ${sum}`)
})

export const thunder = functions.https.onRequest(expressReceiver.app)
