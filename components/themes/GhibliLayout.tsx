// components/themes/GhibliLayout.tsx
"use client";

import React from "react";
import matter from "gray-matter";

interface Props {
  mdxContent: string;
}

export function GhibliLayout({ mdxContent }: Props) {
  // Use our robust parsing instead of gray-matter directly
  const { content, data } = parseContentManually(mdxContent);
  
  console.log("Ghibli Layout metadata:", data);
  console.log("Ghibli Layout content length:", content.length);
  console.log("Ghibli Layout content first 100 chars:", content.substring(0, 100));

  // ============ CLEAN CONTENT ============
  // More aggressive cleaning to remove all frontmatter-like text
  const lines = content.split(/\r?\n/);
  const cleanedLines = lines.filter(line => {
    // Filter out any line that looks like frontmatter
    return !line.match(/^---\s*$/) && 
           !line.match(/^\s*title:\s+/) && 
           !line.match(/^\s*date:\s+/) && 
           !line.match(/^\s*author:\s+/) && 
           !line.match(/^\s*featuredImage:/i) &&
           !line.match(/^\s*featuredimage:/i);
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
    <div className="bg-gradient-to-b from-sky-100 to-blue-50 p-4 md:p-6 rounded-md w-full shadow-md border border-blue-100">
      {/* Render metadata if available */}
      {data.title && (
        <div className="mb-6 w-full text-center border-b border-blue-200 pb-4">
          <h1 className="text-3xl font-bold text-blue-800 mb-2 font-serif">{data.title}</h1>
          {data.author && (
            <p className="text-sm text-blue-600">
              By <span className="font-medium italic">{data.author}</span>
            </p>
          )}
          {data.date && (
            <p className="text-sm text-blue-500">
              {new Date(data.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          {data.timeToRead && (
            <p className="text-xs text-blue-400 mt-1">{data.timeToRead} min read</p>
          )}
        </div>
      )}

      {/* Display the featured image if available */}
      {featuredImage && (
        <div className="mb-8 flex justify-center">
          <img 
            src={featuredImage} 
            alt={data.title || "Featured image"} 
            className="max-w-full max-h-96 object-cover rounded-lg shadow-lg border-4 border-white"
          />
        </div>
      )}

      <style jsx global>{`
        .ghibli-content {
          color: #334155;
          font-family: 'Noto Serif', Georgia, serif;
          width: 100%;
          max-width: 100%;
          line-height: 1.8;
          font-size: 1.05rem;
        }
        .ghibli-content h1,
        .ghibli-content h2,
        .ghibli-content h3,
        .ghibli-content h4,
        .ghibli-content h5,
        .ghibli-content h6 {
          color: #1e3a8a;
          font-family: 'Noto Serif', serif;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.3;
          width: 100%;
          position: relative;
        }
        .ghibli-content h1::after,
        .ghibli-content h2::after {
          content: "";
          position: absolute;
          bottom: -0.5rem;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(to right, #93c5fd, transparent);
        }
        .ghibli-content p {
          color: #334155;
          margin: 1.2rem 0;
          line-height: 1.8;
          display: block;
          width: 100%;
        }
        .ghibli-content a {
          color: #2563eb;
          text-decoration-line: underline;
          text-decoration-style: wavy;
          text-decoration-color: #93c5fd;
          transition: all 0.3s ease;
        }
        .ghibli-content a:hover {
          color: #1d4ed8;
          text-decoration-color: #60a5fa;
        }
        .ghibli-content img {
          max-width: 100%;
          height: auto;
          margin: 2rem 0;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border: 4px solid white;
          display: block;
        }
        .ghibli-content ul,
        .ghibli-content ol {
          color: #334155;
          margin: 1.2rem 0 1.2rem 1.5rem;
          padding-left: 1rem;
          width: 100%;
        }
        .ghibli-content ul {
          list-style-type: disc;
        }
        .ghibli-content ol {
          list-style-type: decimal;
        }
        .ghibli-content li {
          margin: 0.5rem 0;
          color: #334155;
          display: list-item;
        }
        .ghibli-content blockquote {
          border-left: 4px solid #93c5fd;
          padding: 1rem 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #334155;
          width: 100%;
          background-color: rgba(224, 242, 254, 0.5);
          border-radius: 0 0.5rem 0.5rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .ghibli-content code {
          background-color: #e0f2fe;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          color: #0369a1;
          font-size: 0.9em;
        }
        .ghibli-content pre {
          background-color: #f0f9ff;
          padding: 1.5rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 2rem 0;
          border: 1px solid #bae6fd;
          width: 100%;
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
        }
        .ghibli-content em {
          font-style: italic;
          color: #475569;
        }
        .ghibli-content strong {
          font-weight: 700;
          color: #1e40af;
        }
        .ghibli-content br {
          display: block;
          content: "";
          margin-top: 0.5rem;
        }
        /* Ghibli-inspired decorative elements */
        .ghibli-content::before {
          content: "";
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z' fill='%2393c5fd' fill-opacity='0.2'/%3E%3C/svg%3E");
          position: absolute;
          top: 0;
          right: 0;
          width: 150px;
          height: 150px;
          opacity: 0.1;
          z-index: 0;
          pointer-events: none;
        }
      `}</style>

      <div
        className="prose prose-sm sm:prose max-w-none w-full ghibli-content"
        dangerouslySetInnerHTML={{
          __html: processedContent
            .replace(
              /^# (.*$)/gm,
              '<h1 style="color: #1e3a8a; font-family: \'Noto Serif\', serif; font-weight: 700; position: relative;">$1</h1>'
            )
            .replace(
              /^## (.*$)/gm,
              '<h2 style="color: #1e3a8a; font-family: \'Noto Serif\', serif; font-weight: 700; position: relative;">$1</h2>'
            )
            .replace(
              /^### (.*$)/gm,
              '<h3 style="color: #1e3a8a; font-family: \'Noto Serif\', serif; font-weight: 700;">$1</h3>'
            )
            // Improved image handling with better regex and more Ghibli-styled
            .replace(
              /!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/g,
              '<img src="$2" alt="$1" title="$3" style="max-width: 100%; height: auto; margin: 2rem auto; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); border: 4px solid white; display: block;" />'
            )
            .replace(
              /\*\*(.*?)\*\*/g,
              '<strong style="font-weight: 700; color: #1e40af;">$1</strong>'
            )
            .replace(
              /\*(.*?)\*/g,
              '<em style="font-style: italic; color: #475569;">$1</em>'
            )
            .replace(
              /\[(.*?)\]\((.*?)\)/g,
              '<a href="$2" style="color: #2563eb; text-decoration-line: underline; text-decoration-style: wavy; text-decoration-color: #93c5fd;">$1</a>'
            )
            .replace(
              /^> (.*$)/gm,
              '<blockquote style="border-left: 4px solid #93c5fd; padding: 1rem 1.5rem; margin: 2rem 0; font-style: italic; color: #334155; background-color: rgba(224, 242, 254, 0.5); border-radius: 0 0.5rem 0.5rem 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">$1</blockquote>'
            )
            .replace(
              /(?:\r?\n){2,}(?!\s*[-*#>])/g,
              '</p><p style="color: #334155; margin: 1.2rem 0; line-height: 1.8;">'
            )
            .replace(
              /^(.*)/,
              '<p style="color: #334155; margin: 1.2rem 0; line-height: 1.8;">$1</p>'
            )
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