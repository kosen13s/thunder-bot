import * as functions from 'firebase-functions'
import { App, ExpressReceiver, directMention } from '@slack/bolt'
import { dice } from './controller/dice'
import { stopDaisougen, startDaisougen } from './controller/daisougen'
import { saveThunderKvs, loadThunderKvs } from './controller/kvs'
import { takeGyotaku } from './controller/gyotaku'
import { ping } from './controller/ping'
import { postAsAnonymous } from './controller/anonymous'

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
app.message(/\b(\d+)D(\d+)\b/i, dice)
app.message(/\bping\b/i, directMention(), ping)

app.message(/^大草原スロット$/, startDaisougen(config.slack.user.token))
app.event('reaction_added', stopDaisougen(config.slack.user.token))

app.command('/save-thunder-kvs', saveThunderKvs)
app.command('/load-thunder-kvs', loadThunderKvs)

app.action(
  { callback_id: 'gyotaku' },
  takeGyotaku(config.slack.gyotaku.channel)
)

app.command('/anonymous', postAsAnonymous(config.slack.user.token))

export const thunder = functions.https.onRequest(expressReceiver.app)
