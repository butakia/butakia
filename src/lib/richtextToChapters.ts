const TARGET_CHARS_PER_PAGE = 2200;

// Splits Tiptap-generated HTML into top-level block elements without cutting inside a tag,
// then packs blocks into pages under a target character budget so no block is ever split mid-element.
function splitIntoBlocks(html: string): string[] {
  const blockRegex = /<(h[1-6]|p|blockquote|ul|ol|table|img)[\s\S]*?(?:<\/\1>|\/>)/gi;
  const blocks = html.match(blockRegex);
  return blocks && blocks.length ? blocks : [html];
}

export function chunkRichTextIntoChapters(html: string): { order: number; content: string }[] {
  const blocks = splitIntoBlocks(html);
  const chapters: { order: number; content: string }[] = [];
  let current = "";

  for (const block of blocks) {
    if (current.length + block.length > TARGET_CHARS_PER_PAGE && current) {
      chapters.push({ order: chapters.length, content: current });
      current = block;
    } else {
      current += block;
    }
  }
  if (current) chapters.push({ order: chapters.length, content: current });
  return chapters.length ? chapters : [{ order: 0, content: html }];
}
