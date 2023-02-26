---
layout: doc
title: 在 Monorepo 执行任务
editLink: false
---

# {{ $frontmatter.title }}

每个 monorepo 都有两个主要组成部分: 工作空间(workspaces)和任务(tasks)。假设您有一个 monorepo，其中包含三个工作区，每个工作区有三个任务:

![](https://qiniucdn2.wangdashuai.top/web-components-note/your-monorepo-excalidraw.webp)

在这里，`apps/web` 和 `apps/doc` 都使用来自 `packages/shared` 的代码。事实上，在 build 时，首先需要构建 `packages/shared`。

## 大多数工具都不会优化速度

假设我们希望在所有工作区中运行所有任务。在 `yarn` 这样的工具中，你可以运行这样的脚本:

```bash
yarn workspaces run lint
yarn workspaces run test
yarn workspaces run build
```

这意味着任务是这样运行的:

![](https://qiniucdn2.wangdashuai.top/web-components-note/yarn-workspaces-excalidraw.webp)

如您所见，`lint` 在所有工作区中运行。然后，运行 `build`-首先是`shared`。最后，运行`test`。

这是运行这些任务的最慢方法。每个任务都需要等到前一个任务完成之后才能开始。为了改进这一点，我们需要一个可以同时执行多任务的工具。

## Turborepo 多任务

Turborepo 可以通过了解我们的任务之间的依赖关系，以最快的速度安排我们的任务。

首先，我们在 `turbo.json` 中声明我们的任务:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      // ^build means build must be run in dependencies
      // before it can be run in this workspace
      "outputs": [".next/**", "!.next/cache/**", ".svelte-kit/**"],
      "dependsOn": ["^build"]
    },
    "test": {},
    "lint": {}
  }
}
```

接下来，我们可以将 `yarn workspaces` 脚本替换为:

```bash
yarn workspaces run lint // [!code --]
yarn workspaces run test // [!code --]
yarn workspaces run build // [!code --]
turbo run lint test build // [!code ++]
```

当我们运行它的时候，Turborepo 会在所有可用的 CPU 上运行尽可能多的任务，这意味着我们的任务是这样运行的:

![](https://qiniucdn2.wangdashuai.top/web-components-note/turborepo-excalidraw.webp)

`lint` 和 `test` 都会立即运行，因为它们没有在 `turbo.json` 中指定的依赖关系。

`shared` 构建任务首先完成，然后是 `web` 和 `docs` 构建。

## 定义 `pipeline`

`pipeline` 配置声明了在 monorepo 中哪些任务相互依赖:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      // A workspace's `build` task depends on that workspace's
      // topological dependencies' and devDependencies'
      // `build` tasks  being completed first. The `^` symbol
      // indicates an upstream dependency.
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", ".svelte-kit/**"]
    },
    "test": {
      // A workspace's `test` task depends on that workspace's
      // own `build` task being completed first.
      "dependsOn": ["build"],
      // A workspace's `test` task should only be rerun when
      // either a `.tsx` or `.ts` file has changed.
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts", "test/**/*.tsx"]
    },
    // A workspace's `lint` task has no dependencies and
    // can be run whenever.
    "lint": {},
    "deploy": {
      // A workspace's `deploy` task depends on the `build`,
      // `test`, and `lint` tasks of the same workspace
      // being completed.
      "dependsOn": ["build", "test", "lint"]
    }
  }
}
```

让我们在深入研究 `turbo.json` 之前，先来了解一些常见的模式。

### 任务之间的依赖关系

#### 在同一个工作区

可能有一些任务需要在其他任务之前运行。例如，可能需要在 `deploy` 之前运行 `build`。

