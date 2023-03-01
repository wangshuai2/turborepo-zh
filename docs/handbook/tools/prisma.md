---
layout: doc
title: Prisma
editLink: false
---

# {{ $frontmatter.title }}

[Prisma](https://www.prisma.io/) 是一个非常受欢迎的 ORM，具有自动迁移、类型安全和集成工具。将它与 Turborepo 一起使用可以减少生成代码的时间，并轻松确保生成的 Prisma 代码始终是最新的。

## 教程

本指南向您介绍如何：

1. 在 monorepo 中设置 Prisma
2. 处理迁移和代码生成脚本
3. 用 Turborepo 缓存这些脚本
4. 确保无论何时运行 `dev` 或 `build`，它们总是在运行

如果您已经在数据库中设置了 Prisma，则可以跳到步骤 4。

### 1. 创建 monorepo

如果你没有一个现有的项目，使用我们的[快速启动](/getting-started/create-new)创建一个新的 monorepo。

### 2. 添加一个 `database` 包

在包中创建一个名为 `database` 的新文件夹，其中包含一个 `package.json`:

```json
{
  "name": "database",
  "dependencies": {
    "@prisma/client": "latest"
  },
  "devDependencies": {
    // Replace "latest" with the latest version
    "prisma": "latest"
  }
}
```

如果您正在使用 `pnpm`，您应该在根目录下添加一个名为 `.npmrc` 的文件：

```
# .npmrc
public-hoist-pattern[]=*prisma*
```

运行软件包管理器的安装步骤来安装新的依赖项。

### 3. 运行 `prisma init`

`cd` 进入 `packages/database`：

```bash
cd packages/database
```

运行 `npx prisma init`：

这应该会在 `packages/database` 中创建几个文件:

```
prisma/schema.prisma
.gitignore
.env
```

- `schema.prisma` 是您的 [Prisma schema](https://www.prisma.io/docs/concepts/components/prisma-schema) 所在的位置。在这里，您将能够修改您的数据库的形状；
- `.gitignore` 将一些被忽略的文件添加到 git；
- `.env` 允许您手动为 prisma 指定 `DATABASE_URL`。

此时，您应该参考 Prisma 文档[将数据库连接到 Prisma](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/connect-your-database-typescript-postgres)。

一旦连接了数据库，就可以继续前进了。

### 4. 设置脚本

让我们在 `packages/database` 中添加一些脚本到 `package.json` 中:

```json
// packages/database/package.json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push --skip-generate"
  }
}
```

让我们在根目录中将这些脚本添加到 `turbo.json`:

```json
// turbo.json
{
  "pipeline": {
    "db:generate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    }
  }
}
```

我们现在可以从存储库的根目录运行 `turbo db:push db:generate` 来自动迁移数据库并生成类型安全的 Prisma client。

::: info
我们在 `db:push` 上使用 `--skip-generate` 标志，以确保它在迁移数据库后不会自动运行 `prisma generate`。在使用 Turborepo 时，这最终会变得更快，因为我们会自动并行化任务。
:::

### 5. 导出你的 Prisma client

接下来，我们需要导出 `@prisma/client`，这样我们就可以在应用程序中使用它了。让我们在 `packages/database` 中添加一个新文件：

```ts
// packages/database/index.ts
export * from '@prisma/client'
```

遵循内部包模式，我们还需要将 `index.ts` 添加到 `packages/database/package.json` 的 `main` 和 `types` 中。

```json
// packages/database/package.json
{
  "main": "./index.ts",
  "types": "./index.ts"
}
```

#### 导入 `database`

现在让我们将 database package 导入到我们的应用程序中进行测试。假设你在 `apps/web` 上有一个应用，将依赖项添加到 `apps/web/package.json`:

::: code-group

```json [npm]
{
  "dependencies": {
    "database": "*"
  }
}
```

```json [yarn]
{
  "dependencies": {
    "database": "*"
  }
}
```

```json [pnpm]
{
  "dependencies": {
    "database": "workspace:*"
  }
}
```

:::

运行软件包管理器的安装命令。

现在，您可以从应用程序中的任何位置从 `database` 导入 `PrismaClient`:

```ts
import { PrismaClient } from 'database'

const client = new PrismaClient()
```

::: warning
您可能还需要在应用程序内部进行一些配置，以允许它运行一个内部包。查看我们的[内部软件包文档](/handbook/sharing-code/internal-packages)以了解更多信息。
:::

### 6. 修正脚本

我们现在的处境很有利。我们有一个可重用的 `database` 模块，我们可以导入到我们的任何应用程序。我们已经有了一个 `turbo db:push` 脚本，我们可以使用它来将我们的更改推送到数据库中。

然而，我们的 `db:generate` 脚本还没有优化。它们为我们的 `dev` 和 `build` 任务提供了至关重要的代码。如果新开发人员在应用程序上运行 `dev` 而没有首先运行 `db:generate`，他们会得到错误。

因此，让我们确保在用户运行 `dev` 之前始终运行 `db:generate`:

```json
{
  "pipeline": {
    "dev": {
      "dependsOn": ["^db:generate"],
      "cache": false
    },
    "build": {
      "dependsOn": ["^db:generate"],
      "outputs": ["your-outputs-here"]
    },
    "db:generate": {
      "cache": false
    }
  }
}
```

请参阅有关 [运行任务](/core-concepts/monorepos/running-tasks)的部分，了解有关 `^db:generate` 语法的更多信息。

### 7. 缓存 prisma generate 的结果

`prisma generate` 输出文件到文件系统，通常在 `node_module` 内部。理论上，用 Turborepo 缓存 `prisma generate` 的输出应该可以节省几秒钟的时间。

然而，Prisma 对不同的包管理器的行为是不同的。这可能导致不可预测的结果，在某些情况下可能导致部署中断。与其记录每种方法的复杂性，我们建议不要缓存 `prisma generate` 的结果。由于 `prisma generate` 通常只需要 5-6 秒，并且对于较大的模式文件，这似乎是一个很好的折衷方案。
