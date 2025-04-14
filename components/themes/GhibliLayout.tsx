// components/themes/GhibliLayout.tsx
"use client";

import React from "react";
import matter from "gray-matter";

interface Props {
  mdxContent: string;
}

export function GhibliLayout({ mdxContent }: Props) {
  const { content, data } = matter(mdxContent);
  console.log("Ghibli Layout metadata:", data);
  console.log("Ghibli Layout content length:", content.length);
  console.log("Ghibli Layout content first 100 chars:", content.substring(0, 100));

  return (
    <div className="bg-sky-50 p-4 md:p-6 rounded-b-md w-full">
      {/* Render metadata if available */}
      {data.title && (
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{data.title}</h1>
          {data.author && (
            <p className="text-sm">
              By <span className="font-medium">{data.author}</span>
            </p>
          )}
          {data.date && (
            <p className="text-sm">
              {new Date(data.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          {data.timeToRead && (
            <p className="text-xs text-gray-500">{data.timeToRead} min read</p>
          )}
        </div>
      )}

      <style jsx global>{`
        .ghibli-content {
          color: #334155;
          font-family: Georgia, serif;
          width: 100%;
          max-width: 100%;
        }
        .ghibli-content h1,
        .ghibli-content h2,
        .ghibli-content h3,
        .ghibli-content h4,
        .ghibli-content h5,
        .ghibli-content h6 {
          color: #1e3a8a;
          font-family: serif;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.2;
          width: 100%;
        }
        .ghibli-content p {
          color: #334155;
          margin: 1rem 0;
          line-height: 1.8;
          display: block;
          width: 100%;
        }
        .ghibli-content a {
          color: #2563eb;
          text-decoration-line: underline;
          text-decoration-style: wavy;
          text-decoration-color: #93c5fd;
        }
        .ghibli-content a:hover {
          color: #1d4ed8;
        }
        .ghibli-content img {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          display: block;
        }
        .ghibli-content ul,
        .ghibli-content ol {
          color: #334155;
          margin: 1rem 0 1rem 1.5rem;
          padding-left: 1rem;
          width: 100%;
        }
        .ghibli-content ul {
          list-style-type: disc;
        }
        .ghibli-content ol {
          list-style-type: decimal;
        }
        .ghibli-content li {
          margin: 0.375rem 0;
          color: #334155;
          display: list-item;
        }
        .ghibli-content blockquote {
          border-left: 4px solid #93c5fd;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #334155;
          width: 100%;
        }
        .ghibli-content code {
          background-color: #e0f2fe;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          color: #0369a1;
        }
        .ghibli-content pre {
          background-color: #f0f9ff;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 1px solid #bae6fd;
          width: 100%;
        }
        .ghibli-content em {
          font-style: italic;
          color: #475569;
        }
        .ghibli-content strong {
          font-weight: 700;
          color: #1e40af;
        }
        .ghibli-content br {
          display: block;
          content: "";
          margin-top: 0.5rem;
        }
      `}</style>

      <div
        className="prose prose-sm sm:prose max-w-none w-full ghibli-content"
        dangerouslySetInnerHTML={{
          __html: content
            .replace(
              /^# (.*$)/gm,
              '<h1 style="font-family: serif; color: #1e3a8a; font-weight: 700;">$1</h1>'
            )
            .replace(
              /^## (.*$)/gm,
              '<h2 style="font-family: serif; color: #1e3a8a; font-weight: 700;">$1</h2>'
            )
            .replace(
              /^### (.*$)/gm,
              '<h3 style="font-family: serif; color: #1e3a8a; font-weight: 700;">$1</h3>'
            )
            .replace(
              /!\[(.*?)\]\((.*?)\)/g,
              '<img src="$2" alt="$1" style="max-width: 100%; display: block; margin: 1.5rem 0; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);" />'
            )
            .replace(
              /\*\*(.*?)\*\*/g,
              '<strong style="font-weight: 700; color: #1e40af;">$1</strong>'
            )
            .replace(
              /\*(.*?)\*/g,
              '<em style="font-style: italic; color: #475569;">$1</em>'
            )
            .replace(
              /\[(.*?)\]\((.*?)\)/g,
              '<a href="$2" style="color: #2563eb; text-decoration-line: underline; text-decoration-style: wavy; text-decoration-color: #93c5fd;">$1</a>'
            )
            .replace(
              /^> (.*$)/gm,
              '<blockquote style="border-left: 4px solid #93c5fd; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #334155;">$1</blockquote>'
            )
            .replace(/(?:\r?\n){2,}(?!\s*[-*#>])/g, '</p><p style="color: #334155; margin: 1rem 0; line-height: 1.8;">')
            .replace(/^(.*)/, '<p style="color: #334155; margin: 1rem 0; line-height: 1.8;">$1</p>')
        }}
      />
    </div>
  );
}
