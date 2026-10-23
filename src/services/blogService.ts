// services/blogService.ts

import { api } from "@/config/api";
import {
  AllBlogsResponse,
  SingleBlogResponse,
  GenericBlogMutationResponse,
  IUpdateBlogPayload,
} from "@/types/blog.types";

export const blogService = {
  // Get all blogs (Supports pagination & search keywords e.g., ?page=1&keyword=plant)
  getAllBlogs: async (queryParams?: string): Promise<AllBlogsResponse> => {
    const url = queryParams ? `/marketing/blogs?${queryParams}` : "/marketing/blogs";
    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  // Get single blog post by slug
  getBlogBySlug: async (slug: string): Promise<SingleBlogResponse> => {
    const cleanSlug = decodeURIComponent(String(slug || "")).trim();
    const res: any = await api.get(`/marketing/blog/${encodeURIComponent(cleanSlug)}`);
    return res?.data ?? res;
  },

  // Get single blog post by ID
  getBlogById: async (id: string): Promise<SingleBlogResponse> => {
    const res: any = await api.get(`/marketing/blog/manage/${id}`);
    return res?.data ?? res;
  },

  // Create new blog post (Supports FormData for image uploads or JSON payload)
  createBlog: async (payload: FormData | any): Promise<GenericBlogMutationResponse> => {
    const config = payload instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined;
    const res: any = await api.post("/marketing/blog/new", payload, config);
    return res?.data ?? res;
  },

  // Update existing blog (Requires Auth - Admin/Nursery, supports FormData or JSON)
  updateBlog: async (blogId: string, payload: IUpdateBlogPayload | FormData): Promise<GenericBlogMutationResponse> => {
    const config = payload instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined;
    const res: any = await api.put(`/marketing/blog/manage/${blogId}`, payload, config);
    return res?.data ?? res;
  },

  // Delete blog post (Requires Auth - Admin/Nursery)
  deleteBlog: async (blogId: string): Promise<GenericBlogMutationResponse> => {
    const res: any = await api.delete(`/marketing/blog/manage/${blogId}`);
    return res?.data ?? res;
  },
};