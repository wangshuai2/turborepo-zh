---
layout: doc
title: Monorepo手册
editLink: false
---

# {{ $frontmatter.title }}

## 什么是 Monorepo

Monorepo 是一个代码库中许多不同应用程序和包的集合。

另一种设置称为 `polyrepo-multiple` 代码库，它们分别发布和版本化。

## 共享代码

### `polyrepo`

在 `polyrepo` 设置中，在应用程序之间共享代码的过程相对较长。

假设您有三个独立的存储库：`app`、 `docs` 和 `share-utils`。`app` 和 `docs` 都依赖于 `share-utils`，它作为一个包在 npm 上发布。

假设 `share-utils` 中的一个 bug 正在 `app` 和 `docs` 中引发一个关键问题，那么您需要:

- 在 `share-utils` 中提交修复错误；
- 在 `share-utils` 中运行发布任务，将其发布到 `npm`；
- 在 `app` 中提交 `share-utils` 依赖关系的版本；
- 在 `docs` 中提交 `share-utils` 依赖的版本；
- `app` 和 `docs` 现在可以部署了；

依赖于 `share-utils` 的应用程序越多，这个过程就需要越长的时间。

### `monorepo`

在 monorepo 设置中，`share-utils` 与 `app` 和 `docs` 在同一个代码库中。这使得整个过程非常简单:

- 在 `share-utils` 中提交修复错误;
- `app` 和 `docs` 现在可以部署了。

不需要版本控制，因为 `app` 和 `docs` 不依赖于 `npm` 中的 `share-utils` 的版本 —— 它们依赖于代码库中的版本。

这使得创建单次提交成为可能，可以同时修复多个应用程序和包中的 bug。这对于团队来说是一个巨大的速度提升。

## monorepos 是如何工作的？

工作空间是这个项目的主要组成部分。您构建的每个应用程序和包都将在其自己的工作区中，并带有自己的 `package.json`。正如您将从我们的指南中学到的，工作空间可以相互依赖，这意味着您的 `docs` 工作空间可以依赖于 `share-utils`:

::: code-group

```json [npm]
// apps/docs/package.json
{
  "dependencies": {
    "shared-utils": "*"
  }
}
```

```json [yarn]
// apps/docs/package.json
{
  "dependencies": {
    "shared-utils": "*"
  }
}
```

```json [pnpm]
// apps/docs/package.json
{
  "dependencies": {
    "shared-utils": "workspace:*"
  }
}
```

:::

工作区由 [安装依赖项](/handbook/package-installation) 的相同 CLI 管理。

### 根工作区

您的代码库的根文件夹中还有一个根工作区—— `package.json`。这是一个有用的地方:

- 指定整个 monorepo 中存在的依赖项;
- 添加在整个 monorepo 上运行的任务，而不仅仅是单个工作区;
- 添加关于如何使用 monorepo 的文档。
