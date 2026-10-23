// types/blog.types.ts

export interface IBlogAuthor {
  _id: string;
  name: string;
  email?: string;
  avatar?: {
    public_id?: string;
    url?: string;
  } | string;
}

export interface IBlog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  author: IBlogAuthor | string;
  authorType: "Admin" | "Nursery";
  coverImage: string;
  url?: string;
  category?: string;
  readTime?: string;
  excerpt?: string;
  isPublished?: boolean;
  tags: string[];
  views: number;
  createdAt: string;
  updatedAt: string;
}

// Request DTO for Creation and Updation
export interface ICreateBlogPayload {
  title: string;
  content: string;
  coverImage: string;
  url?: string; // Optional field for a custom URL if needed
  tags?: string[];
  data?: any; // Optional field for additional data if needed
}

export interface IUpdateBlogPayload {
  title?: string;
  content?: string;
  coverImage?: string;
  url?: string; // Optional field for a custom URL if needed
  tags?: string[];
}

// Backend API Response Interfaces
export interface AllBlogsResponse {
  success: boolean;
  count: number;
  totalBlogs: number;
  resPerPage: number;
  currentPage: number;
  totalPages: number;
  blogs: IBlog[];
  data?: IBlog[]; // Optional fallback for different API response structures
}

export interface SingleBlogResponse {
  success: boolean;
  blog: IBlog;
  data?: IBlog;
}

export interface GenericBlogMutationResponse {
  success: boolean;
  message?: string;
  blog?: IBlog;
}
