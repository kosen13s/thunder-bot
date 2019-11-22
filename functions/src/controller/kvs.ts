import * as admin from 'firebase-admin'
import { CommandHandler } from '../types'
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

export const saveThunderKvs: CommandHandler = async ({
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

const loadFirestore = async (key: string) => {
  const doc = await firestore
    .collection('kvs')
    .doc(key)
    .get()
  const data = doc.data()
  return data ? data.value : undefined
}

const loadKvs = async (key: string) => {
  return loadFirestore(key).catch(() => undefined)
}

export const loadThunderKvs: CommandHandler = async ({
  ack,
  command,
  respond,
}) => {
  ack('loading...')
  const key = command.text.trim()
  const value = await loadKvs(key)
  respond({
    channel: command.channel_name,
    text: value
      ? `saved value for \`${key}\` is \`${value}\``
      : `no value is saved for \`${key}\``,
  })
}
