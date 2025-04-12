// lib/constants.ts
export const SESSION_COOKIE_NAME = 'wp_offramp_migrated';

// Define theme details - adjust descriptions or add more specific details if needed
export const THEMES = {
  clarity: {
    name: 'Clarity',
    description:
      'Minimalist design with focus on readability. Perfect for blogs and personal sites.',
    prompt: `
Theme: Clarity

- Focus on clean typography and whitespace.
- Standard Markdown elements (headings, paragraphs, lists, links).
- Use blockquotes (>) for quotes.
- Minimal decoration. Ensure excellent readability.
- Images should be standard Markdown images: ![alt text](url)
`,
  },
  momentum: {
    name: 'Momentum',
    description:
      'Bold and dynamic with vibrant accents. Ideal for businesses and startups.',
    prompt: `
Theme: Momentum

- Use strong headings (##, ###).
- Emphasize key phrases with **bold text**.
- Use horizontal rules (<hr />) sparingly for separation.
- Create distinct sections.
- Images are important: ![alt text](url)
`,
  },
  serenity: {
    name: 'Serenity',
    description:
      'Elegant and calm with soft color palette. Great for portfolios and creative work.',
    prompt: `
Theme: Serenity

- Softer visual tone. Use italics (*) for emphasis sometimes.
- Use blockquotes (>) for highlighting passages or quotes.
- Generous spacing between paragraphs.
- Images should flow with text: ![alt text](url)
`,
  },
  drudge: {
    name: 'Drudge Report',
    description: 'Retro news feed style with emphasis on headlines.',
    prompt: `
Theme: Drudge Report

- ALL CAPS for main headlines (# ).
- Use ALL CAPS for subheadings (##, ###).
- Underline links using raw HTML: <a href="..." target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">LINK TEXT</a>. Avoid standard Markdown links.
- Prefer text over images. If an image is essential, use standard Markdown: ![alt text](url).
- Use <hr /> frequently to separate items or sections.
- Mimic a simple, dense news feed structure. Keep paragraphs short.
`,
  },
  ghibli: {
    name: 'Ghibli Journal',
    description: 'Whimsical and soft, like a journal entry.',
    prompt: `
Theme: Ghibli Journal

- Soft visual tone. Use gentle headings (##, ###).
- Use Markdown blockquotes (>) for notes or asides (like a <Callout>).
- Center essential images using Markdown syntax: ![alt text](url). If centering is critical and Markdown doesn't suffice, use <div style="text-align: center;"><img src="..." alt="..."></div>. Prefer Markdown where possible.
- Use thematic breaks (<hr />) styled as subtle dividers, or suggest spacing via Markdown paragraphs. Let Tailwind handle visual spacing like <div class="my-8" /> in the template itself.
- Focus on narrative flow.
`,
  },
  matrix: {
    name: 'Matrix Feed',
    description: 'Monospaced, code-focused, minimal decoration.',
    prompt: `
Theme: Matrix Feed

- Use primarily standard Markdown, but wrap technical terms, commands, or code snippets in backticks (\`like this\`).
- Use fenced code blocks (\`\`\`language\ncode\n\`\`\`) for larger code examples.
- Headings (#, ##) should be simple and direct.
- Avoid decorative elements like blockquotes or horizontal rules unless structurally necessary.
- Focus on clear information hierarchy and structure, not visual flair. Links should be standard Markdown [text](url).
`,
  },
} as const; // Use 'as const' for stricter typing

export type ThemeKey = keyof typeof THEMES;

export function isValidTheme(theme: string): theme is ThemeKey {
  return theme in THEMES;
}