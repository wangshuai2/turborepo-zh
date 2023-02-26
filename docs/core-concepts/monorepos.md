---
layout: doc
title: Monorepos中使用Turborepo
editLink: false
---

# {{ $frontmatter.title }}

## 问题

![](https://qiniucdn2.wangdashuai.top/web-components-note/why-turborepo-problem.webp)

Monorepos 有许多优势，但它们难以扩大规模。每个工作区都有自己的测试套件、自己的连接和自己的构建过程。单个 monorepo 可能有数百个任务要执行。

## 解决方案

![](https://qiniucdn2.wangdashuai.top/web-components-note/why-turborepo-solution.webp)

Turborepo 解决了 Monorepo 的结垢问题。我们的远程缓存存储您所有任务的结果，这意味着您的 CI 永远不需要做同样的工作两次。

任务调度可能是困难的，在一个单一的。想象 `yarn build` 需要运行前 `yarn test` ，在所有的工作空间。Turborepo 可以调度您的任务，以最大的速度，在所有可用的核心。

可以逐步采用 Turborepo。它使用已经编写的 `package.json` 脚本、已经声明的依赖项和一个 `turbo.json` 文件。您可以使用它与任何包管理器，如 `npm`，`yarn`或 `pnpm`。你可以在几分钟内把它添加到任何 monorepo 中。

## Turborepo 不能做什么

Turborepo 不处理软件包安装。像 `npm`、 `pnpm` 或 `yarn` 这样的工具已经能够很好地做到这一点。但是它们运行任务的效率低下，这意味着 CI 构建缓慢。

我们建议 Turborepo 运行您的任务，使用您最喜欢的包管理器安装您的包。
