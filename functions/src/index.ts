import * as functions from 'firebase-functions'
import { App, ExpressReceiver } from '@slack/bolt'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((_, response): void => {
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
app.message('hello', ({ message, say }): void => {
  say(`Hello <@${message.user}>!`)
})

export const thunder = functions.https.onRequest(expressReceiver.app)
