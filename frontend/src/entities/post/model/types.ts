export interface EstablishmentPost {
  id: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  content: string;
  imageUrls: string[];
}

export interface UpdatePostRequest {
  content?: string;
  imageUrls?: string[];
}
