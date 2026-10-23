"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, Search, Eye, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { blogService } from "@/services/blogService";
import {
  setAllBlogsData,
  setBlogLoading,
  setBlogError,
  deleteBlogFromState,
} from "@/redux/slices/blogSlice";

export default function AdminBlogsPage() {
  const dispatch = useAppDispatch();
  const { blogs, totalBlogs, currentPage, totalPages, isLoading, error } =
    useAppSelector((state) => state.blog);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBlogs = useCallback(
    async (pageNo: number, search: string) => {
      dispatch(setBlogLoading(true));
      try {
        const query = `page=${pageNo}${search ? `&keyword=${encodeURIComponent(search)}` : ""}`;
        const data = await blogService.getAllBlogs(query);

        dispatch(
          setAllBlogsData({
            blogs: data.blogs || data.data || [],
            totalBlogs: data.totalBlogs || data.count || 0,
            resPerPage: data.resPerPage || 10,
            currentPage: data.currentPage || pageNo,
            totalPages: data.totalPages || 1,
          })
        );
      } catch (err: any) {
        dispatch(
          setBlogError(err?.message || err?.response?.data?.message || "Failed to fetch blogs")
        );
      }
    },
    [dispatch]
  );

  useEffect(() => {
    fetchBlogs(page, searchTerm);
  }, [fetchBlogs, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs(1, searchTerm);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    setDeletingId(id);
    try {
      await blogService.deleteBlog(id);
      dispatch(deleteBlogFromState(id));
    } catch (err: any) {
      alert(err?.message || err?.response?.data?.message || "Failed to delete blog post");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Title Bar - Plant page design matched */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0 flex items-center gap-2">
            <BookOpen className="text-green-600 w-5.5 h-5.5" />
            <span>Manage Blog Posts</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">
            Total Posts: <span className="font-bold text-slate-700">{totalBlogs}</span> — Track articles, view metrics, and manage publication workflow.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/blogs/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-green-600/10 cursor-pointer transition-all border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Post</span>
          </Link>
        </div>
      </div>

      {/* Search Input Bar - Plant page design matched */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search blogs by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 focus:outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Error Context Banner */}
      {error && (
        <div className="w-full p-6 bg-red-50/50 border border-red-100 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-red-800 block">Stream Processing Failure Context Triggered</span>
            <span className="text-[11px] text-red-600 mt-0.5 block">{error}</span>
          </div>
        </div>
      )}

      {/* Main Table Content Block */}
      {isLoading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading blog posts...</span>
        </div>
      ) : !blogs || blogs.length === 0 ? (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">No blog posts found.</span>
        </div>
      ) : (
        <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-xs bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Cover</th>
                  <th className="px-6 py-4">Title & Slug</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4">Published</th>
                  <th className="px-6 py-4 text-right pr-6">Actions Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="w-12 h-10 relative rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 shadow-inner">
                        {blog.coverImage ? (
                          <Image
                            src={typeof blog.coverImage === "string" ? blog.coverImage : blog.coverImage || "/images/placeholder.svg"}
                            alt={blog.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                            N/A
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <span className="font-bold text-slate-900 block truncate max-w-[220px]">
                        {blog.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate max-w-[180px]">
                        /{blog.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-wider">
                        {blog.authorType || "Admin"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{blog.views || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-slate-500 font-medium">
                      {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-6 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/blogs/edit/${blog._id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer inline-flex items-center justify-center"
                          title="Edit Post"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(blog._id)}
                          disabled={deletingId === blog._id}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer disabled:opacity-50 inline-flex items-center justify-center"
                          title="Delete Post"
                        >
                          {deletingId === blog._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar - Styled to match design system */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}