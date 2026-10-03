// Builds highlight segments for rendering the email body with suspicious
// words marked (SPEC.md Result screen: "the email body with highlighted
// suspicious words"). Pure/testable; the actual <mark> rendering happens
// in components/EmailPreview.tsx.

import { findPressureKeywordMatches } from "./checks/pressure-language";

export interface TextSegment {
  text: string;
  highlighted: boolean;
}

export function buildHighlightSegments(text: string): TextSegment[] {
  const matches = findPressureKeywordMatches(text);
  if (matches.length === 0) return [{ text, highlighted: false }];

  // Merge overlapping/adjacent keyword matches into flat [start, end) spans.
  const spans = matches
    .map((m) => [m.index, m.index + m.keyword.length] as [number, number])
    .sort((a, b) => a[0] - b[0]);

  const merged: [number, number][] = [];
  for (const [start, end] of spans) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }

  const segments: TextSegment[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) segments.push({ text: text.slice(cursor, start), highlighted: false });
    segments.push({ text: text.slice(start, end), highlighted: true });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), highlighted: false });

  return segments;
}
