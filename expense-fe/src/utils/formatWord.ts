export function formatWordContent(content: string): string {
  if (!content) return ''

  return content
    .replace(/\\n/g, '<br>')
    .replace(/\n/g, '<br>')
    .replace(/\r\n/g, '<br>')
    .replace(/\r/g, '<br>')
    .replace(/✅/g, '<span class="check-mark">✅</span>')
    .replace(/→/g, '<span class="arrow">→</span>')
    .replace(/(\w+\s*\/[^/]+\/)/g, '<span class="pronunciation">$1</span>')
    .replace(/(\(noun\)|\(verb\)|\(adjective\)|\(adverb\))/gi, '<span class="word-type">$1</span>')
}

export function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/"/g, '\\"')
}

export function extractFirstEnglishWord(text: string): string | null {
  const match = text.match(/[a-zA-Z]+/)
  return match ? match[0] : null
}

/** One-line preview: cut after first single \n; skip \n\n. */
export function toListPreview(content: string): string {
  if (!content) return ''

  // Normalize escaped \\n to real newlines for scanning
  const text = content.replace(/\\n/g, '\n')

  let i = 0
  while (i < text.length) {
    if (text[i] === '\n') {
      let j = i
      while (j < text.length && text[j] === '\n') j++
      const count = j - i

      // Single \n → cut here; \n\n (or more) → skip, don't cut
      if (count === 1) {
        return text
          .slice(0, i)
          .replace(/\s+/g, ' ')
          .trim()
      }
      i = j
      continue
    }
    i++
  }

  return text.replace(/\s+/g, ' ').trim()
}
