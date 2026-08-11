import api from './client'
import type {
  Word,
  WordLookupResult,
  WordQueryParams,
  WordQuizResult,
  WordSummaryPage,
} from '../types'

function toQuery(params: WordQueryParams = {}): string {
  const query = new URLSearchParams()
  if (params.keyword) query.append('keyword', params.keyword)
  if (params.orderBy) query.append('orderBy', params.orderBy)
  if (params.offset !== undefined) query.append('offset', String(params.offset))
  if (params.limit !== undefined) query.append('limit', String(params.limit))
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

function normalizeWordPage(data: unknown): WordSummaryPage {
  if (Array.isArray(data)) {
    return { items: data, total: data.length }
  }

  const page = data as { items?: Word[]; total?: number } | null
  const items = page?.items ?? []
  return {
    items,
    total: typeof page?.total === 'number' ? page.total : items.length,
  }
}

export async function getWords(params: WordQueryParams = {}): Promise<Word[]> {
  const res = await api.get(`/words${toQuery(params)}`)
  return normalizeWordPage(res.data).items as Word[]
}

export async function getWordsPage(params: WordQueryParams = {}): Promise<WordSummaryPage> {
  const res = await api.get(`/words${toQuery(params)}`)
  return normalizeWordPage(res.data)
}

export async function getWordSummary(params: WordQueryParams = {}): Promise<WordSummaryPage> {
  const res = await api.get(`/words/summary${toQuery(params)}`)
  return normalizeWordPage(res.data)
}

export async function getWordDetail(id: string): Promise<Word> {
  const res = await api.get(`/words/${id}`)
  return res.data
}

export async function deleteWord(id: string): Promise<void> {
  await api.delete(`/words/${id}`)
}

export async function bookmarkWord(id: string, value = true): Promise<void> {
  await api.post(`/words/bookmark/${id}?value=${value}`)
}

export async function createFromForm(body: string): Promise<void> {
  const formData = new FormData()
  formData.append('body', body)
  await api.post('/words/form', formData)
}

export async function createFromAi(word: string): Promise<unknown> {
  const res = await api.post('/words/ai', { word: word.trim() })
  return res.data
}

export async function lookupWord(word: string): Promise<WordLookupResult> {
  const res = await api.post('/words/ai/lookup', { word: word.trim() })
  return res.data
}

export async function getQuiz(params: {
  keyword?: string
  orderBy?: string
  offset?: number
  limit?: number
} = {}): Promise<WordQuizResult> {
  const query = new URLSearchParams()
  if (params.keyword) query.append('keyword', params.keyword)
  if (params.orderBy) query.append('orderBy', params.orderBy)
  if (params.offset !== undefined) query.append('offset', String(params.offset))
  if (params.limit !== undefined) query.append('limit', String(params.limit))
  const qs = query.toString()
  const res = await api.get(`/words/quiz${qs ? `?${qs}` : ''}`)
  return res.data
}