如果两个任务在同一个工作区中，您可以像下面这样指定关系:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", ".svelte-kit/**"]
    },
    "deploy": {
      // A workspace's `deploy` task depends on the `build`,
      // task of the same workspace being completed.
      "dependsOn": ["build"]
    }
  }
}
```

这意味着，无论何时运行 `turbo run deploy` ，`build`也将在相同的工作区内运行。

#### 在不同的工作区

Monorepos 中的一个常见模式是声明一个工作空间的`build`任务，只在它所依赖的所有构建任务完成之后才运行。

`^` 符号显式声明任务依赖于它所依赖的工作区中的任务。

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      // "A workspace's `build` command depends on its dependencies'
      // and devDependencies' `build` commands being completed first"
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", ".svelte-kit/**"]
    }
  }
}
```

#### 没有依赖

一个空的依赖项列表(`dependsOn` 或是未定义的`[]`)意味着在此任务之前不需要运行任何东西！毕竟，它没有依赖关系。

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    // A workspace's `lint` command has no dependencies and can be run
    // whenever.
    "lint": {}
  }
}
```

#### 特定的工作区任务(workspace-tasks)

有时，您可能希望在另一个工作区任务上创建一个工作区任务依赖项。这对于从 `lerna` 或 `rush` 迁移尤其有帮助，因为在这些协议中，默认情况下任务在不同的阶段运行。有时候，这些配置所做的假设不能用简单的`pipeline`来表示，如上所示，在 CI/CD 中使用 `turbo` 时，您可能只想表示应用程序或微服务之间的任务序列。

对于这些情况，您可以使用 `<workspace>#<task>` 语法在 `pipeline` 中表达这些关系。下面的示例描述了前端应用程序的 `deploy` 脚本，该脚本依赖于后端的部署和健康检查脚本，以及 ui 工作区的测试脚本:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    // Standard configuration
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", ".svelte-kit/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "deploy": {
      "dependsOn": ["test", "build"]
    },

    // Explicit workspace-task to workspace-task dependency
    "frontend#deploy": {
      "dependsOn": ["ui#test", "backend#deploy", "backend#health-check"]
    }
  }
}
```

`frontend#deploy` 的这种显式配置似乎与 `test` 和 `deploy` 任务配置相冲突，但并非如此，由于 `test` 和 `deploy` 不依赖于其他工作区(例如 `^<task>`) ，所以它们可以在工作区的 `build` 和 `test` 脚本完成之后的任何时候执行。

::: warning
备注:

1. 虽然这个 `<workspace>#<task>` 语法是一个有用的逃生出口，但我们通常建议将其用于部署编排任务，如健康检查，而不是构建时依赖，这样 Turborepo 可以更有效地优化这些任务
2. `Package-tasks` 不继承缓存配置。此时必须重新声明 `outputs`。
3. `<workspace>` 必须与工作区的 `package.json` 中的 `name` 键匹配，否则任务将被忽略。
   :::

### 从根目录运行任务

`turbo` 可以运行位于 monorepo 根目录下的 `package.json` 文件中的任务。必须使用密钥语法 `"//#<task>"` 显式地将它们添加到 `pipeline` 中。即使对于已经有自己的条目的任务也是如此。例如，如果您的 pipeline 声明了一个 `build` 任务，并且您希望使用 `turbo run build` 将 monorepo 的根 `package.json` 文件中定义的构建脚本包含进去，那么您必须通过在配置中声明 `"//#build": {...}` 来选择根。相反，如果您需要的只是 `"my-task": {...}` ，则不需要定义通用的 `"//#my-task": {...}` 条目。

定义根任务 `format` 并选择根进入 `test` 的示例 `pipeline` 可能类似于:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", ".svelte-kit/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    // This will cause the "test" script to be included when
    // "turbo run test" is run
    "//#test": {
      "dependsOn": []
    },
    // This will cause the "format" script in the root package.json
    // to be run when "turbo run format" is run. Since the general
    // "format" task is not defined, only the root's "format" script
    // will be run.
    "//#format": {
      "dependsOn": [],
      "outputs": ["dist/**/*"],
      "inputs": ["version.txt"]
    }
  }
}
```

关于递归的注意事项: monorepo 的根 `package.json` 中定义的脚本通常调用 `turbo` 本身。例如，构建脚本可能是 `turbo` 运行构建。在这种情况下，在 `turbo run build` 中包含 `//#build` 将导致无限递归。正是由于这个原因，必须通过在管道配置中包含 `//#<task>` 来显式地选择从 monorepo `的根运行的任务。turbo` 包括一些在递归情况下产生错误的尽力检查，但是您只能选择那些本身不会触发将递归的 `turbo` 运行的任务。

### 任务外的依赖项

当你的任务有拓扑依赖关系，并且不在给定的任务范围内时，你仍然会希望享受 Turborepo 的并行性，并确保你的缓存行为是正确的，根据你的代码变化。

为了演示如何做到这一点，假设您有一组工作空间来做一些数学运算: `add`、`subtract`和`multiply`。`subtract`是通过调用带负数的 `add` 来实现的，而`multiply`是通过在循环中调用 `add` 来实现的。因此，`add` 是`subtract`和`multiply`的依赖项。

您已经在所有这三个工作区中编写了测试，现在是运行它们的时候了:

1. 所有测试并行运行以保持速度
2. 依赖项的更改应该会导致缓存丢失

为了实现这一点，我们可以像下面这样建立一个 `pipeline`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "topo": {
      "dependsOn": ["^topo"]
    },
    "test": {
      "dependsOn": ["^topo"]
    }
  }
}
```

![](https://qiniucdn2.wangdashuai.top/web-components-note/task-graph-with-dummy-task.webp)

在这个管道中，我们创建一个中间虚拟 `topo` 任务。由于我们的工作区中没有 `topo` 命令，pipeline 将直接并行地运行 `test` 脚本，以满足我们的第一个需求。第二个需求也将得到满足，依赖于 Turborepo 的默认行为，即为工作区任务创建哈希以及它作为树的依赖关系。

::: info
Turborepo 的管道 API 设计和这个文档页面的灵感来自于微软的 Lage 项目。让我们欢呼一下 Kenneth Chow ，提出一种简洁而优雅的方式来展开任务。
:::
