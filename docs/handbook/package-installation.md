---
layout: doc
title: 包的安装
editLink: false
---

# {{ $frontmatter.title }}

包管理器（如 npm）为您处理两件事：管理工作区和安装包。

Turborepo 兼容四个软件包管理器:

- [npm](https://docs.npmjs.com/cli/v8/using-npm/workspaces/#description)
- [pnpm](https://pnpm.io/workspaces)
- [Yarn 1](https://classic.yarnpkg.com/lang/en/docs/workspaces/)
- Yarn >= 2

你应该使用任何你觉得最舒服的-但如果你是一个初学者，我们推荐 npm。

如果您对 monorepos 比较熟悉，我们建议使用 pnpm。它更快，并且提供了一些有用的 CLI 选项，比如`--filter`。

## 安装包

当您第一次克隆或创建 monorepo 时，您需要:

- 请确保您在 monorepo 的根目录下；
- 运行 install 命令。

::: code-group

```bash [npm]
npm install
```

```bash [yarn]
yarn install
```

```bash [pnpm]
pnpm install
```

:::

现在，您将看到`node_modules`文件夹出现在存储库的根目录和每个工作区中。

## 添加、删除、更新包

::: code-group

```bash [npm]
# 在工作区安装包
npm install <package> --workspace=<workspace>

# 示例
npm install react --workspace=web

# 在工作区删除包
npm uninstall <package> --workspace=<workspace>

# 示例
npm uninstall react --workspace=web

# 在工作区更新包
npm update <package> --workspace=<workspace>

# 示例
npm update react --workspace=web
```

```bash [yarn]
# 在工作区安装包
yarn workspace <workspace> add <package>

# 示例
yarn workspace web add react

# 在工作区删除包
yarn workspace <workspace> remove <package>

# 示例
yarn workspace web remove react

# 在工作区更新包
yarn workspace <workspace> upgrade <package>

# 示例
yarn workspace web upgrade react
```

```bash [pnpm]
# 在工作区安装包
pnpm add <package> --filter <workspace>

# 示例
pnpm add react --filter web

# 在工作区删除包
pnpm uninstall <package> --filter <workspace>

# 示例
pnpm uninstall react --filter web

# 在工作区更新包
pnpm update <package> --filter <workspace>

# 示例
pnpm update react --filter web
```

:::
