"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your blog content here...",
}: RichTextEditorProps) {
  const ReactQuill = useMemo(
    () =>
      dynamic(() => import("react-quill-new"), {
        ssr: false,
        loading: () => (
          <div className="h-64 w-full animate-pulse rounded-lg bg-gray-100 border" />
        ),
      }),
    []
  );

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, false] }],
        ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "list",
    "indent",
    "link",
    "image",
  ];

  return (
    <div className="rich-text-editor overflow-hidden rounded-lg border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-emerald-500">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="[&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[250px] [&_.ql-editor]:text-sm"
      />
    </div>
  );
}