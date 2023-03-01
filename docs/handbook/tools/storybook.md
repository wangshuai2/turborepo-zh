---
layout: doc
title: Storybook
editLink: false
---

# {{ $frontmatter.title }}

`Storybook` 是在隔离环境中构建 UI 组件的流行方法。通过将 `Storybook` 放入 Turborepo，您可以轻松地开发与应用程序并行的设计系统。如果你更喜欢使用模板，本指南将介绍如何构建这个 [Storybook/Turborepo 模板](https://vercel.com/templates/react/turborepo-design-system)。

## 指南

本指南向您介绍如何：

1. 在 monorepo 设置 `Storybook`
2. 创建一个 story
3. 确保 `Storybook` 与您的其他任务一起工作

### 1. 创建 monorepo

如果你没有一个现有的项目，使用我们的[快速启动](/getting-started/create-new)创建一个新的 monorepo。

### 2. 添加一个新的 `workshop` 应用

Storybook 需要一个建设者使用，所以我们将创建一个 Vite app。

::: code-group

```bash [npm]
cd apps
npm create vite
```

```bash [yarn]
cd apps
yarn create vite
```

```bash [pnpm]
cd apps
pnpm create vite
```

:::

按照提示创建一个名为 `workshop` 的应用程序作为 React + TypeScript 的应用。

我们需要 Storybook 的脚手架:

::: code-group

```bash [npm]
cd workshop
npx sb init --skip-install
npm install --save-dev @storybook/cli # 手动安装deps和CLI
```

```bash [yarn]
cd workshop
npx storybook init
```

```bash [pnpm]
# 如果您使用的是pnpm，则需要在monorepo的根目录中添加.npmrc：
# auto-install-peers=true
# legacy-peer-deps=true
# node-linker=hoisted

# 然后，我们构建 Storybook 并手动安装其依赖项:
cd workshop
pnpx sb init --skip-install
pnpm install --save-dev @storybook/cli
```

:::

::: info
系统可能会提示您启用 `--legacy-peer-deps` 标志。Storybook 在 monorepo 中工作时需要此标志。
:::

### 3. 为 Button 组件设置 story

Storybook 支架在 `/src/stories` 目录中创建了一些 stories 和 React 组件。为了从 `ui` 包中为按钮创建一个 story，我们将用我们自己的导入替换 `Button.stories.tsx` 中的导入。

1. 更新 `ui` 包中的 `Button` 以匹配 story 的规范。

```tsx
// packages/ui/Button.tsx
interface Props {
  primary?: boolean
  size?: 'small' | 'large'
  label?: string
}

export const Button = ({ primary = false, label = 'Boop', size = 'small' }: Props) => {
  return (
    <button
      style={{
        backgroundColor: primary ? 'red' : 'blue',
        fontSize: size === 'large' ? '24px' : '14px'
      }}
    >
      {label}
    </button>
  )
}
```

2.  将您的 `ui` 包添加到 `workshop` 应用程序:

:::code-group

```json [npm]
// apps/workshop/package.json
{
  // ...
  {
    "dependencies": {
      "ui": "*",
      // ...
    }
  }
}
```

```json [yarn]
// apps/workshop/package.json
{
  // ...
  {
    "dependencies": {
      "ui": "*",
      // ...
    }
  }
}
```

```json [pnpm]
// apps/workshop/package.json
{
  // ...
  {
    "dependencies": {
      "ui": "workspace:*",
      // ...
    }
  }
}
```

:::

和 `pnpm install` 一次，以确保您的 `ui` 包安装在 `workshop` app 中。

3. 替换 `Button.stories.tsx` 中的按钮导入，以便它来自您的 `ui` 包：

```tsx
// apps/workshop/src/stories/Button.stories.tsx
import { Button } from 'ui'
```

### 4. 配置任务

最后一件事，我们需要做的是确保 Storybook 与您的其余任务是并列的：

```json
// apps/workshop/package.json
{
  // ...
  "scripts": {
    "dev": "start-storybook -p 6006",
    "build": "build-storybook"
  }
}
```

为了确保构建缓存，首先需要将 `storybook-static` 添加到 `.gitignore` 中。然后，将 `storybook-static` 添加到 `turbo.json` 构建任务的输出中:

```json
{
  "pipeline": {
    "build": {
      "outputs": [
        "dist/**",
        "storybook-static/**" // [!code ++]
      ]
    }
  }
}
```

您的 `dev` 和 `build` 任务现在将包括 `Storybook`，允许您与应用程序一起开发 Storybook，并与其他应用程序一起享受缓存构建。

## 配置 Vercel

让我们部署您的 Storybook 项目。

在 `Build and Development Settings` 中，将 `Output Directory` 更改为 `storybook-static`。

另外，在撰写本文时，`Storybook` 不能在 Node 18 上运行，Node 18 是 Vercel 的默认值。在 `workshop` 应用程序的 `package.json` 中，添加一个 `engines` 字段，以确保此项目在 Node 16 上运行:

```json
{
  // ...
  "engines": {
    "node": "16"
  }
}
```
