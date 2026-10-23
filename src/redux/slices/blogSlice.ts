// store/slices/blogSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IBlog } from "@/types/blog.types";

interface BlogState {
  blogs: IBlog[];
  singleBlog: IBlog | null;
  totalBlogs: number;
  resPerPage: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  mutationSuccess: boolean;
}

const initialState: BlogState = {
  blogs: [],
  singleBlog: null,
  totalBlogs: 0,
  resPerPage: 6,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  mutationSuccess: false,
};

export const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    setBlogLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setBlogError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearBlogMutationFlags: (state) => {
      state.mutationSuccess = false;
      state.error = null;
    },

    setAllBlogsData: (
      state,
      action: PayloadAction<{
        blogs: IBlog[];
        totalBlogs: number;
        resPerPage: number;
        currentPage: number;
        totalPages: number;
      }>
    ) => {
      state.blogs = action.payload.blogs;
      state.totalBlogs = action.payload.totalBlogs;
      state.resPerPage = action.payload.resPerPage;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.isLoading = false;
      state.error = null;
    },

    setSingleBlogData: (state, action: PayloadAction<IBlog>) => {
      state.singleBlog = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    clearSingleBlogData: (state) => {
      state.singleBlog = null;
    },

    createBlogSuccess: (state, action: PayloadAction<IBlog>) => {
      state.blogs.unshift(action.payload);
      state.totalBlogs += 1;
      state.mutationSuccess = true;
      state.isLoading = false;
      state.error = null;
    },

    updateBlogSuccess: (state, action: PayloadAction<IBlog>) => {
      const index = state.blogs.findIndex((b) => b._id === action.payload._id);
      if (index !== -1) {
        state.blogs[index] = action.payload;
      }
      if (state.singleBlog?._id === action.payload._id) {
        state.singleBlog = action.payload;
      }
      state.mutationSuccess = true;
      state.isLoading = false;
      state.error = null;
    },

    deleteBlogFromState: (state, action: PayloadAction<string>) => {
      state.blogs = state.blogs.filter((blog) => blog._id !== action.payload);
      state.totalBlogs = Math.max(0, state.totalBlogs - 1);
      if (state.singleBlog?._id === action.payload) {
        state.singleBlog = null;
      }
      state.mutationSuccess = true;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setBlogLoading,
  setBlogError,
  clearBlogMutationFlags,
  setAllBlogsData,
  setSingleBlogData,
  clearSingleBlogData,
  createBlogSuccess,
  updateBlogSuccess,
  deleteBlogFromState,
} = blogSlice.actions;

export default blogSlice.reducer;