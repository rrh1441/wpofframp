// components/themes/DrudgeLayout.tsx
import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  mdxContent: string;
}

export function DrudgeLayout({ mdxContent }: Props) {
  // Add useEffect to log debugging info to the terminal
  useEffect(() => {
    console.log("[DEBUG] DrudgeLayout rendering with MDX content");
    console.log("[DEBUG] MDX Content first 100 chars:", mdxContent.substring(0, 100));
    console.log("[DEBUG] MDX Content length:", mdxContent.length);
    
    // Check if content appears to be valid markdown
    const hasHeadings = mdxContent.includes('#');
    const hasLinks = mdxContent.includes('](');
    console.log("[DEBUG] Content appears to be markdown:", { hasHeadings, hasLinks });
    
    // Analyze ReactMarkdown child structure
    setTimeout(() => {
      try {
        const container = document.querySelector('.prose-container');
        if (container) {
          console.log("[DEBUG] Found prose container");
          console.log("[DEBUG] Number of child elements:", container.childNodes.length);
          console.log("[DEBUG] First child node type:", container.childNodes[0]?.nodeName);
          console.log("[DEBUG] Classes on container:", container.className);
          
          // Get computed styles
          const computedStyle = window.getComputedStyle(container);
          console.log("[DEBUG] Container computed styles:", {
            color: computedStyle.color,
            fontSize: computedStyle.fontSize,
            fontFamily: computedStyle.fontFamily,
          });
          
          // Check if tailwind-typography styles are applied
          const firstHeading = document.querySelector('.prose-container h1, .prose-container h2');
          if (firstHeading) {
            const headingStyle = window.getComputedStyle(firstHeading);
            console.log("[DEBUG] First heading computed styles:", {
              fontSize: headingStyle.fontSize,
              fontWeight: headingStyle.fontWeight,
              color: headingStyle.color,
            });
          } else {
            console.log("[DEBUG] No headings found in rendered content");
          }
        } else {
          console.log("[DEBUG] Could not find prose container");
        }
      } catch (error) {
        console.error("[DEBUG] Error inspecting DOM:", error);
      }
    }, 500); // Small delay to ensure rendering is complete
  }, [mdxContent]);

  return (
    <div className="bg-white rounded-b-md p-4 md:p-6">
      {/* Debug info for structure */}
      {console.log("[DEBUG] Rendering structure - mdxContent", { 
        contentLength: mdxContent?.length,
        contentStart: mdxContent?.substring(0, 30)
      })}
      
      <div className="prose prose-sm sm:prose max-w-none prose-container
        prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-2
        prose-p:my-2 prose-hr:my-3
        prose-a:text-blue-700 prose-a:underline hover:prose-a:text-blue-900">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => {
              console.log("[DEBUG] Rendering h1 element", props);
              return <h1 style={{ textTransform: 'uppercase' }} {...props} />;
            },
            h2: ({ node, ...props }) => <h2 style={{ textTransform: 'uppercase' }} {...props} />,
            h3: ({ node, ...props }) => <h3 style={{ textTransform: 'uppercase' }} {...props} />,
            h4: ({ node, ...props }) => <h4 style={{ textTransform: 'uppercase' }} {...props} />,
            p: ({ node, ...props }) => {
              console.log("[DEBUG] Rendering p element", props);
              return <p {...props} />;
            },
            a: ({ node, ...props }) => <a className="underline" {...props} />,
          }}
        >
          {mdxContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}