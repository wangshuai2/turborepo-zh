---
layout: doc
title: 使用环境变量
editLink: false
---

# {{ $frontmatter.title }}

我们目前推荐使用 `dotenv-cli` 作为将环境变量引入开发任务的最简单方法。

我们非常期待在 Turborepo 的未来版本中改进开发者体验和环境变量的使用。

## `turbo` 局部使用

1. 将所有变量作为 `.env` 文件放到 monorepo 的根目录中。
2. 将 `dotenv-cli` 安装到存储库的根目录中。

```json
{
  "devDependencies": {
    "dotenv-cli": "latest" // [!code ++]
  }
}
```

3. 调整脚本，将环境变量插入到 `turbo` 命令中。

```json
{
  "scripts": {
    "dev": "dotenv -- turbo dev"
  }
}
```

## `turbo` 全局使用

如果您在全局使用 `turbo`，您还需要全局安装 `dotenv-cli`，以便您可以将 `dotenv --` 放在终端中 `turbo` 命令的前面。
