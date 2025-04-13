// components/themes/ModernLayout.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  mdxContent: string;
}

export function ModernLayout({ mdxContent }: Props) {
  // Basic prose styling - relies heavily on @tailwindcss/typography defaults
  return (
    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none p-4 md:p-6 bg-white rounded-b-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {mdxContent}
      </ReactMarkdown>
    </div>
  );
}