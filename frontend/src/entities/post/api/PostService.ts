import { httpClient } from '@/shared/api/httpClient';
import type { EstablishmentPost, CreatePostRequest, UpdatePostRequest } from '../model/types';

export class PostService {
  static async getPosts(slug: string, page = 1, limit = 10): Promise<{ data: EstablishmentPost[]; total: number }> {
    const res = await httpClient.get<{ success: boolean; data: EstablishmentPost[]; meta: { total: number } }>(
      `/api/establishments/${slug}/posts?page=${page}&limit=${limit}`
    );
    return { data: res.data.data, total: res.data.meta?.total ?? 0 };
  }

  static async createPost(slug: string, request: CreatePostRequest): Promise<EstablishmentPost> {
    const res = await httpClient.post<{ success: boolean; data: EstablishmentPost }>(
      `/api/establishments/${slug}/posts`,
      request
    );
    return res.data.data;
  }

  static async updatePost(slug: string, postId: string, request: UpdatePostRequest): Promise<EstablishmentPost> {
    const res = await httpClient.put<{ success: boolean; data: EstablishmentPost }>(
      `/api/establishments/${slug}/posts/${postId}`,
      request
    );
    return res.data.data;
  }

  static async deletePost(slug: string, postId: string): Promise<void> {
    await httpClient.delete(`/api/establishments/${slug}/posts/${postId}`);
  }
}
