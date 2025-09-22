import api from './api';

export interface Word {
  _id: string;
  body: string;
  createAt: string;
}

export interface WordSummary {
  _id: string;
  body: string;
}

export interface WordQueryParams {
  keyword?: string;
  orderBy?: string;
  offset?: number;
  limit?: number;
}

export const wordService = {
  getWords: async (params: WordQueryParams = {}): Promise<Word[]> => {
    const queryParams = new URLSearchParams();
    
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.orderBy) queryParams.append('orderBy', params.orderBy);
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = `/words${queryString ? '?' + queryString : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  getWordSummary: async (params: WordQueryParams = {}): Promise<WordSummary[]> => {
    const queryParams = new URLSearchParams();
    
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.orderBy) queryParams.append('orderBy', params.orderBy);
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = `/words/summary${queryString ? '?' + queryString : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  getWordDetail: async (id: string): Promise<Word> => {
    const response = await api.get(`/words/${id}`);
    return response.data;
  },

  bookmarkWord: async (id: string, value: boolean = true) => {
    const response = await api.post(`/words/bookmark/${id}?value=${value}`);
    return response.data;
  }
};
