// components/themes/DrudgeLayout.tsx
import React from 'react';

interface Props {
  mdxContent: string;
}

export function DrudgeLayout({ mdxContent }: Props) {
  // Super aggressive frontmatter removal - handling all cases
  const contentWithoutFrontmatter = mdxContent
    .replace(/^```mdx\s*/m, '') // Remove starting ```mdx if present
    .replace(/\s*```$/m, '') // Remove ending ``` if present
    .replace(/^---[\s\S]*?---\s*/m, '') // Remove standard frontmatter between --- markers
    .replace(/^---\s*\n*---\s*/m, '') // Remove empty frontmatter (just dashes)
    .replace(/^\s*title:.*?featuredImage:.*?$/ms, '') // Remove any remaining frontmatter-like content
    .replace(/<userStyle>.*?<\/userStyle>/g, '') // Remove any userStyle tags
    .trim();
  
  console.log("Drudge Layout content length:", contentWithoutFrontmatter.length);
  console.log("Drudge Layout content first 100 chars:", contentWithoutFrontmatter.substring(0, 100));
  
  return (
    <div className="bg-white p-4 md:p-6 rounded-b-md w-full">
      {/* Add styling for drudge theme */}
      <style jsx global>{`
        .drudge-content {
          color: #111;
          font-family: "Times New Roman", Times, serif;
          width: 100%; 
          max-width: 100%;
        }
        
        .drudge-content h1, 
        .drudge-content h2, 
        .drudge-content h3, 
        .drudge-content h4,
        .drudge-content h5, 
        .drudge-content h6 {
          color: #000;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.2;
          text-transform: uppercase;
          width: 100%;
        }
        
        .drudge-content h1 {
          font-size: 2rem;
        }
        
        .drudge-content h2 {
          font-size: 1.5rem;
        }
        
        .drudge-content h3 {
          font-size: 1.25rem;
        }
        
        .drudge-content p {
          color: #111;
          margin: 1rem 0;
          line-height: 1.5;
          display: block;
          width: 100%;
        }
        
        .drudge-content a {
          color: #1d4ed8;
          text-decoration: underline;
        }
        
        .drudge-content a:hover {
          color: #1e3a8a;
        }
        
        .drudge-content img {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          display: block;
        }
        
        .drudge-content ul, 
        .drudge-content ol {
          color: #111;
          margin: 1rem 0 1rem 1.5rem;
          padding-left: 1rem;
          width: 100%;
        }
        
        .drudge-content ul {
          list-style-type: disc;
        }
        
        .drudge-content ol {
          list-style-type: decimal;
        }
        
        .drudge-content li {
          margin: 0.25rem 0;
          color: #111;
          display: list-item;
        }
        
        .drudge-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          width: 100%;
        }
        
        .drudge-content code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
        
        .drudge-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.25rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          width: 100%;
        }
        
        .drudge-content em {
          font-style: italic;
        }
        
        .drudge-content strong {
          font-weight: 700;
        }
        
        /* Force line breaks */
        .drudge-content br {
          display: block;
          content: "";
          margin-top: 0.5rem;
        }
      `}</style>
      
      {/* Create a direct HTML version */}
      <div 
        className="prose prose-sm sm:prose max-w-none w-full drudge-content" 
        dangerouslySetInnerHTML={{ 
          __html: contentWithoutFrontmatter
            // Process markdown manually
            .replace(/^# (.*$)/gm, '<h1 style="text-transform: uppercase; font-weight: 700;">$1</h1>')
            .replace(/^## (.*$)/gm, '<h2 style="text-transform: uppercase; font-weight: 700;">$1</h2>')
            .replace(/^### (.*$)/gm, '<h3 style="text-transform: uppercase; font-weight: 700;">$1</h3>')
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; display: block; margin: 1.5rem 0;" />')
            .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700;">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #1d4ed8; text-decoration: underline;">$1</a>')
            // Handle blockquotes
            .replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #e5e7eb; padding-left: 1rem; margin: 1.5rem 0; font-style: italic;">$1</blockquote>')
            // Handle paragraphs - looking for line breaks followed by blank lines
            .replace(/(?:\r?\n){2,}(?!\s*[-*#>])/g, '</p><p style="color: #111; margin: 1rem 0; line-height: 1.5;">')
            // Wrap the whole thing in a paragraph
            .replace(/^(.*)/, '<p style="color: #111; margin: 1rem 0; line-height: 1.5;">$1</p>')
          }}
      />
    </div>
  );
}