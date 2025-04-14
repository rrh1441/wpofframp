// components/themes/MatrixLayout.tsx
import React from 'react';

interface Props {
  mdxContent: string;
}

export function MatrixLayout({ mdxContent }: Props) {
  // Super aggressive frontmatter removal - handling all cases
  const contentWithoutFrontmatter = mdxContent
    .replace(/^```mdx\s*/m, '') // Remove starting ```mdx if present
    .replace(/\s*```$/m, '') // Remove ending ``` if present
    .replace(/^---[\s\S]*?---\s*/m, '') // Remove standard frontmatter between --- markers
    .replace(/^---\s*\n*---\s*/m, '') // Remove empty frontmatter (just dashes)
    .replace(/^\s*title:.*?featuredImage:.*?$/ms, '') // Remove any remaining frontmatter-like content
    .replace(/<userStyle>.*?<\/userStyle>/g, '') // Remove any userStyle tags
    .trim();
  
  console.log("Matrix Layout content length:", contentWithoutFrontmatter.length);
  console.log("Matrix Layout content first 100 chars:", contentWithoutFrontmatter.substring(0, 100));
  
  return (
    <div className="bg-black p-4 md:p-6 rounded-b-md w-full">
      {/* Add styling for matrix theme */}
      <style jsx global>{`
        .matrix-content {
          color: #86efac;
          font-family: monospace;
          width: 100%; 
          max-width: 100%;
        }
        
        .matrix-content h1, 
        .matrix-content h2, 
        .matrix-content h3, 
        .matrix-content h4,
        .matrix-content h5, 
        .matrix-content h6 {
          color: #4ade80;
          font-family: monospace;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.2;
          width: 100%;
        }
        
        .matrix-content h1 {
          font-size: 2rem;
        }
        
        .matrix-content h2 {
          font-size: 1.5rem;
        }
        
        .matrix-content h3 {
          font-size: 1.25rem;
        }
        
        .matrix-content p {
          color: #86efac;
          margin: 1rem 0;
          line-height: 1.6;
          display: block;
          width: 100%;
          font-family: monospace;
        }
        
        .matrix-content a {
          color: #22c55e;
          text-decoration: underline;
          font-family: monospace;
        }
        
        .matrix-content a:hover {
          color: #16a34a;
        }
        
        .matrix-content img {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          border: 1px solid #166534;
          display: block;
        }
        
        .matrix-content ul, 
        .matrix-content ol {
          color: #86efac;
          margin: 1rem 0 1rem 1.5rem;
          padding-left: 1rem;
          width: 100%;
          font-family: monospace;
        }
        
        .matrix-content ul {
          list-style-type: disc;
        }
        
        .matrix-content ol {
          list-style-type: decimal;
        }
        
        .matrix-content li {
          margin: 0.25rem 0;
          color: #86efac;
          display: list-item;
          font-family: monospace;
        }
        
        .matrix-content blockquote {
          border-left: 4px solid #166534;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #86efac;
          width: 100%;
          font-family: monospace;
        }
        
        .matrix-content code {
          background-color: #111;
          color: #4ade80;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
        
        .matrix-content pre {
          background-color: #111;
          padding: 1rem;
          border-radius: 0.25rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 1px solid #166534;
          width: 100%;
          font-family: monospace;
        }
        
        .matrix-content em {
          font-style: italic;
          color: #bbf7d0;
          font-family: monospace;
        }
        
        .matrix-content strong {
          font-weight: 700;
          color: #86efac;
          font-family: monospace;
        }
        
        /* Force line breaks */
        .matrix-content br {
          display: block;
          content: "";
          margin-top: 0.5rem;
        }
      `}</style>
      
      {/* Create a direct HTML version */}
      <div 
        className="prose prose-invert max-w-none w-full matrix-content" 
        dangerouslySetInnerHTML={{ 
          __html: contentWithoutFrontmatter
            // Process markdown manually
            .replace(/^# (.*$)/gm, '<h1 style="color: #4ade80; font-family: monospace; font-weight: 700;">$1</h1>')
            .replace(/^## (.*$)/gm, '<h2 style="color: #4ade80; font-family: monospace; font-weight: 700;">$1</h2>')
            .replace(/^### (.*$)/gm, '<h3 style="color: #4ade80; font-family: monospace; font-weight: 700;">$1</h3>')
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; display: block; margin: 1.5rem 0; border: 1px solid #166534;" />')
            .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: #86efac; font-family: monospace;">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #bbf7d0; font-family: monospace;">$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #22c55e; text-decoration: underline; font-family: monospace;">$1</a>')
            // Handle blockquotes
            .replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #166534; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #86efac; font-family: monospace;">$1</blockquote>')
            // Handle paragraphs - looking for line breaks followed by blank lines
            .replace(/(?:\r?\n){2,}(?!\s*[-*#>])/g, '</p><p style="color: #86efac; margin: 1rem 0; line-height: 1.6; font-family: monospace;">')
            // Wrap the whole thing in a paragraph
            .replace(/^(.*)/, '<p style="color: #86efac; margin: 1rem 0; line-height: 1.6; font-family: monospace;">$1</p>')
          }}
      />
    </div>
  );
}