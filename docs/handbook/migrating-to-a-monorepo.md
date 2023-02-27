---
layout: doc
title: 迁移到 Monorepo
editLink: false
---

# {{ $frontmatter.title }}

从多库设置迁移到单库设置可以为生产力带来巨大的好处，特别是如果：

- 你发现很难在应用程序之间共享代码
- 你想要一个统一的方法来解决你的代码构建

## 文件夹结构

让我们想象一下你的多重回购设置是这样的：

```plain
web (repo 1)
├─ package.json
docs (repo 2)
├─ package.json
app (repo 3)
├─ package.json
```

你有三个仓库，`web`，`docs `和 `app`，它们没有任何共享的依赖关系，但是您已经注意到它们之间有许多重复的代码。

最好的办法在 monorepo 将组织他们:

```plain
my-monorepo
├─ apps
│  ├─ app
│  │  └─ package.json
│  ├─ docs
│  │  └─ package.json
│  └─ web
│     └─ package.json
└─ package.json
```

要开始共享代码，可以使用[内部包模式](/handbook/sharing-code/internal-packages)，生成一个新的包文件夹:

```plain
my-monorepo
├─ apps
│  ├─ app
│  │  └─ package.json
│  ├─ docs
│  │  └─ package.json
│  └─ web
│     └─ package.json
├─ packages
│  └─ shared
│     └─ package.json
└─ package.json
```

::: info
如果你打算转移到 monorepo，尝试勾勒出确切的文件夹结构才是你的目标。
:::

## 设置工作空间

一旦您的应用程序处于正确的文件夹结构中，您需要设置工作区并安装依赖项。我们关于[设置工作区](/handbook/workspaces)的部分应该会有所帮助。

## 处理任务

现在您的工作区已经设置好了，您需要弄清楚如何在新的 monorepo 中运行您的任务。我们有几个部分:

- [如何使用 Turborepo 配置任务](/core-concepts/monorepos/running-tasks)
- [如何设置开发任务](/handbook/dev)
- [如何设置 Lint](/handbook/linting)
- [如何构建应用程序](/handbook/building-your-app)
- [如何设置测试](/handbook/testing)
