---
layout: doc
title: Monorepo中的Typescript
editLink: false
---

# {{ $frontmatter.title }}

您可以通过两种方式之一在 monorepo 中使用 TypeScript —— 作为 Linter 或作为构建工具。

在本节中，我们将讨论 TypeScript 作为 Linter 的角色。

## 共享 `tsconfig.json`

我们可以通过一个聪明的解决方案在存储库中共享 TypeScript 配置文件。我们可以将基础 `tsconfig.json` 文件放在一个工作区中，并从应用程序中的 `tsconfig.json` 文件扩展它们(`extend`)。

让我们想象一下这样一个工作空间:

```
apps
├─ docs
│  ├─ package.json
│  ├─ tsconfig.json
├─ web
│  ├─ package.json
│  ├─ tsconfig.json
packages
├─ tsconfig
│  ├─ base.json
│  ├─ nextjs.json
│  ├─ package.json
│  ├─ react-library.json
```

### 我们的 `tsconfig` 包

在 `packages/tsconfig` 中，我们有几个 `json` 文件，它们表示您可能希望配置 TypeScript 的不同方式。它们都是这样的：

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Default",
  "compilerOptions": {
    "composite": false,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "inlineSources": false,
    "isolatedModules": true,
    "moduleResolution": "node",
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "preserveWatchOutput": true,
    "skipLibCheck": true,
    "strict": true
  },
  "exclude": ["node_modules"]
}
```

在 `package.json` 中，我们简单地将我们的包命名为:

```json
{
  "name": "tsconfig"
}
```

存储库中的其他 `json` 文件可以通过简单的导入访问:

```ts
import baseJson from 'tsconfig/base.json'
import nextjsJson from 'tsconfig/nextjs.json'
import reactLibraryJson from 'tsconfig/react-library.json'
```

这允许我们为不同类型的项目导出不同的配置设置。

### 如何使用 `tsconfig` 包

每个使用我们共享的 `tsconfig` 的 `app/package` 必须首先将其指定为依赖项:

::: code-group

```json [npm]
{
  "dependencies": {
    "tsconfig": "*"
  }
}
```

```json [yarn]
{
  "dependencies": {
    "tsconfig": "*"
  }
}
```

```json [pnpm]
{
  "dependencies": {
    "tsconfig": "workspace:*"
  }
}
```

:::

然后，他们可以在自己的 `tsconfig.json` 中扩展它:

```json
{
  // We extend it from here!
  "extends": "tsconfig/nextjs.json",

  // You can specify your own include/exclude
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

## 概要

默认情况下，当您使用 `npx create-turbo@latest` [创建一个新的 Monorepo](/getting-started/create-new) 时，此设置会附带。您还可以查看我们的[基本示例](https://github.com/vercel/turbo/tree/main/examples/basic)来查看工作版本。

## 运行任务

我们建议按照[基础部分](/handbook/linting)的设置进行操作。
