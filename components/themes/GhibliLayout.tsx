// components/themes/GhibliLayout.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  mdxContent: string;
}

export function GhibliLayout({ mdxContent }: Props) {
  return (
    <div className="bg-sky-50 rounded-b-md p-4 md:p-6">
      <div className="prose prose-sm sm:prose max-w-none
        prose-headings:font-serif prose-headings:text-blue-900
        prose-p:text-slate-700 prose-p:leading-relaxed 
        prose-a:text-blue-600 prose-a:decoration-wavy hover:prose-a:text-blue-800
        prose-blockquote:border-l-blue-300 prose-blockquote:text-slate-700 prose-blockquote:italic
        prose-img:rounded-lg prose-img:shadow-md">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => <h1 className="font-serif text-blue-900" {...props} />,
            p: ({ node, ...props }) => <p className="leading-relaxed" {...props} />
          }}
        >
          {mdxContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}