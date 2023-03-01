---
layout: doc
title: 版本管理和发布
editLink: false
---

# {{ $frontmatter.title }}

在 monorepo 中手动进行版本控制和发布包可能非常令人厌烦。幸运的是，有一个工具可以让事情变得简单—— [Changesets](https://github.com/changesets/changesets) CLI。

我们推荐 `Changesets`，因为它使用起来很直观，而且就像 Turborepo 一样 —— 适合您已经习惯的 monorepo 工具。

一些替代方案是：

- [intuit/auto](https://github.com/intuit/auto) 根据拉取请求的语义版本标签生成发布
- [microsoft/beachball](https://github.com/microsoft/beachball) 最阳光的语义版本缓冲器

## 了解 Changesets

我们建议查看 Changesets 文档。以下是我们推荐的阅读顺序：

1. [Why use changesets?](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md) - 基本知识
2. [Installation instructions](https://github.com/changesets/changesets/blob/main/packages/cli/README.md)
3. 如果您正在使用 GitHub，可以考虑使用 [Changeset GitHub bot](https://github.com/apps/changeset-bot) —— 一个推动您向 PR 添加 changesets 的 bot。
4. 您还应该考虑添加 [Changesets GitHub action](https://github.com/changesets/action) —— 这是一个让发布变得非常容易的工具。

## 与 Turborepo 一起使用 Changesets

一旦您开始使用 Changesets，您将获得三个有用的命令:

```bash
# 添加新的changeset
changeset

# 创建新版本的软件包
changeset version

# 将所有更改的包发布到npm
changeset publish
```

将您的发布流链接到 Turborepo 可以使部署的组织变得更加简单和快速。

我们的建议是在根 `package.json` 中添加一个 `publish-packages` 脚本:

```json
{
  "scripts": {
    // 包括构建、lint、测试——所有你需要运行的东西
    // 发布前
    "publish-packages": "turbo run build lint test && changeset version && changeset publish"
  }
}
```

::: warning
我们建议使用 `publish-packages` ，这样它就不会与 npm 的内置发布脚本发生冲突。
:::

这意味着当您运行 `publish-packages` 时，您的 Monorepo 就会被构建、校验、测试和发布，并且您将从 Turborepo 的所有加速中获益。
