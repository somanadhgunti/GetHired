import { apiClient } from '../lib/http'

export type FeedbackPayload = {
  name: string
  email: string
  topic: string
  subject: string
  message: string
}

export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  await apiClient.post('/feedback/', payload)
}
