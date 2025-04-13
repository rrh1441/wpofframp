// components/themes/MatrixLayout.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  mdxContent: string;
}

export function MatrixLayout({ mdxContent }: Props) {
  // Apply base prose, then override specifics for Matrix theme
  // Use monospace font for the entire container
  return (
    <div className="font-mono prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none p-4 md:p-6 bg-black text-green-400 rounded-b-md
                   prose-headings:text-green-400 prose-p:text-green-400 prose-strong:text-green-300 prose-a:text-green-500 hover:prose-a:text-green-300
                   prose-blockquote:text-green-500 prose-code:text-green-300 prose-code:bg-gray-800 prose-code:p-1 prose-code:rounded
                   prose-pre:bg-gray-900 prose-pre:text-green-400 prose-hr:border-green-700"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
         // Code blocks should already be handled by prose styles with pre:bg-gray-900 etc.
         // Inline code also has basic styling from prose-code:text-green-300 etc.
         // No major component overrides needed unless further customization is desired.
      >
        {mdxContent}
      </ReactMarkdown>
    </div>
  );
}