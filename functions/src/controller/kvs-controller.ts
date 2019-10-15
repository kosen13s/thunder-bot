import * as admin from 'firebase-admin'
import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt'
admin.initializeApp()

const firestore = admin.firestore()

const saveFirestore = (key: string, value: string) => {
  return firestore
    .collection('kvs')
    .doc(key)
    .set({ value })
}

const saveKvs = async (key: string, value: string) => {
  try {
    await saveFirestore(key, value)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

export const saveThunderKvs: Middleware<SlackCommandMiddlewareArgs> = async ({
  ack,
  command,
  respond,
}) => {
  ack('saving...')
  const [key, value] = command.text.trim().split(/\s+/)
  const succeedSave = await saveKvs(key, value)
  respond({
    channel: command.channel_name,
    text: succeedSave ? `saved \`${key}\` as \`${value}\`` : 'error',
  })
}
