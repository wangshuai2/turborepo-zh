---
layout: doc
title: Monorepo 中的开发任务
editLink: false
---

# {{ $frontmatter.title }}

绝大多数开发工作流程如下:

- 打开一个仓库
- 在开发过程中运行 `dev` 任务
- 在一天结束时，关闭 `dev` 任务并关闭存储库。

`dev` 可能是存储库中运行频率最高的任务，因此正确执行它非常重要。

## `dev` 任务的类型

`dev` 任务有多种形状和大小:

- 为 Web 应用程序运行本地开发服务器
- 每次代码更改时，运行 `nodemon` 以重新运行后端进程
- 在 `--watch` 模式下运行测试

## 使用 Turborepo 设置

您应该像这样在 `turbo.json` 中指定开发任务。

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

因为 `dev` 任务不产生输出，所以 `outputs` 是空的。`dev` 任务也是独一无二的，因为您很少想要缓存它们，所以我们将 `cache` 设置为 `false`。我们还将持久化设置为 `true`，因为 `dev` 任务是长时间运行的任务，我们希望确保它不会阻止任何其他任务的执行。

### 设置 `package.json`

您还应该在 root 目录的 `package.json` 中提供一个 `dev` 任务:

```json
{
  "scripts": {
    "dev": "turbo run dev"
  }
}
```

这使开发人员能够直接从他们的普通任务运行器运行任务。

## 在 `dev` 之前运行任务

在某些工作流中，您可能希望在运行`dev`任务之前运行任务。例如，生成代码或运行`db：migrate`任务。

在这些情况下，使用 `dependsOn` 表示任何 `codegen` 或 `db：migrate` 任务都应该在运行 `dev` 之前运行。

```json
// turbo.json
{
  "pipeline": {
    "dev": {
      "dependsOn": ["codegen", "db:migrate"],
      "cache": false
    },
    "codegen": {
      "outputs": ["./codegen-outputs/**"]
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```

然后，在应用的 `package.json` 中:

```json
// apps/web/package.json
{
  "scripts": {
    // For example, starting the Next.js dev server
    "dev": "next",
    // For example, running a custom code generation task
    "codegen": "node ./my-codegen-script.js",
    // For example, using Prisma
    "db:migrate": "prisma db push"
  }
}
```

这意味着你的 `dev` 任务的用户不需要担心代码生成或迁移他们的数据库——甚至在他们的开发服务器启动之前就已经为他们处理好了。

## 只在某些工作区中运行 `dev`

假设您想在 `docs` 工作区(位于 `<root>/apps/docs`)中运行 `dev` 任务。`turbo` 可以从您的目录中推断出工作区，所以如果您运行:

```bash
cd <root>/apps/docs
turbo run dev
```

`turbo` 会自动发现您在 `docs` 工作区中并运行 `dev` 任务。

要从存储库中的任何其他位置运行相同的任务，请使用 `--filter` 语法。举个例子：

```bash
turbo run dev --filter docs
```

## 使用环境变量

在开发过程中，您经常需要使用环境变量。这些允许您自定义程序的行为——例如，在开发和生产中指向不同的 `DATABASE_URL`。

我们建议使用一个名为 `dotenv-cli` 的库来解决这个问题。

::: info
我们希望每个开发人员都能有一个很好的使用 Turbo 的体验。下面记录的方法不符合这些标准。

我们正在为这个问题制定一个一流的解决方案——但在您等待的同时，这里有一个下一个最佳的解决方案。
:::

### 教程

在根工作区中安装 `dotenv-cli`:
::: code-group

```bash [npm]
# Installs dotenv-cli in the root workspace
npm add dotenv-cli
```

```bash [yarn]
# Installs dotenv-cli in the root workspace
yarn add dotenv-cli --ignore-workspace-root-check
```

```bash [pnpm]
# Installs dotenv-cli in the root workspace
pnpm add dotenv-cli --ignore-workspace-root-check
```

:::

将. env 文件添加到您的根工作区:

```plain
  ├── apps/
  ├── packages/
  ├── .env // [!code ++]
  ├── package.json
  └── turbo.json
```

添加任何你需要注入环境变量:

```plain
DATABASE_URL=my-database-url
```

在 root 目录的 `package.json` 中，添加一个 `dev` 脚本。在它前面加上 `dotenv` 和 `--` 参数分隔符:

```json
{
  "scripts": {
    "dev": "dotenv -- turbo run dev"
  }
}
```

这将从 `.env` 中提取环境变量并在 `turbo run dev` 前运行。

现在,您可以运行您的 `dev` 脚本:

::: code-group

```bash [npm]
npm run dev
```

```bash [yarn]
yarn dev
```

```bash [pnpm]
pnpm dev
```

:::

并且您的环境变量将被填充！在 Node.js 中，这些可在 `process.env` 上使用 `process.env.DATABASE_URL`。

::: warning
如果要使用环境变量构建你的应用，还应该将环境变量添加到 `turbo.json` 中。
:::
