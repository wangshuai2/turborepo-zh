---
layout: doc
title: 在已有项目中使用
editLink: false
---

# {{ $frontmatter.title }}

Turborepo 可用于任何项目，以加快 `package.json` 中脚本的执行速度。

安装了 `turbo` 之后，您就可以从 `turbo` 中运行所有的 `package.json` 任务了。

通过正确配置 `turbo.json`，您将注意到缓存如何帮助您的任务运行得更快。

## 快速开始

**1.如果您还没有一个新的应用程序，那么创建一个新的应用程序:**
::: code-group

```bash [Next.js]
npx create-next-app@latest
```

```bash [Vite]
npm create vite@latest
```

:::

**2.全局安装 `turbo`**

::: code-group

```bash [npm]
npm install turbo --global
```

```bash [yarn]
yarn global add turbo
```

```bash [pnpm]
pnpm install turbo --global
```

:::

参考：[安装 Turborepo](/installing)

**3.添加 `turbo.json`**

关于 `turbo.json` 的配置信息，请参考：[配置文档](/reference/configuration)

::: code-group

```json [Next.js]
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "outputs": [".next/**"]
    },
    "lint": {}
  }
}
```

```json [Vite]
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "outputs": ["dist/**"]
    },
    "lint": {}
  }
}
```

:::

`package.json` 中，`vite` 的启动方式：

```json [package.json]
{
  "scripts": {
    "build": "tsc && vite build"
  }
}
```

我们建议将它们分割成一个 `lint` 和 `build` 脚本:

```json [package.json]
{
  "scripts": {
    "build": "vite build",
    "lint": "tsc"
  }
}
```

这意味着 `Turbo` 可以单独安排他们。

**4.编辑`.gitignore`**

将.`turbo` 添加到`.gitignore` 文件中。`Turbo CLI` 将此目录用于日志和某些任务输出。

```
+ .turbo
```

**5.使用 `turbo` 运行 `build` 和 `lint`**

```bash
turbo build lint
```

这将同时运行 `build` 和 `lint`。

你可以看见控制台的输出，像这样：

```terminal
 Tasks:    2 successful, 2 total
Cached:    2 cached, 2 total
  Time:    185ms >>> FULL TURBO
```

要了解这是如何实现的，请查看我们的[核心概念文档](/core-concepts/caching)。

**6.使用 `turbo` 运行 `dev`**

```bash
turbo dev
```

您会注意到您的开发脚本已经启动，您可以使用 `turbo` 来运行 `package.json` 中的任何脚本。
