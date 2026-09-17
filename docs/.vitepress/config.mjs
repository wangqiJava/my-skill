import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Skill 手记',
  description: '记录 Skill 的实际用法、使用心得与踩坑过程。',
  base: '/',
  cleanUrls: false,
  themeConfig: {
    nav: [
      { text: '使用心得', link: '/skills/' },
      { text: '踩坑记录', link: '/pitfalls/' },
      { text: '记录模板', link: '/templates/skill-note' },
      { text: '写作指南', link: '/guide/writing' }
    ],
    sidebar: [
      {
        text: '学习与实践',
        items: [
          { text: '使用心得', link: '/skills/' },
          { text: '踩坑记录', link: '/pitfalls/' }
        ]
      },
      {
        text: '开始记录',
        items: [
          { text: '心得记录模板', link: '/templates/skill-note' },
          { text: '写作指南', link: '/guide/writing' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/wangqiJava/my-skill' }
    ],
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            // 同时保留完整词串与中文分词，兼容浏览器端的默认查询分词。
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
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    footer: { message: '从一次实践开始，把经验留给下一次。' }
  }
})
