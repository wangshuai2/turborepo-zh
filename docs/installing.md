---
layout: doc
title: 安装 Turborepo
editLink: false
---

# {{ $frontmatter.title }}

`turbo` 可以在以下操作系统上与 `yarn`、`npm` 和 `pnpm` 一起工作：

- macOS darwin 64-bit (Intel), ARM 64-bit (Apple Silicon)
- Linux 64-bit, ARM 64-bit
- Windows 64-bit, ARM 64-bit

::: warning
Note: `Linux` 针对 `glibc` 构建了 `turbo` 链接。对于 `Alpine Docker` 环境，您还需要确保 libc6-compat 已经安装好，命令：`RUN apk add --no-cache libc6-compat`
:::

## 全局安装

可以在任何项目中使用 `turbo` 的全局安装，并且可以根据运行 `turbo` 的目录自动选择工作区。

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

一旦您拥有了 `turbo` 的全局安装副本，您就可以直接从工作区目录运行了。

```bash
cd <repository root>/apps/docs
turbo build
```
