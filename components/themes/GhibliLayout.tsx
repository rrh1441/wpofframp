// components/themes/GhibliLayout.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  mdxContent: string;
}

export function GhibliLayout({ mdxContent }: Props) {
  return (
    <div className="bg-sky-50 p-4 md:p-6 rounded-b-md">
      {/* Apply styles directly to elements */}
      <div className="markdown-ghibli">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
        >
          {mdxContent}
        </ReactMarkdown>
      </div>
      
      {/* Inline CSS for markdown content - guarantees styling will work */}
      <style jsx global>{`
        .markdown-ghibli h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: #1e3a8a;
          font-family: serif;
        }
        
        .markdown-ghibli h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #1e3a8a;
          font-family: serif;
        }
        
        .markdown-ghibli h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #1e3a8a;
          font-family: serif;
        }
        
        .markdown-ghibli p {
          margin-top: 1rem;
          margin-bottom: 1rem;
          line-height: 1.8;
          color: #334155;
        }
        
        .markdown-ghibli a {
          color: #2563eb;
          text-decoration: underline;
          text-decoration-style: wavy;
          text-decoration-color: #93c5fd;
        }
        
        .markdown-ghibli a:hover {
          color: #1d4ed8;
        }
        
        .markdown-ghibli img {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .markdown-ghibli ul, .markdown-ghibli ol {
          margin-top: 1rem;
          margin-bottom: 1rem;
          margin-left: 1.5rem;
          color: #334155;
        }
        
        .markdown-ghibli ul {
          list-style-type: disc;
        }
        
        .markdown-ghibli ol {
          list-style-type: decimal;
        }
        
        .markdown-ghibli li {
          margin-top: 0.375rem;
          margin-bottom: 0.375rem;
        }
        
        .markdown-ghibli blockquote {
          border-left: 4px solid #93c5fd;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #334155;
        }
        
        .markdown-ghibli pre {
          background-color: #f0f9ff;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 1px solid #bae6fd;
        }
        
        .markdown-ghibli code {
          background-color: #e0f2fe;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          color: #0369a1;
        }
        
        .markdown-ghibli em {
          font-style: italic;
          color: #475569;
        }
        
        .markdown-ghibli strong {
          font-weight: 700;
          color: #1e40af;
        }
        
        .markdown-ghibli hr {
          border: 0;
          border-top: 1px solid #bfdbfe;
          margin: 2rem 0;
        }
      `}</style>
    </div>
  );
}