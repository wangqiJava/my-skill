import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: '拾墨手记',
  description: '记录工作项目里的 Skill 用法、可复用 Skill 和 AI 工具。',
  base: '/',
  cleanUrls: false,
  appearance: 'dark',
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-light'
    }
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.1.0/lxgwwenkai-regular.css'
    }],
    ['link', {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600&display=swap'
    }]
  ],
  themeConfig: {
    siteTitle: '拾墨手记',
    nav: [
      { text: '工作项目', link: '/projects/' },
      { text: 'Skill 记录', link: '/skills/' },
      { text: '工具', link: '/tools/' }
    ],
    sidebar: [
      {
        text: '工作项目',
        items: [
          { text: '目录', link: '/projects/' },
          { text: '冲融', link: '/projects/chongrong' }
        ]
      },
      {
        text: 'Skill 记录',
        items: [
          { text: '目录', link: '/skills/' },
          { text: 'grill-me', link: '/skills/grill-me' }
        ]
      },
      {
        text: 'AI 工具',
        items: [
          { text: '目录', link: '/tools/' }
        ]
      },
      {
        text: '说明',
        items: [
          { text: '写作指南', link: '/guide/writing' },
          { text: '记录模板', link: '/templates/skill-note' }
        ]
      }
    ],
    socialLinks: [],
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            tokenize: (text) => Array.from(new Set([
              ...text.split(/[\s\p{P}]+/u),
              ...Array.from(
                new Intl.Segmenter('zh-CN', { granularity: 'word' }).segment(text)
              ).filter((part) => part.isWordLike).map((part) => part.segment)
            ])).filter(Boolean)
          }
        },
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索笔记', buttonAriaLabel: '搜索笔记' },
              modal: {
                displayDetails: '显示详细列表',
                resetButtonTitle: '清除搜索',
                backButtonTitle: '关闭搜索',
                noResultsText: '没有找到相关笔记',
                footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
              }
            }
          }
        }
      }
    },
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '阴阳',
    lightModeSwitchTitle: '切到阳面（浅色）',
    darkModeSwitchTitle: '切到阴面（深色）',
    footer: { message: '用过再记下，下次能找回来。' }
  }
})
