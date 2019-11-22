import * as functions from 'firebase-functions'
import { App, ExpressReceiver, directMention } from '@slack/bolt'
import { dice, DICE_MESSAGE } from './controller/dice'
import {
  stopDaisougen,
  startDaisougen,
  START_DAISOUGEN_MESSAGE,
  STOP_DAISOUGEN_EVENT,
} from './controller/daisougen'
import {
  saveThunderKvs,
  loadThunderKvs,
  SAVE_THUNDER_KVS_COMMAND,
  LOAD_THUNDER_KVS_COMMAND,
} from './controller/kvs'
import { takeGyotaku, GYOTAKU_ACTION } from './controller/gyotaku'
import { ping, PING_MESSAGE } from './controller/ping'

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
app.message(DICE_MESSAGE, dice)
app.message(PING_MESSAGE, directMention(), ping)

app.message(START_DAISOUGEN_MESSAGE, startDaisougen(app.client))
app.event(
  STOP_DAISOUGEN_EVENT,
  stopDaisougen(app.client, config.slack.user.token)
)

app.command(SAVE_THUNDER_KVS_COMMAND, saveThunderKvs)
app.command(LOAD_THUNDER_KVS_COMMAND, loadThunderKvs)

app.action(
  GYOTAKU_ACTION,
  takeGyotaku(app.client, config.slack.gyotaku.channel)
)

export const thunder = functions.https.onRequest(expressReceiver.app)
