---
layout: doc
title: 添加到现有Monorepo项目
editLink: false
---

# {{ $frontmatter.title }}

## 配置工作区

Turbo 构建在 Workspace 之上，这是从单个 monorepo 包中管理多个包的一种方法。Turborepo 与所有软件包管理器的工作区实现兼容。有关管理 Turborepo 工作区的更多信息，请参见 [Workspace](/handbook/workspaces) 文档。

您可以以任何方式配置工作区，但是一个常见的文件夹结构示例是将应用程序保存在 `/apps` 文件夹中，将包保存在 `/packages` 文件夹中。对于每个包管理器，这些文件夹的配置是不同的。

::: code-group

```json [npm]
// 在 monorepo 的根 package.json 文件中指定您的工作区:
{
  "workspaces": ["packages/*", "apps/*"]
}
```

```json [yarn]
// 在 monorepo 的根 package.json 文件中指定您的工作区:
{
  "workspaces": ["packages/*", "apps/*"]
}
```

```yaml [pnpm]
# 在 pnpm-workspace.yaml 文件中指定您的工作区:
packages:
  - 'packages/*'
  - 'apps/*'
```

:::

配置工作区之后，重新运行包管理器的 `install` 命令。

::: warning
不支持嵌套工作区。由于包名称必须是唯一的，因此将每个包移动到 monorepo 的根包的子包应该能够满足您的需要。
:::

## 安装 `turbo`

全局安装：

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

参考： [安装 turborepo](/installing)

## 创建 `turbo.json`

在 monorepo 的根目录中，创建一个名为 `turbo.json` 的空文件，这将保存 Turborepo 的配置。

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json"
}
```

## 创建 `pipeline`

要定义 monorepo 的任务依赖关系图，请使用 monorepo 根目录下的 `turbo.json` 配置文件中的 `pipeline`。`turbo` 将此配置解释为最佳地调度、执行和缓存工作区中定义的每个 `package.json` 脚本的输出。

`pipeline` 对象中的每个键都是一个 `package.json` 脚本的名称，可以通过 `turbo run` 执行。您可以指定它的依赖项，其中包含 `dependsOn` 键以及一些与 [缓存相关](/core-concepts/caching) 的其他选项。有关 `pipeline` 的详细信息，请参阅 [管道文档](/core-concepts/monorepos/running-tasks)。

没有在 `package.json` 的脚本列表中定义指定脚本的工作区将被 `turbo` 忽略。

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      // A package's `build` script depends on that package's
      // dependencies and devDependencies
      // `build` tasks  being completed first
      // (the `^` symbol signifies `upstream`).
      "dependsOn": ["^build"],
      // note: output globs are relative to each package's `package.json`
      // (and not the monorepo root)
      "outputs": [".next/**"]
    },
    "test": {
      // A package's `test` script depends on that package's
      // own `build` script being completed first.
      "dependsOn": ["build"],
      // A package's `test` script should only be rerun when
      // either a `.tsx` or `.ts` file has changed in `src` or `test` folders.
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts", "test/**/*.tsx"]
    },
    // A package's `lint` script has no dependencies and
    // can be run whenever. It also has no filesystem outputs.
    "lint": {},
    "deploy": {
      // A package's `deploy` script depends on the `build`,
      // `test`, and `lint` scripts of the same package
      // being completed. It also has no filesystem outputs.
      "dependsOn": ["build", "test", "lint"]
    }
  }
}
```

给定包的粗略执行顺序是基于 `dependsOn` 键:

- `build` 它的上游依赖项运行了它们的 `build` 命令
- `test` 它自己的 `build` 命令完成并且在包中没有文件系统输出(只有日志) ，就进行测试
- `lint` 以任意顺序运行，因为它没有上游依赖项
- `deploy` 一旦它自己的 `build`、`test`和 `lint` 命令完成，就进行部署。

执行后，整个 `pipeline` 可以运行:

```bash
npx turbo run build test line deploy
```

`turbo` 会调度每个任务的执行，以优化机器资源的使用。

## 编辑 `.gitignore`

将 `.turbo` 添加到 `.gitignore` 文件中。 `CLI` 使用这些文件夹进行日志和某些任务输出。

```
.turbo // [!code ++]
```

确保您的任务文件、要缓存的文件和文件夹也包含在 `.gitignore` 中。

```
build/** // [!code ++]
dist/** // [!code ++]
.next/** // [!code ++]
```

根据 monorepo 设置的不同，一些内容可能已经正确地进行了缓存。在下一节中，我们将展示 `turbo` 是如何工作的，是如何通过 `scope` 工作的，以及在此之后如何使缓存工作。

## 配置远端缓存

Turborepo 速度的一个主要关键在于它既懒惰又高效——它尽可能减少工作量，并且试图永远不重做以前已经做过的工作。

目前，Turborepo 将您的任务缓存在您的本地文件系统上(即“单人模式”)。然而，如果有一种方法可以利用你的队友或者你的 `CI` (即“合作多人电子游戏”)所做的计算工作呢？如果有一种方法可以跨机器传送和共享一个缓存呢？就像你的 Turborepo 缓存的 “Dropbox”。

Turborepo 可以使用一种被称为“远程缓存”的技术，在机器之间共享缓存工件，以获得额外的速度提升。

::: warning
远程缓存是 Turborepo 的一个强大功能，但是伴随着强大的功能而来的是巨大的责任。首先确保缓存正确，然后再次检查环境变量的处理。还请记住 Turborepo 将日志作为工件对待，所以要注意要打印到控制台的内容。
:::

### 使用远程缓存进行本地开发

Turborepo 使用 Vercel 作为其默认的远程缓存提供程序。如果你想把你的本地 Turborepo 链接到你的远程缓存，你可以用你的 Vercel 帐户验证 Turborepo CLI:

```bash
turbo login
```

然后，将 turborepo 链接到远程缓存:

```bash
turbo link
```

启用后，对当前缓存的包或应用程序进行一些更改，并使用 `turbo run` 对其运行任务。您的缓存工件现在将存储在本地和远程缓存中。要验证这种方法是否有效，请删除本地 Turborepo 缓存:

```bash
rm -rf ./node_modules/.cache/turbo
```

再次运行相同的构建。如果工作正常，`turbo` 不应该在本地执行任务，而应该从远程缓存下载日志和工件并将它们重播给您。

当连接到 `sso-enabled` 的 Vercel 团队时，您必须提供 Team slug 作为 `npx turbo login` 的参数。

```bash
turbo login --sso-team=<team-slug>
```
