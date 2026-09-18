import { createContentLoader } from 'vitepress'

const INDEX_URLS = new Set([
  '/projects/',
  '/projects/index.html',
  '/skills/',
  '/skills/index.html',
  '/tools/',
  '/tools/index.html'
])

function categoryOf(url) {
  if (url.includes('/projects/')) return 'projects'
  if (url.includes('/skills/')) return 'skills'
  if (url.includes('/tools/')) return 'tools'
  return null
}

export default createContentLoader('{projects,skills,tools}/**/*.md', {
  transform(pages) {
    const buckets = {
      projects: [],
      skills: [],
      tools: []
    }

    for (const page of pages) {
      const category = categoryOf(page.url)
      if (!category || INDEX_URLS.has(page.url)) continue
      buckets[category].push({
        url: page.url,
        title: page.frontmatter.title || page.url,
        date: page.frontmatter.date || ''
      })
    }

    for (const key of Object.keys(buckets)) {
      buckets[key].sort((a, b) => String(b.date).localeCompare(String(a.date)))
    }

    return buckets
  }
})
