// components/themes/MatrixLayout.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  mdxContent: string;
}

export function MatrixLayout({ mdxContent }: Props) {
  return (
    <div className="bg-black p-4 md:p-6 rounded-b-md">
      {/* Apply styles directly to elements */}
      <div className="markdown-matrix">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
        >
          {mdxContent}
        </ReactMarkdown>
      </div>
      
      {/* Inline CSS for markdown content - guarantees styling will work */}
      <style jsx global>{`
        .markdown-matrix {
          font-family: monospace;
          color: #4ade80;
        }
        
        .markdown-matrix h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: #4ade80;
          font-family: monospace;
        }
        
        .markdown-matrix h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #4ade80;
          font-family: monospace;
        }
        
        .markdown-matrix h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #4ade80;
          font-family: monospace;
        }
        
        .markdown-matrix p {
          margin-top: 1rem;
          margin-bottom: 1rem;
          line-height: 1.6;
          color: #86efac;
          font-family: monospace;
        }
        
        .markdown-matrix a {
          color: #22c55e;
          text-decoration: underline;
          font-family: monospace;
        }
        
        .markdown-matrix a:hover {
          color: #16a34a;
        }
        
        .markdown-matrix img {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          border: 1px solid #166534;
        }
        
        .markdown-matrix ul, .markdown-matrix ol {
          margin-top: 1rem;
          margin-bottom: 1rem;
          margin-left: 1.5rem;
          color: #86efac;
          font-family: monospace;
        }
        
        .markdown-matrix ul {
          list-style-type: disc;
        }
        
        .markdown-matrix ol {
          list-style-type: decimal;
        }
        
        .markdown-matrix li {
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
          font-family: monospace;
        }
        
        .markdown-matrix blockquote {
          border-left: 4px solid #166534;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #86efac;
          font-family: monospace;
        }
        
        .markdown-matrix pre {
          background-color: #111;
          padding: 1rem;
          border-radius: 0.25rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 1px solid #166534;
          font-family: monospace;
        }
        
        .markdown-matrix code {
          background-color: #111;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          color: #4ade80;
        }
        
        .markdown-matrix em {
          font-style: italic;
          color: #bbf7d0;
          font-family: monospace;
        }
        
        .markdown-matrix strong {
          font-weight: 700;
          color: #86efac;
          font-family: monospace;
        }
        
        .markdown-matrix hr {
          border: 0;
          border-top: 1px solid #166534;
          margin: 2rem 0;
        }
      `}</style>
    </div>
  );
}