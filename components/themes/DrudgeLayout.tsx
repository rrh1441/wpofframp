// components/themes/DrudgeLayout.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  mdxContent: string;
}

export function DrudgeLayout({ mdxContent }: Props) {
  // Apply base prose with max-w-none to prevent width constraints
  return (
    <div className="bg-white rounded-b-md p-4 md:p-6">
      <div className="prose prose-sm sm:prose max-w-none
        prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-2
        prose-p:my-2 prose-hr:my-3
        prose-a:text-blue-700 prose-a:underline hover:prose-a:text-blue-900">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Ensure headings requested in ALL CAPS by the LLM are rendered that way
            h1: ({ node, ...props }) => <h1 style={{ textTransform: 'uppercase' }} {...props} />,
            h2: ({ node, ...props }) => <h2 style={{ textTransform: 'uppercase' }} {...props} />,
            h3: ({ node, ...props }) => <h3 style={{ textTransform: 'uppercase' }} {...props} />,
            h4: ({ node, ...props }) => <h4 style={{ textTransform: 'uppercase' }} {...props} />,
            // Ensure links look like standard underlined links
            a: ({ node, ...props }) => <a className="underline" {...props} />,
          }}
        >
          {mdxContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}