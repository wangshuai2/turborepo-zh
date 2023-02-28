---
layout: doc
title: 内部软件包
editLink: false
---

# {{ $frontmatter.title }}

内部软件包是指只用于 monorepo 内部的软件包。它们对于在闭源 monorepos 中的应用程序之间共享代码非常有用。

内部包可以快速创建，如果您最终希望将其发布到 `npm`，则可以将其转换为[外部包](/handbook/publishing-packages)。

## 如何使用内部包

外部包在将其文件放入包注册表之前通过一个捆绑包运行它们。这意味着他们需要很多工具来处理。

- Bundlers: 构建包
- 版本控制: 帮助进行版本控制和发布
- 发布: 发布包

如果你想在本地使用这些文件，你还需要:

- Dev 脚本: 用于在文件更改时在本地捆绑包

因为内部包没有发布，所以我们可以跳过所有这些步骤。我们不会自己捆绑软件包，而是让导入软件包的应用程序为我们捆绑软件包。

这听起来很复杂，但是设置起来非常容易。

## 我们的第一个内部包

我们将在 monorepo 中创建一个共享的 `math-helpers` 包。

### 1. 创建你的 monorepo

如果你没有一个现有的 monorepo，请查看我们的[指南](/getting-started/create-new)。

### 2. 创建一个新包

在 `/packages` 内部，创建一个名为 `math-helpers` 的新文件夹。

```bash
mkdir packages/math-helpers
```

创建 `package.json` :

```json
{
  "name": "math-helpers",
  "dependencies": {
    // Use whatever version of TypeScript you're using
    "typescript": "latest"
  }
}
```

创建一个 `src` 文件夹，并添加一个 `TypeScript` 文件(位于 `packages/data-helpers/src/index.ts`)。

```ts
export const add = (a: number, b: number) => {
  return a + b
}

export const subtract = (a: number, b: number) => {
  return a - b
}
```

你还需要添加一个 `tsconfig.json` 到 `packages/math-helpers/tsconfig.json` :

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "moduleResolution": "node",
    "preserveWatchOutput": true,
    "skipLibCheck": true,
    "noEmit": true,
    "strict": true
  },
  "exclude": ["node_modules"]
}
```

太棒了!我们已经得到了我们需要的内部包。

### 3. 导入这个包

我们现在要导入这个包，看看会发生什么。进入其中一个应用程序，并将 `math-helpers` 添加到 `package.json` 的依赖项中:

::: code-group

```json [npm]
{
  "dependencies": {
    "math-helpers": "*"
  }
}
```

```json [yarn]
{
  "dependencies": {
    "math-helpers": "*"
  }
}
```

```json [pnpm]
{
  "dependencies": {
    "math-helpers": "workspace:*"
  }
}
```

:::

从根目录安装所有包，以确保依赖性工作。

现在，将从 `math-helpers` 导入应用的源文件之一:

```
import { add } from "math-helpers" // [!code ++]

add(1, 2) // [!code ++]
```

您可能会看到一个错误！

```
Cannot find module 'math-helpers' or its corresponding type declarations.
```

那是因为我们漏了一步我们还没有告诉我们的 `math-helpers/package.json` 包的入口点是什么。

### 修复 `main` 和 `types`

前往 `packages/math-helpers/package.json` 文件添加两个字段，`main` 和 `types`：

```json
{
  "name": "math-helpers",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {
    "typescript": "latest"
  }
}
```

现在，任何导入 `math-helpers` 模块的内容都将直接指向 `src/index.ts` 文件—这是他们将导入的文件。

回到 `apps/web/pages/index.tsx` 。错误应该没有了！

### 尝试运行应用

现在，尝试运行该应用程序的开发脚本:

```bash
turbo dev
```

<!-- ::: code-group
```json
::: -->

### 配置你的应用

**待完善**
