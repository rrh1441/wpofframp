// components/themes/ModernLayout.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  mdxContent: string;
}

export function ModernLayout({ mdxContent }: Props) {
  // Add console log inside the component function
  console.log("MDX CONTENT (first 100 chars):", mdxContent?.substring(0, 100));
  console.log("MDX CONTENT LENGTH:", mdxContent?.length);
  
  return (
    <div className="bg-white rounded-b-md p-4 md:p-6">
      {/* Try direct HTML rendering instead of ReactMarkdown */}
      <div 
        className="prose prose-sm sm:prose max-w-none"
        dangerouslySetInnerHTML={{ __html: mdxContent }}
      />
    </div>
  );
}