// components/themes/MatrixLayout.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  mdxContent: string;
}

export function MatrixLayout({ mdxContent }: Props) {
  return (
    <div className="bg-black rounded-b-md p-4 md:p-6">
      <div className="prose prose-sm sm:prose max-w-none
        prose-invert
        prose-headings:font-mono prose-headings:text-green-400
        prose-p:font-mono prose-p:text-green-300
        prose-a:text-green-500 prose-a:underline hover:prose-a:text-green-400
        prose-code:text-green-400 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-green-800
        prose-strong:text-green-300 prose-em:text-green-200
        prose-li:font-mono prose-li:text-green-300">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ node, ...props }) => <a className="font-mono underline" {...props} />
          }}
        >
          {mdxContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}