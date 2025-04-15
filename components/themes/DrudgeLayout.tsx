// components/themes/DrudgeLayout.tsx
"use client";

import React from "react";
// Import matter but don't use it directly for parsing
import matter from "gray-matter";

interface Props {
  mdxContent: string;
}

export function DrudgeLayout({ mdxContent }: Props) {
  // ============ FULLY MANUAL PARSING ============
  // Skip gray-matter entirely to avoid YAML exceptions
  const { content, data } = parseContentManually(mdxContent);
  
  console.log("Drudge Layout metadata:", data);
  console.log("Drudge Layout content length:", content.length);
  console.log("Drudge Layout content first 100 chars:", content.substring(0, 100));

  // ============ CLEAN CONTENT ============
  // More aggressive cleaning to remove all frontmatter-like text
  const lines = content.split(/\r?\n/);
  const cleanedLines = lines.filter(line => {
    // Filter out any line that looks like frontmatter
    return !line.match(/^---\s*/) && // Lines starting with ---
           !line.match(/^\s*title:/) && // Lines with title:
           !line.match(/^\s*date:/) && // Lines with date:
           !line.match(/^\s*author:/) && // Lines with author:
           !line.match(/^\s*featuredImage:/i) && // Lines with featuredImage:
           !line.match(/^\s*featuredimage:/i); // Lines with featuredimage: (lowercase)
  });
  let cleanedContent = cleanedLines.join('\n');

  // ============ REMOVE FIRST HEADING ============
  // Split content into lines, remove the first heading, then join back
  const headingLines = cleanedContent.split(/\r?\n/);
  let foundHeading = false;
  const filteredLines = headingLines.filter(line => {
    // Only remove the first H1 heading (starts with single #)
    if (!foundHeading && line.match(/^#\s+/)) {
      foundHeading = true;
      return false; // Skip this line (the heading)
    }
    return true; // Keep all other lines
  });
  const processedContent = filteredLines.join('\n');

  // Extract featured image from metadata if available
  const featuredImage = data.featuredImage || data.featuredimage || '';

  return (
    <div className="bg-white p-4 md:p-6 rounded-b-md w-full">
      {/* Render metadata if available */}
      {data.title && (
        <div className="mb-4">
          <h1 className="text-2xl font-bold uppercase">{data.title}</h1>
          {data.author && (
            <p className="text-sm">
              By <span className="font-medium">{data.author}</span>
            </p>
          )}
          {data.date && (
            <p className="text-sm">
              {new Date(data.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          {data.timeToRead && (
            <p className="text-xs text-gray-500">{data.timeToRead} min read</p>
          )}
        </div>
      )}

      {/* Display the featured image if available */}
      {featuredImage && (
        <div className="mb-6">
          <img 
            src={featuredImage} 
            alt={data.title || "Featured image"} 
            className="w-full max-h-96 object-cover rounded-md"
          />
        </div>
      )}

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
        .drudge-content br {
          display: block;
          content: "";
          margin-top: 0.5rem;
        }
      `}</style>

      <div
        className="prose prose-sm sm:prose max-w-none w-full drudge-content"
        dangerouslySetInnerHTML={{
          __html: processedContent
            .replace(/^## (.*$)/gm, '<h2 style="text-transform: uppercase; font-weight: 700;">$1</h2>')
            .replace(/^### (.*$)/gm, '<h3 style="text-transform: uppercase; font-weight: 700;">$1</h3>')
            // Improved image handling with better regex
            .replace(
              /!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/g,
              '<img src="$2" alt="$1" title="$3" style="max-width: 100%; display: block; margin: 1.5rem 0;" />'
            )
            .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700;">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
            .replace(
              /\[(.*?)\]\((.*?)\)/g,
              '<a href="$2" style="color: #1d4ed8; text-decoration: underline;">$1</a>'
            )
            .replace(
              /^> (.*$)/gm,
              '<blockquote style="border-left: 4px solid #e5e7eb; padding-left: 1rem; margin: 1.5rem 0; font-style: italic;">$1</blockquote>'
            )
            .replace(
              /(?:\r?\n){2,}(?!\s*[-*#>])/g,
              '</p><p style="color: #111; margin: 1rem 0; line-height: 1.5;">'
            )
            .replace(
              /^(.*)/,
              '<p style="color: #111; margin: 1rem 0; line-height: 1.5;">$1</p>'
            ),
        }}
      />
    </div>
  );
}

/**
 * Parse content manually without relying on gray-matter
 * This avoids any YAML parsing errors completely
 */
function parseContentManually(mdxContent: string): { content: string; data: Record<string, any> } {
  // Check if the content has frontmatter delimiters
  const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = mdxContent.match(frontmatterPattern);
  
  if (!match) {
    // No frontmatter found, look for a title in the first heading
    const titleMatch = mdxContent.match(/^#\s+(.*?)(\r?\n|$)/);
    return {
      content: mdxContent,
      data: titleMatch ? { title: titleMatch[1] } : {}
    };
  }
  
  // Extract frontmatter and content
  const frontmatterText = match[1];
  const contentText = match[2];
  
  // Parse frontmatter using a custom approach
  const data: Record<string, any> = {};
  
  // Split the frontmatter into lines first
  // If it's all on one line, we'll handle that specially
  if (!frontmatterText.includes('\n')) {
    // The frontmatter is all on one line - split by properties
    const props = frontmatterText.split(/\s+(?=\w+:)/);
    
    props.forEach(prop => {
      // For each property, extract the key and value
      const keyValueMatch = prop.match(/^(\w+):\s*(?:"([^"]*)"|'([^']*)'|([^"\s].*?)(?:\s+#.*)?$)/);
      if (keyValueMatch) {
        const key = keyValueMatch[1];
        // Use the first non-undefined value
        const value = keyValueMatch[2] || keyValueMatch[3] || keyValueMatch[4];
        if (key && value !== undefined) {
          // Remove any trailing markdown headings from the value
          const cleanValue = value.replace(/\s+#\s+.*$/, '').trim();
          data[key] = cleanValue;
        }
      }
    });
  } else {
    // Regular multi-line frontmatter
    frontmatterText.split(/\r?\n/).forEach(line => {
      // For each line, extract the key and value if it's a proper key-value pair
      const keyValueMatch = line.match(/^(\w+):\s*(?:"([^"]*)"|'([^']*)'|([^"\s].*))/);
      if (keyValueMatch) {
        const key = keyValueMatch[1];
        // Use the first non-undefined value
        const value = keyValueMatch[2] || keyValueMatch[3] || keyValueMatch[4];
        if (key && value !== undefined) {
          data[key] = value.trim();
        }
      }
    });
  }
  
  // If we have an empty object, try to find a title in the first heading
  if (Object.keys(data).length === 0) {
    const titleMatch = contentText.match(/^#\s+(.*?)(\r?\n|$)/);
    if (titleMatch) {
      data.title = titleMatch[1];
    }
  }
  
  // Apply a better strategy to remove frontmatter from content
  const cleanedContent = contentText.split(/\r?\n/).filter(line => {
    // Keep all lines EXCEPT those that look like frontmatter
    return !line.match(/^---\s*$/) && 
           !line.match(/^\s*title:\s+/) && 
           !line.match(/^\s*date:\s+/) && 
           !line.match(/^\s*author:\s+/) && 
           !line.match(/^\s*featuredImage:/i) &&
           !line.match(/^\s*featuredimage:/i);
  }).join('\n');
  
  return { content: cleanedContent, data };
}