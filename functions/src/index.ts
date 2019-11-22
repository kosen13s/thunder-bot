import * as functions from 'firebase-functions'
import { App, ExpressReceiver, directMention } from '@slack/bolt'
import { rollDice } from './controller/dice'
import { stopDaisougen, startDaisougen } from './controller/daisougen'
import { generateSayArgument } from './wrapper/bolt'
import { saveThunderKvs, loadThunderKvs } from './controller/kvs'
import { takeGyotaku } from './controller/gyotaku'
import { ping } from './controller/ping'

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
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
app.message(/\b(\d+)D(\d+)\b/i, ({ context, message, say }) => {
  const diceCount = parseInt(context.matches[1], 10)
  const maxNumber = parseInt(context.matches[2], 10)

  const result = rollDice(diceCount, maxNumber)
  if (result) {
    say(generateSayArgument(message, result))
  }
})
app.message(/\bping\b/i, directMention(), ping)

app.message(/^大草原スロット$/, startDaisougen(app.client))
app.event('reaction_added', stopDaisougen(app.client, config.slack.user.token))

app.command('/save-thunder-kvs', saveThunderKvs)
app.command('/load-thunder-kvs', loadThunderKvs)

app.action(
  { callback_id: 'gyotaku' },
  takeGyotaku(app.client, config.slack.gyotaku.channel)
)

export const thunder = functions.https.onRequest(expressReceiver.app)
