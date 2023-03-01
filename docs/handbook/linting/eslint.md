---
layout: doc
title: Monorepo中的ESLint
editLink: false
---

# {{ $frontmatter.title }}

## 共享配置

在多个工作区之间共享 `ESLint` 配置可以使所有工作区更加一致，从而大大提高工作效率。

让我们想象一个这样的 monorepo：

```
apps
├─ docs
│  ├─ package.json
│  └─ .eslintrc.js
└─ web
   ├─ package.json
   └─ .eslintrc.js
packages
└─ eslint-config-custom
   ├─ index.js
   └─ package.json
```

我们有一个名为 `eslint-config-custom` 的包，还有两个应用程序，每个应用程序都有自己的 `.eslintrc.js`。

### `eslint-config-custom` 包

我们的 `eslint-config-custom` 文件只包含一个单独的文件 `index.js`。是这个样子的：

```js
module.exports = {
  extends: ['next', 'turbo', 'prettier'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off'
  }
}
```

这是典型的 ESLint 配置，没什么花哨的。这个 `package.json` 看起来是这样的：

```json
{
  "name": "eslint-config-custom",
  "main": "index.js",
  "version": "1.0.0",
  "dependencies": {
    "eslint": "latest",
    "eslint-config-next": "latest",
    "eslint-config-prettier": "latest",
    "eslint-plugin-react": "latest",
    "eslint-config-turbo": "latest"
  }
}
```

这里有两点值得注意。首先，主字段指向 `index.js`。这允许文件轻松导入此配置。

其次，这里列出了 `ESLint` 依赖项。这个很有用 —— 这意味着我们不需要在导入 `eslint-config-custom` 的应用程序中重新指定依赖项。

### 如何使用 `eslint-config-custom` 包

在我们的 `web` 应用程序中，我们首先需要添加 `eslint-config-custom` 作为一个依赖项。

::: code-group

```json [npm]
{
  "dependencies": {
    "eslint-config-custom": "*"
  }
}
```

```json [yarn]
{
  "dependencies": {
    "eslint-config-custom": "*"
  }
}
```

```json [pnpm]
{
  "dependencies": {
    "eslint-config-custom": "workspace:*"
  }
}
```

:::

然后我们可以这样导入配置:

```js
// apps/web/.eslintrc.js
module.exports = {
  root: true,
  extends: ['custom']
}
```

通过将 `custom` 添加到 `extends` 数组中，我们告诉 `ESLint` 寻找一个名为 `eslint-config-custom` 的包，它会找到我们的工作区。

### 概要

默认情况下，当您使用 `npx create-turbo@latest` [创建一个新的 Monorepo](/getting-started/create-new) 时，此设置会附带。您还可以查看我们的[基本示例](https://github.com/vercel/turbo/tree/main/examples/basic)来查看工作版本。

## 设置 `lint` 任务

我们建议按照[基础部分](/handbook/linting)的设置进行操作。但要做一个修改，每个 `package.json` 脚本应该是这样的:

```json
// packages/*/package.json
{
  "scripts": {
    "lint": "eslint"
  }
}
```
