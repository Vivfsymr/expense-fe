import api from './api';

export interface Word {
  _id: string;
  body: string;
  createAt: string;
}

export interface WordQueryParams {
  keyword?: string;
  orderBy?: 'alpha' | 'beta' | 'newest' | 'oldest' | 'random';
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
  }
};
