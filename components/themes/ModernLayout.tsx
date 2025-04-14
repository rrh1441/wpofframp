// components/themes/ModernLayout.tsx
import React from 'react';

interface Props {
  mdxContent: string;
}

export function ModernLayout({ mdxContent }: Props) {
  // Super aggressive frontmatter removal - handling all cases
  const contentWithoutFrontmatter = mdxContent
    .replace(/^```mdx\s*/m, '') // Remove starting ```mdx if present
    .replace(/\s*```$/m, '') // Remove ending ``` if present
    .replace(/^---[\s\S]*?---\s*/m, '') // Remove standard frontmatter between --- markers
    .replace(/^---\s*\n*---\s*/m, '') // Remove empty frontmatter (just dashes)
    .replace(/^\s*title:.*?featuredImage:.*?$/ms, '') // Remove any remaining frontmatter-like content
    .replace(/<userStyle>.*?<\/userStyle>/g, '') // Remove any userStyle tags
    .trim();
  
  console.log("Modern Layout content length:", contentWithoutFrontmatter.length);
  console.log("Modern Layout content first 100 chars:", contentWithoutFrontmatter.substring(0, 100));
  
  return (
    <div className="bg-white p-4 md:p-6 rounded-b-md w-full">
      {/* Add styling for modern theme */}
      <style jsx global>{`
        .modern-content {
          color: #475569;
          font-family: system-ui, -apple-system, sans-serif;
          width: 100%; 
          max-width: 100%;
        }
        
        .modern-content h1, 
        .modern-content h2, 
        .modern-content h3, 
        .modern-content h4,
        .modern-content h5, 
        .modern-content h6 {
          color: #334155;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.2;
          width: 100%;
        }
        
        .modern-content h1 {
          font-size: 2rem;
        }
        
        .modern-content h2 {
          font-size: 1.5rem;
        }
        
        .modern-content h3 {
          font-size: 1.25rem;
        }
        
        .modern-content p {
          color: #475569;
          margin: 1rem 0;
          line-height: 1.6;
          display: block;
          width: 100%;
        }
        
        .modern-content a {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }
        
        .modern-content a:hover {
          color: #1d4ed8;
        }
        
        .modern-content img {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          border-radius: 0.25rem;
          display: block;
        }
        
        .modern-content ul, 
        .modern-content ol {
          color: #475569;
          margin: 1rem 0 1rem 1.5rem;
          padding-left: 1rem;
          width: 100%;
        }
        
        .modern-content ul {
          list-style-type: disc;
        }
        
        .modern-content ol {
          list-style-type: decimal;
        }
        
        .modern-content li {
          margin: 0.25rem 0;
          color: #475569;
          display: list-item;
        }
        
        .modern-content blockquote {
          border-left: 4px solid #e2e8f0;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #64748b;
          width: 100%;
        }
        
        .modern-content code {
          background-color: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875rem;
        }
        
        .modern-content pre {
          background-color: #f8fafc;
          padding: 1rem;
          border-radius: 0.25rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 1px solid #e2e8f0;
          width: 100%;
        }
        
        .modern-content em {
          font-style: italic;
        }
        
        .modern-content strong {
          font-weight: 700;
          color: #334155;
        }
        
        /* Force line breaks */
        .modern-content br {
          display: block;
          content: "";
          margin-top: 0.5rem;
        }
      `}</style>
      
      {/* Create a direct HTML version */}
      <div 
        className="prose prose-sm sm:prose max-w-none w-full modern-content" 
        dangerouslySetInnerHTML={{ 
          __html: contentWithoutFrontmatter
            // Process markdown manually
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; display: block; margin: 1.5rem 0; border-radius: 0.25rem;" />')
            .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: #334155;">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: none; font-weight: 500;">$1</a>')
            // Handle blockquotes
            .replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #e2e8f0; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #64748b;">$1</blockquote>')
            // Handle paragraphs - looking for line breaks followed by blank lines
            .replace(/(?:\r?\n){2,}(?!\s*[-*#>])/g, '</p><p style="color: #475569; margin: 1rem 0; line-height: 1.6;">')
            // Wrap the whole thing in a paragraph
            .replace(/^(.*)/, '<p style="color: #475569; margin: 1rem 0; line-height: 1.6;">$1</p>')
          }}
      />
    </div>
  );
}