"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, X, Upload, FileText, Tag, Image as ImageIcon } from "lucide-react";
import { useAppDispatch } from "@/redux/hooks";
import { blogService } from "@/services/blogService";
import { createBlogSuccess } from "@/redux/slices/blogSlice";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function CreateBlogPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File select handler for Cloudinary
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isContentEmpty = !formData.content.replace(/<[^>]*>/g, "").trim();

    if (!formData.title || isContentEmpty || !imageFile) {
      setError("Please fill in all required fields and upload a cover image.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append("coverImage", imageFile);
      tags.forEach((tag) => data.append("tags", tag));

      const response = await blogService.createBlog(data);

      if (response.blog) {
        dispatch(createBlogSuccess(response.blog));
      }
      router.push("/admin/blogs");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || err?.response?.data?.message || "Failed to create blog post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blogs"
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 transition bg-white text-slate-600 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Create New Blog Post
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Publish engaging articles and updates for your community
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium animate-in fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-semibold text-base">
            <FileText className="w-5 h-5 text-green-600" />
            <span>Article Details</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Blog Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., 10 Tips for Keeping Your Indoor Plants Thriving"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/5 transition"
            />
          </div>

          {/* Tags Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Add a tag (e.g. PlantCare) and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/5 transition"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-green-900 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cover Image Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-semibold text-base">
            <ImageIcon className="w-5 h-5 text-green-600" />
            <span>Cover Photo</span>
          </div>

          <div>
            {imagePreview ? (
              <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-w-md">
                <img
                  src={imagePreview}
                  alt="Cover Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg shadow-md transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-green-500/50 bg-slate-50/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition group">
                <div className="p-3 bg-white border border-slate-200 rounded-full shadow-sm text-slate-400 group-hover:text-green-600 group-hover:border-green-200 transition mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  Click to upload cover photo
                </p>
                <p className="text-xs text-slate-400">
                  PNG, JPG, WEBP up to 5MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-800 font-semibold text-base">
              Content <span className="text-red-500">*</span>
            </span>
          </div>
          <div className="min-h-[300px]">
            <RichTextEditor
              value={formData.content}
              onChange={(html) => setFormData({ ...formData, content: html })}
              placeholder="Write your blog post content here..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/blogs"
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 bg-white transition shadow-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Publishing..." : "Publish Post"}
          </button>
        </div>
      </form>
    </div>
  );
}