const ALLOWED_TAGS = new Set([
  'P',
  'BR',
  'STRONG',
  'B',
  'EM',
  'I',
  'U',
  'S',
  'UL',
  'OL',
  'LI',
  'H2',
  'H3',
  'BLOCKQUOTE',
  'A',
  'IMG',
])

const DROP_WITH_CONTENT_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH'])

export function normalizeArticleContentForEditor(content: string) {
  if (!content.trim()) {
    return '<p><br></p>'
  }

  if (/<[a-z][\s\S]*>/i.test(content)) {
    return sanitizeArticleContent(content)
  }

  return content
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

export function sanitizeArticleContent(content: string) {
  const document = new DOMParser().parseFromString(content, 'text/html')

  cleanNode(document.body)
  return document.body.innerHTML
}

export function articleContentToText(content: string) {
  const document = new DOMParser().parseFromString(sanitizeArticleContent(content), 'text/html')
  return (document.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

export function hasMeaningfulArticleContent(content: string) {
  const document = new DOMParser().parseFromString(sanitizeArticleContent(content), 'text/html')
  return Boolean(document.body.textContent?.trim()) || Boolean(document.body.querySelector('img'))
}

function cleanNode(parent: Node) {
  Array.from(parent.childNodes).forEach((node) => {
    if (node.nodeType === Node.COMMENT_NODE) {
      node.remove()
      return
    }

    if (!(node instanceof HTMLElement)) {
      return
    }

    if (DROP_WITH_CONTENT_TAGS.has(node.tagName)) {
      node.remove()
      return
    }

    if (!ALLOWED_TAGS.has(node.tagName)) {
      cleanNode(node)
      node.replaceWith(...Array.from(node.childNodes))
      return
    }

    cleanNode(node)
    cleanAttributes(node)
  })
}

function cleanAttributes(element: HTMLElement) {
  const href = element.tagName === 'A' ? element.getAttribute('href') : null
  const title = element.getAttribute('title')
  const src = element.tagName === 'IMG' ? element.getAttribute('src') : null
  const alt = element.tagName === 'IMG' ? element.getAttribute('alt') : null

  Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name))

  if (element.tagName === 'A' && href && isSafeLink(href)) {
    element.setAttribute('href', href)
    element.setAttribute('rel', 'nofollow noopener noreferrer')
    if (/^https?:/i.test(href)) {
      element.setAttribute('target', '_blank')
    }
  }

  if (element.tagName === 'IMG') {
    if (!src || !isSafeImageSource(src)) {
      element.remove()
      return
    }
    element.setAttribute('src', src)
    element.setAttribute('alt', alt ?? '')
  }

  if (title) {
    element.setAttribute('title', title)
  }
}

function isSafeLink(value: string) {
  return /^(https?:|mailto:|\/[^/]|#)/i.test(value)
}

function isSafeImageSource(value: string) {
  return /^https:\/\//i.test(value) || /^\/api\/files\/article-images\/[a-z0-9._-]+$/i.test(value)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
