export interface AuthUser {
  id: string
  token: string
  name?: string
  username?: string
  email?: string
}

export interface Word {
  _id: string
  body: string
  createAt?: string
  bookMark?: boolean
}

export interface WordSummary {
  _id: string
  body: string
}

export interface WordQueryParams {
  keyword?: string
  orderBy?: string
  offset?: number
  limit?: number
}

export interface WordSummaryPage {
  items: WordSummary[]
  total: number
}

export interface RegisterPayload {
  username: string
  password: string
  email: string
  name: string
}

export interface WordLookupResult {
  word: string
  body: string
}

export interface WordQuizItem {
  id: string
  english: string
  vietnameseHint: string
  partOfSpeech?: string
  acceptedAnswers: string[]
}

export interface WordQuizResult {
  total: number
  items: WordQuizItem[]
}
