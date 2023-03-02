module.exports = {
  title: 'Turborepo 中文文档',
  description: 'Turborepo中文文档，',
  lang: 'zh-CN',
  themeConfig: {
    smoothScroll: true,
    outline: 'deep',
    lastUpdatedText: '最后更新：',
    sidebar: [
      {
        text: '快速开始',
        link: '/'
      },
      {
        text: '安装Turborepo',
        link: '/installing'
      },
      {
        text: '开始使用',
        items: [
          {
            text: '在已有项目中使用',
            link: '/getting-started/add-to-project'
          },
          {
            text: '创建新的Monorepo',
            link: '/getting-started/create-new'
          },
          {
            text: '添加到现有Monorepo项目',
            link: '/getting-started/existing-monorepo'
          }
        ]
      },
      {
        text: '核心概念',
        items: [
          {
            text: '任务缓存',
            link: '/core-concepts/caching'
          },
          {
            text: '远端缓存',
            link: '/core-concepts/remote-caching'
          },
          {
            text: 'Monorepos',
            link: '/core-concepts/monorepos',
            items: [
              {
                text: '运行任务',
                link: '/core-concepts/monorepos/running-tasks'
              },
              {
                text: '筛选工作区',
                link: '/core-concepts/monorepos/filtering'
              },
              {
                text: '跳过任务',
                link: '/core-concepts/monorepos/skipping-tasks'
              },
              {
                text: '配置工作区',
                link: '/core-concepts/monorepos/configuring-workspaces'
              }
            ]
          }
        ]
      },
      {
        text: 'Monorepo手册',
        link: '/handbook',
        items: [
          {
            text: '什么是Monorepo？',
            link: '/handbook/what-is-a-monorepo'
          },
          {
            text: '包的安装',
            link: '/handbook/package-installation'
          },
          {
            text: '工作区',
            link: '/handbook/workspaces'
          },
          {
            text: '迁移到Monorepo',
            link: '/handbook/migrating-to-a-monorepo'
          },
          {
            text: '开发任务',
            link: '/handbook/dev'
          },
          {
            text: '构建',
            link: '/handbook/building-your-app'
          },
          {
            text: 'Docker中构建',
            link: '/handbook/deploying-with-docker'
          },
          {
            text: '使用环境变量',
            link: '/handbook/environment-variables'
          },
          {
            text: '代码共享',
            link: '/handbook/sharing-code',
            items: [
              {
                text: '内部包',
                link: '/handbook/sharing-code/internal-packages'
              }
            ]
          },
          {
            text: '使用Lint',
            link: '/handbook/linting',
            items: [
              {
                text: 'Typescrip',
                link: '/handbook/linting/typescript'
              },
              {
                text: 'Eslint',
                link: '/handbook/linting/eslint'
              }
            ]
          },
          {
            text: '使用测试(Testing)',
            link: '/handbook/testing'
          },
          {
            text: '包的发布',
            link: '/handbook/publishing-packages',
            items: [
              {
                text: '在Monorepo中构建',
                link: '/handbook/publishing-packages/bundling'
              },
              {
                text: '版本管理和包的发布',
                link: '/handbook/publishing-packages/versioning-and-publishing'
              }
            ]
          },
          {
            text: '故障排除',
            link: '/handbook/troubleshooting'
          },
          {
            text: '工具',
            items: [
              {
                text: '在Turborepo中使用Prisma',
                link: '/handbook/tools/prisma'
              },
              {
                text: '在Turborepo中使用Storybook',
                link: '/handbook/tools/storybook'
              }
            ]
          }
        ]
      },
      {
        text: '持续集成',
        link: '/ci',
        items: [
          {
            text: 'CircleCI',
            link: '/ci/circleci'
          },
          {
            text: 'GitHub Actions',
            link: '/ci/github-actions'
          },
          {
            text: 'GitLab CI',
            link: '/ci/gitlabci'
          },
          {
            text: 'Travis CI',
            link: '/ci/travisci'
          }
        ]
      },
      {
        text: 'API 参考',
        link: '/reference',
        items: [
          {
            text: '配置',
            link: '/reference/configuration'
          },
          {
            text: 'CLI',
            link: '/reference/command-line-reference'
          },
          {
            text: 'Codemods',
            link: '/reference/codemods'
          }
        ]
      }
    ]
  },
  lastUpdated: false,
  markdown: {
    lineNumbers: false
  }
}
