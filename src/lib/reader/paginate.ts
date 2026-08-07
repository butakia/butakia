export interface TextPage {
  content: string;
  offsetBase: number;
}

/**
 * Estimates how many characters fit in one flip-book page for the given
 * typography settings, so each page can be shown without internal scrolling
 * (a real page-flip effect needs a fixed page size — no nested scroll area
 * to fight the drag gesture over).
 */
export function estimateCharsPerPage({
  pageWidth,
  pageHeight,
  fontSize,
  lineHeight,
  hasTitle,
}: {
  pageWidth: number;
  pageHeight: number;
  fontSize: number;
  lineHeight: number;
  hasTitle: boolean;
}): number {
  const horizontalPadding = 48; // p-6 on both sides
  const verticalPadding = 48;
  const titleHeight = hasTitle ? 40 : 0;
  const safetyMargin = 24;

  const contentWidth = Math.max(120, pageWidth - horizontalPadding);
  const contentHeight = Math.max(80, pageHeight - verticalPadding - titleHeight - safetyMargin);

  const avgCharWidth = fontSize * 0.52;
  const lineHeightPx = fontSize * lineHeight;

  const charsPerLine = Math.max(10, Math.floor(contentWidth / avgCharWidth));
  const linesPerPage = Math.max(3, Math.floor(contentHeight / lineHeightPx));

  return Math.max(120, Math.floor(charsPerLine * linesPerPage * 0.92));
}

/**
 * Splits plain text into pages of roughly `charsPerPage` characters each,
 * snapping breaks to paragraph boundaries when reasonably close, otherwise
 * to the nearest whitespace so words are never cut mid-way.
 */
export function paginateText(content: string, charsPerPage: number): TextPage[] {
  if (content.length <= charsPerPage) {
    return [{ content, offsetBase: 0 }];
  }

  const pages: TextPage[] = [];
  let cursor = 0;

  while (cursor < content.length) {
    const remaining = content.length - cursor;
    if (remaining <= charsPerPage) {
      pages.push({ content: content.slice(cursor), offsetBase: cursor });
      break;
    }

    const idealEnd = cursor + charsPerPage;
    let breakAt = -1;

    const paragraphBreak = content.lastIndexOf("\n\n", idealEnd);
    if (paragraphBreak > cursor + charsPerPage * 0.5) {
      breakAt = paragraphBreak + 2;
    }

    if (breakAt === -1) {
      const spaceBreak = content.lastIndexOf(" ", idealEnd);
      breakAt = spaceBreak > cursor ? spaceBreak + 1 : idealEnd;
    }

    pages.push({ content: content.slice(cursor, breakAt), offsetBase: cursor });
    cursor = breakAt;
  }

  return pages;
}

/**
 * Splits `content` into pages that are guaranteed to fit, by actually
 * rendering candidate slices through the caller-supplied `fits` check and
 * looking for overflow, instead of guessing from a character-count formula.
 * The formula-based `paginateText` above can't account for real font
 * metrics/kerning per device, which was leaving pages with stray overflow
 * lines or premature empty pages — measuring the exact box the reader shows
 * (which `fits` is responsible for setting up) is what actually fixes that.
 *
 * `fits(text, isFirstOfChapter)` renders `text` into that box (reserving
 * room for a title when `isFirstOfChapter` is true) and reports whether it
 * overflowed.
 */
export function paginateByMeasurement(
  content: string,
  fits: (text: string, isFirstOfChapter: boolean) => boolean,
  approxCharsPerPage: number
): TextPage[] {
  const total = content.length;
  if (total === 0) return [{ content: "", offsetBase: 0 }];

  const pages: TextPage[] = [];
  let cursor = 0;
  let isFirst = true;

  while (cursor < total) {
    if (fits(content.slice(cursor), isFirst)) {
      pages.push({ content: content.slice(cursor), offsetBase: cursor });
      break;
    }

    // Find an upper bound that overflows, growing from the heuristic guess.
    let hi = Math.min(total, cursor + Math.max(20, approxCharsPerPage));
    while (hi < total && fits(content.slice(cursor, hi), isFirst)) {
      hi = Math.min(total, hi + Math.max(20, approxCharsPerPage));
    }
    let lo = cursor;

    // Binary search the longest slice (in [lo, hi]) that still fits.
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (fits(content.slice(cursor, mid), isFirst)) lo = mid;
      else hi = mid;
    }

    let breakAt = Math.max(cursor + 1, lo);

    // Snap the break to a word boundary so text never splits mid-word — `lo` is already
    // the exact max-capacity cut point from the binary search above, so this only backs
    // up as far as the nearest preceding space, which loses at most a partial word.
    // A paragraph break is preferred only when it's right there anyway (>85% of the way
    // to capacity) — snapping to one much earlier (the old 40% threshold) was throwing
    // away up to half a page's worth of room whenever a paragraph happened to break in
    // that range, which is exactly why some pages looked barely-filled and others full.
    const slice = content.slice(cursor, breakAt);
    const paragraphBreak = slice.lastIndexOf("\n\n");
    const spaceBreak = slice.lastIndexOf(" ");
    if (paragraphBreak > slice.length * 0.85) {
      breakAt = cursor + paragraphBreak + 2;
    } else if (spaceBreak > 0) {
      breakAt = cursor + spaceBreak + 1;
    }

    pages.push({ content: content.slice(cursor, breakAt), offsetBase: cursor });
    cursor = breakAt;
    isFirst = false;
  }

  return pages;
}
