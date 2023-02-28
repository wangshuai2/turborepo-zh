---
layout: doc
title: 构建你的应用
editLink: false
---

# {{ $frontmatter.title }}

除非您的 monorepo 仅用于将包发布到 npm，否则它可能包含至少一个应用程序。使用 Turborepo 协调您的应用构建可以带来速度上的非凡提升。

## 构建设置

Turborepo 的工作原理是将工作区任务放在它们所属的位置——在每个工作区的 `package.json` 中。让我们想象一下，你有一个 monorepo，看起来像这样：

```plain
├── apps
│   └── web
│       └── package.json
├── package.json
└── turbo.json
```

你的 `apps/web/package.json` 应该在里面有一个 `build` 脚本：

::: code-group

```json [Next.js]
{
  "scripts": {
    "build": "next build"
  }
}
```

```json [Vite]
{
  "scripts": {
    "build": "vite build"
  }
}
```

:::

在 `turbo.json` 中，您可以向 pipeline 添加 `build`。

::: code-group

```json [Next.js]
{
  "pipeline": {
    "build": {
      "outputs": [".next/**"]
    }
  }
}
```

```json [Vite]
{
  "pipeline": {
    "build": {
      "outputs": ["dist/**"]
    }
  }
}
```

:::

我们配置 `outputs` ，以便能够启用缓存——这是 Turborepo 的一个极其强大的功能，可以跳过以前完成的任务。

这意味着从 root 运行 `turbo build` 将构建存储库中的所有应用程序。多亏了 Turborepo 的任务缓存，您可以以极快的构建时间结束。
