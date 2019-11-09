import * as functions from 'firebase-functions'
import { App, ExpressReceiver, directMention } from '@slack/bolt'
import { rollDice } from './controller/dice-controller'
import {
  stopDaisougen,
  startDaisougen,
} from './controller/daisougen-controller'
import { generateSayArgument } from './wrapper/bolt'
import { saveThunderKvs, loadThunderKvs } from './controller/kvs-controller'
import { takeGyotaku } from './controller/gyotaku-controller'
// import { saveThunderKvs } from './controller/kvs-controller'

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
app.message(/\b(\d+)D(\d+)\b/i, ({ context, message, say }) => {
  const diceCount = parseInt(context.matches[1], 10)
  const maxNumber = parseInt(context.matches[2], 10)

  const result = rollDice(diceCount, maxNumber)
  if (result) {
    say(generateSayArgument(message, result))
  }
})
app.message(/\bping\b/i, directMention(), ({ message, say }) => {
  say(generateSayArgument(message, 'pong'))
})

app.message(/^大草原スロット$/, startDaisougen(app.client))
app.event('reaction_added', stopDaisougen(app.client, config.slack.user.token))

app.command('/save-thunder-kvs', saveThunderKvs)
app.command('/load-thunder-kvs', loadThunderKvs)

app.action({ callback_id: 'gyotaku' }, takeGyotaku(app.client)) // eslint-disable-line @typescript-eslint/camelcase

export const thunder = functions.https.onRequest(expressReceiver.app)
