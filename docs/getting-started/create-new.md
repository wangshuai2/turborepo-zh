---
layout: doc
title: 创建新的Monorepo
editLink: false
---

# {{ $frontmatter.title }}

::: info
本指南使用 `turbo` 的全局安装。按照[安装指南](/installing)进行安装。或者，您可以使用包管理器在下面的命令中运行本地安装的 `turbo`。
:::

## 快速开始

要创建一个新的 `monorepo`，使用 [`create-turbo`](https://www.npmjs.com/package/create-turbo) 的 `npm` 包:

```bash
npx create-turbo@latest
```

您还可以克隆一个 `Turborepo` 启动资源库，参考： [Turborepo examples directory on GitHub](https://github.com/vercel/turbo/tree/main/examples)

## 完整教程

本教程将引导您使用 `Turborepo` [基本示例](https://github.com/vercel/turbo/tree/main/examples/basic)。最后，你会对使用 `turbo` 感到自信，并且知道所有的基本功能。

::: info
在本教程中，代码示例中省略了一些代码行。例如，在显示 `package.json` 时，我们不会显示所有的键——只显示那些重要的键。
:::

## 1、运行 `create-turbo`

首先，运行：

```bash
npx create-turbo@latest
```

这将安装 `create-turbo` CLI 并运行它，您可能会有疑问：

**您喜欢在哪里创建您的 turborepo 项目？**

默认是 `./my-turborepo`，您可以选择任意目录。

**使用哪一个包管理器？**

Turborepo 不处理安装软件包，所以你需要选择:

- [npm](https://www.npmjs.com/)
- [pnpm](https://pnpm.io/)
- [yarn](https://yarnpkg.com/)

如果您不确定，我们建议您选择 `pnpm`。如果还没有安装，那么取消 `create-turbo` (通过 `ctrl-C`)并查看 [安装说明](/installing)。

### 安装

一旦您选择了一个包管理器，`create-turbo` 将在您选择的文件夹名称中创建一系列新文件。默认情况下，它还将安装基本示例附带的所有依赖项。

## 2、探索您的新 repo

你可能在 Terminal 里注意到了什么。`create-turbo` 给你描述了它添加的所有东西。

```
>>> Creating a new turborepo with the following:
 - apps/web: Next.js with TypeScript
 - apps/docs: Next.js with TypeScript
 - packages/ui: Shared React component library
 - packages/eslint-config-custom: Shared configuration (ESLint)
 - packages/tsconfig: Shared TypeScript `tsconfig.json`
```

每个文件夹都是一个工作区`workspace`——一个包含 `package.json` 的文件夹。每个工作区都可以声明自己的依赖项，运行自己的脚本，并导出代码供其他工作区使用。

在您最喜欢的代码编辑器中打开根文件夹- `./my-turborepo`。

### 了解 `packages/ui`

首先，打开 `./package/ui/package.json`，您会注意到包的名称是 `name: ui`。

接下来，打开 `./apps/web/package.json`，您会注意到这个包的名称是 `name: web`。还有，看看它的依赖关系。

你会看到 `web` 依赖于一个名为 `ui` 的包:

```json
// apps/web/package.json
{
  "dependencies": {
    "ui": "workspace:*"
  }
}
```

这意味着我们的 `web` 应用程序依赖于我们的本地 `ui` 包。

如果查看 `apps/docs/package.json` 内部，也会看到同样的情况。`web` 和 `docs` 都依赖 `ui` —— 一个共享的组件库。

这种跨应用程序共享代码的模式在 monorepos 中非常普遍，这意味着多个应用程序可以共享一个设计系统。

### 了解导入和导出

查看 `./apps/docs/pages/index.tsx`，`docs` 和 `web` 都是 `Next.js` 应用程序，它们都以类似的方式使用 `ui` 库:

```tsx
import { Button } from 'ui'

export default function Docs() {
  return (
    <div>
      <h1>Docs</h1>
      <Button />
    </div>
  )
}
```

他们直接从一个名为 `ui` 的依赖项导入 `Button`! 这是如何工作的? `Button` 是从哪里来的？

打开 `packages/ui/package.json`，你会注意到这两个属性:

```json
// packages/ui/package.json
{
  "main": "./index.tsx",
  "types": "./index.tsx"
}
```

当工作区从 `ui` 导入时，`main` 告诉它们在哪里访问它们导入的代码。`types` 告诉它们 `TypeScript` 类型的位置。

那么，让我们看看 `packages/ui/index.tsx` :

```tsx
// packages/ui/index.tsx
import * as React from 'react'

export * from './Button'
```

这个文件中的所有内容都可以被依赖 `ui` 的工作区使用。

`index.tsx` 正在从一个名为 `./Button` 的文件中导出所有内容，因此让我们看看这里:

```tsx
// packages/ui/Button.tsx
import * as React from 'react'

export const Button = () => {
  return <button>Boop</button>
}
```

我们已经找到了我们的按钮! 我们在这个文件中所做的任何更改将在 `web` 和 `docs` 中共享。非常酷！
::: tip
尝试从这个文件导出一个不同的函数。也许可以 `add(a，b)` 将两个数相加。

这可以通过 `web` 和 `docs` 导入。
:::

### 了解 `tsconfig`

我们还有两个工作区要查看，`tsconfig` 和 `eslint-config-custom`。它们中的每一个都允许在 monorepo 中共享配置。让我们看看 `tsconfig`:

```json
// packages/tsconfig/package.json
{
  "name": "tsconfig",
  "files": ["base.json", "nextjs.json", "react-library.json"]
}
```

这里，在 `files` 中，我们指定了三个要导出的文件。依赖 `tsconfig` 的包可以直接导入它们。

例如，`packages/ui` 取决于 `tsconfig`:

```json
// packages/ui/package.json
{
  "devDependencies": {
    "tsconfig": "workspace:*"
  }
}
```

在它的 `tsconfig.json` 文件中，使用扩展的方式导入它:

```json
// packages/ui/tsconfig.json
{
  "extends": "tsconfig/react-library.json"
}
```

此模式允许 monorepo 在其所有工作区中共享一个 `tsconfig.json`，从而减少代码重复。

### 了解 `eslint-config-custom`

我们的最终工作区是 `eslint-config-custom`。

您会注意到，这个名称与其他工作区的名称略有不同。它没有 `ui` 或 `tsconfig` 那么简洁。我们进去看看，在 monorepo 的 root 中找到 `eslintrc.js`，以找出原因。

```js
// .eslintrc.js
module.exports = {
  // This tells ESLint to load the config from the workspace `eslint-config-custom`
  // 这告诉 ESLint 从工作区 “eslint-config-custom” 加载配置
  extends: ['custom']
}
```

`ESLint` 通过查找名为 `eslint-config-\*` 的工作区来解析配置文件。这使我们可以编写: `extends: ['custom']` 并让 `ESLint` 找到我们的本地工作区。

但为什么会出现在 monorepo 的 root 目录呢？

ESLint 查找其配置文件的方法是查看最近的配置文件。`eslintrc.js` 如果在工作目录中找不到，它就会查看上面的目录，直到找到为止。

这意味着如果我们在 `packages/ui` 中编写代码(`.eslintrc.js`)它将从 root 中引用。

可以在 `docs` 目录里面的 `.eslintrc.js` 中添加 `root: true` ：

```js
module.exports = {
  root: true,
  extends: ['custom']
}
```

就像 `tsconfig`、`eslint-config-custom` 一样，让我们可以在整个 monorepo 中共享 ESLint 配置，无论您正在从事什么项目，都可以保持一致性。

### 总结

理解这些工作空间之间的依赖关系很重要，让我们把它们描绘出来:

- `web` - 依赖于 `ui`，`tsconfig` 和 `eslint-config-custom`
- `docs` - 依赖于 `ui`、 `tsconfig` 和 `eslint-config-custom`
- `ui` - 依赖于 `tsconfig` 和 `eslint-config-custom`
- `tsconfig` - 无依赖性
- `eslint-config-custom` - 无依赖项

注意，Turborepo CLI 不负责管理这些依赖项。以上所有的事情都由您选择的包管理器(`npm`、 `pnpm` 或 `yarn`)来处理。

## 3、了解 `turbo.json`

现在我们了解了我们的存储库及其依赖关系。

Turborepo 通过使运行任务更简单和更有效率来提供帮助。

让我们看看 `turbo.json` 的根目录:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "lint": {},
    "dev": {
      "cache": false
    }
  }
}
```

我们在这里看到的是，我们已经用 `turbo` - `lint`，`dev`和`build`注册了三个任务。在 `turbo.json` 中注册的每个任务都可以使用 `turbo run <task>` (或者简称 `turbo <task>`)运行。

为了查看这种情况，让我们尝试运行一个名为 `hello` 的脚本——这个脚本在 `turbo.json` 中还不存在:

```bash
turbo hello
```

您可以看见控制台的错误：

```
task `hello` not found in turbo `pipeline` in "turbo.json".
Are you sure you added it?
```

这一点值得记住——_为了让 `turbo` 运行任务，它必须在 `turbo.json` 中_

让我们研究一下我们已经准备好的脚本。

## 4、Turborepo 的 Linting

运行 `lint` 命令：

```bash
turbo lint
```

你会注意到控制台里发生了一些事情：

- 将同时运行多个脚本，每个脚本的前缀都是 `docs:lint` 、 `ui:lint` 或 `web:lint`。
- 他们每一个都会成功，你会在控制台中看到 `3 successful`。
- 您还将看到 `0 cached, 3 total`。我们将在后面讨论这意味着什么。

每个运行的脚本来自每个工作区的 `package.json`。每个工作区可以选择性地指定自己的 `lint` 脚本:
::: code-group

```json [apps/web/package.json]
{
  "scripts": {
    "lint": "next lint"
  }
}
```

```json [apps/docs/package.json]
{
  "scripts": {
    "lint": "next lint"
  }
}
```

```json [packages/ui/package.json]
{
  "scripts": {
    "lint": "eslint *.ts*"
  }
}
```

:::

当我们运行 `turbo lint` 时，Turborepo 查看每个工作区中的每个 `lint` 脚本并运行它。有关详细信息，请参阅 [Pipelines](/core-concepts/monorepos/running-tasks) 。

### 使用缓存

让我们再运行一次 `lint` 脚本，您会注意到终端中出现了一些新东西:

- `docs:lint`，`web:lint` 和 `ui:lint` 中出现 `cache hit, replaying output`。
- 您将看到 `3 cached, 3 total`。
- 总运行时间应小于 `100ms`，并且 `>>> FULL TURBO` 出现。

有趣的事情发生了，Turborepo 意识到自从上次运行 `lint` 脚本以来，我们的代码没有发生任何变化。

它保存了上一次运行的日志，所以只是重播它们。

让我们尝试修改一些代码，看看会发生什么:

```tsx
// apps/docs/pages/index.tsx
import { Button } from 'ui'

export default function Docs() {
  return (
    <div>
      <h1>Docs</h1> // [!code --]
      <h1>My great docs</h1> // [!code ++]
      <Button />
    </div>
  )
}
```

现在，再次运行 `lint` 脚本，您会注意到:

- `docs:lint` 有评论说 `cache miss, executing`，这意味着 `docs` 正在运行它的 `linting`。
- `2 cached, 3 total` 会出现在底部。

这意味着以前任务的结果仍然被缓存。只有 `docs` 内部的 `lint` 脚本实际运行了——再次加快了速度。要了解更多信息，请查看我们的 [缓存文档](/core-concepts/caching)。

## 5、Turborepo 构建

让我们运行 `build` 脚本：

```bash
turbo build
```

您将看到与运行 `lint` 脚本时相似的输出。只有 `apps/docs` 和 `apps/web` 在 `package.json` 中指定了构建脚本，因此只有这些脚本可以运行。

看看 `turbo.json` 的内部构建，这里有一些有趣的配置:

```json [turbo.json]
// turbo.json
{
  "pipeline": {
    "build": {
      "outputs": [".next/**"]
    }
  }
}
```

您将注意到已经指定了一些 `outputs` 。声明输出将意味着当 `turbo` 完成运行您的任务时，它将在其缓存中保存您指定的输出。

`apps/docs` 和 `apps/web` 都是 `Next.js` 应用程序，它们将构建输出到 `./.next` 文件夹。

让我们尝试一下。删除 `apps/docs/.next` 文件夹。

再次运行 `build` 脚本。您会注意到:

- 会输出：`FULL TURBO` - 构建会在 100 毫秒内完成；
- 再次出现 `.next` 目录。

Turborepo 缓存了我们之前构建的结果。当我们再次运行 `build` 命令时，它还原了整个 `.next/**` 文件夹。要了解更多信息，请查看我们关于 [缓存输出的文档](/core-concepts/caching)。

## 5、运行 `dev` 脚本

让我们运行 `dev` 脚本：

```bash
turbo dev
```

你会在控制台中看到：

- 只执行两个脚本 - `docs:dev` 和 `web:dev`。这是仅有的两个指定 `dev` 的工作区。
- 两个 `dev` 脚本同时运行，在端口 `3000` 和 `3001` 上启动 `Next.js` 应用程序。
- 在控制台中，你会看到：`cache bypass, force executing`。

尝试退出脚本，并重新运行它。你会发现我们没有运行 `FULL TURBO`。为什么呢？

看看 `turbo.json`:

```json
// turbo.json
{
  "pipeline": {
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

在 `dev` 中，我们指定了 `"cache": false`。这意味着我们告诉 Turborepo 不要缓存 `dev`，他是一个持久运行的 `dev` 服务器，并且不产生任何输出，因此没有任何东西需要缓存。此外，我们还设置了 `"always": true`，让 `turbo` 知道这是一个长时间运行的 `dev` 服务器，这样 `turbo` 就可以确保没有其他任务依赖于它。

参考：

- [缓存](/core-concepts/caching)
- [持久化](/reference/configuration)

### 每次只在一个工作区内运行 `dev`

默认情况下，`turbo dev` 会立即在所有工作区上运行 `dev`。但有时，我们可能只想选择一个工作区。

为了处理这个问题，我们可以向命令中添加 `--filter` 标志。

```bash
turbo dev --filter docs
```

您将注意到它现在只运行 `docs:dev`。从我们的文档了解有关 [过滤工作区](/core-concepts/monorepos/filtering) 的更多信息。

## 总结

你已经了解了所有关于你的新的 monorepo，以及 Turborepo 如何使处理你的任务更容易。
