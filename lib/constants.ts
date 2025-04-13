// lib/constants.ts
export const SESSION_COOKIE_NAME = 'wp_offramp_migrated';

// Define theme details - Use 'modern' key instead of 'clarity'
export const THEMES = {
  modern: { // Renamed from clarity
    name: 'Modern',
    description:
      'Clean, minimalist design with focus on readability. Perfect for most blogs and articles.',
    prompt: `
Theme: Modern (Clarity)

- Focus on clean typography and whitespace using standard Markdown.
- Use standard Markdown elements (headings #/##/###, paragraphs, lists, links [text](url), **bold**, *italic*).
- Use blockquotes (>) for standard quotes.
- Ensure excellent readability with default prose styling.
- Images should be standard Markdown images: ![alt text](url)
`,
  },
  drudge: {
    name: 'Drudge', // Keep description simple if name is descriptive
    description: 'Retro news feed style with emphasis on headlines.',
    prompt: `
Theme: Drudge Report

- Output main headlines (# H1) and subheadlines (## H2, ### H3) in ALL CAPS directly in the text.
- Use standard Markdown paragraphs for body text. Keep paragraphs relatively short.
- Convert ALL HTML links (<a> tags) to standard Markdown links: [LINK TEXT](URL). Do NOT use raw HTML for links.
- Prefer text over images. If an image is essential, use standard Markdown: ![alt text](URL).
- Use standard Markdown horizontal rules (---) frequently to separate logical items or sections.
- Mimic a simple, dense news feed structure.
`,
  },
  matrix: {
    name: 'Matrix',
    description: 'Monospaced, code-focused, minimal decoration.',
    prompt: `
Theme: Matrix Feed

- Use primarily standard Markdown for text, headings, lists, links.
- Wrap technical terms, commands, or code snippets in inline backticks (\`like this\`).
- Use fenced code blocks (\`\`\`language\ncode\n\`\`\`) for larger code examples. Ensure the language identifier is present if discernible, otherwise use \`\`\`text or just \`\`\`.
- Headings (#, ##) should be simple and direct standard Markdown.
- Avoid decorative elements like blockquotes or horizontal rules unless structurally necessary for separating distinct code/text blocks.
- Focus on clear information hierarchy and structure. Standard Markdown links [text](url).
`,
  },
  ghibli: {
    name: 'Ghibli', // Keep description simple if name is descriptive
    description: 'Whimsical and soft, like a journal entry.',
    prompt: `
Theme: Ghibli Journal

- Soft visual tone. Use gentle headings (## H2, ### H3). Standard Markdown for emphasis (*italic*, **bold**).
- Use standard Markdown blockquotes (>) extensively for notes, asides, or highlighted text passages that should look like callouts.
- Ensure generous spacing between paragraphs (standard Markdown paragraph breaks).
- Images should be standard Markdown: ![alt text](URL).
- Use thematic breaks (---) sparingly, styled as subtle dividers.
- Focus on narrative flow.
`,
  },
} as const;

export type ThemeKey = keyof typeof THEMES;

export function isValidTheme(theme: string): theme is ThemeKey {
  return theme in THEMES;
}