// components/themes/ModernLayout.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  mdxContent: string;
}

export function ModernLayout({ mdxContent }: Props) {
  return (
    <div className="bg-white rounded-b-md p-4 md:p-6">
      <div className="prose prose-sm sm:prose max-w-none
        prose-headings:font-semibold prose-headings:text-slate-700
        prose-p:text-slate-600 prose-p:my-3
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-800">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ node, ...props }) => <a className="font-medium" {...props} />,
          }}
        >
          {mdxContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}