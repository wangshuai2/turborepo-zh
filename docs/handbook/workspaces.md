---
layout: doc
title: 工作空间
editLink: false
---

# {{ $frontmatter.title }}

工作空间是构建你的 Monorepo 的基石。您添加到 monorepo 的每个应用程序和软件包都将在其自己的工作区内。

工作区是由包管理器管理的，所以请确保您已经首先设置了它。

## 配置工作空间

要使用工作区，必须首先向软件包管理器声明它们的文件系统位置。

我们推荐的一个常见约定是使用顶级 `apps/` 和 `packages` 目录。这不是一个要求——只是一个建议的目录结构。

`apps`文件夹应包含可启动应用的工作区，如`Next.js`或`Svelte`。

`packages`文件夹应包含应用程序或其他包使用的包的工作区。

::: code-group

```json [npm]
// 将要配置为工作区的文件夹添加到根package.json文件中的工作区字段中。此字段包含globs形式的工作区文件夹列表:
{
  "name": "my-monorepo",
  "version": "1.0.0",
  "workspaces": ["docs", "apps/*", "packages/*"]
}
```

```json [yarn]
// 将要配置为工作区的文件夹添加到根package.json文件中的工作区字段中。此字段包含globs形式的工作区文件夹列表:
{
  "name": "my-monorepo",
  "version": "1.0.0",
  "workspaces": ["docs", "apps/*", "packages/*"]
}
```

```yaml [pnpm]
# 将要配置为工作区的文件夹添加到根目录中存在的pnpm-workspace.yaml文件中。此文件包含一个以globs形式显示的工作区文件夹列表：
packages:
  - 'docs'
  - 'apps/*'
  - 'packages/*'
```

:::

```
my-monorepo
├─ docs
├─ apps
│  ├─ api
│  └─ mobile
├─ packages
│  ├─ tsconfig
│  └─ shared-utils
└─ sdk
```

在上面的例子中，`my-monorepo/apps/` 和 `my-monorepo/packages/`中的所有目录都是工作区，`my-monorepo/docs` 目录本身也是一个工作区。`my-monorepo/sdk/`不是工作区，因为它不包含在工作区配置中。

## 工作区命名

每个工作区都有一个唯一的名称，该名称在其`package.json`中指定:

```json
// packages/shared-utils/package.json
{
  "name": "shared-utils"
}
```

这个名字是用来：

1. 指定一个软件包应该安装在哪个工作区，以便在其他工作区中使用这个工作区。
2. 发布的软件包将以您指定的 `name` 发布在 `npm` 上。

您可以使用一个 `npm` 组织或用户范围，以避免与现有的 `npm` 软件包发生冲突。例如，您可以使用`@mycompany/share-utils`。

## 工作区的相互依赖

要在另一个工作区中使用工作区，您需要使用它的名称将它指定为依赖项。

例如，如果我们希望 `apps/docs` 导入 `packages/shared-utils`，我们需要在 `apps/docs/package.json` 中添加 `shared-utils` 作为依赖项:

::: code-group

```json [npm]
// apps/docs/package.json
{
  "dependencies": {
    "shared-utils": "*"
  }
}
```

```json [yarn]
// apps/docs/package.json
{
  "dependencies": {
    "shared-utils": "*"
  }
}
```

```json [pnpm]
// apps/docs/package.json
{
  "dependencies": {
    "shared-utils": "workspace:*"
  }
}
```

:::

::: info
`*`允许我们引用依赖项的最新版本。如果软件包的版本发生了变化，这样我们就不用再去修改依赖关系的版本了。
:::

就像一个普通的软件包一样，我们需要从根目录运行 `install`。安装完成后，我们可以像使用 `node_modules` 中的任何其他包一样使用工作区。有关更多信息，请参见我们的[共享代码](/handbook/sharing-code)部分。

## 管理工作区

在 monorepo 中，当您从 `root` 运行 `install` 命令时，会发生以下事情:

1. 检查已安装的工作区依赖项
2. 任何工作区都被符号链接到 `node_modules`，这意味着您可以像导入普通包一样导入它们
3. 下载其他包并将其安装到 `node_modules` 中

这意味着无论何时 **添加/删除** 工作区，或者更改它们在文件系统中的位置，都需要从 `root` 重新运行 `install` 命令来重新设置工作区。

::: warning
您不需要每次在软件包中更改源代码时都重新安装—只有当您以某种方式更改工作区的位置（或配置）时才需要重新安装。
:::

如果遇到问题，您可能必须删除存储库中的每个 `node_modules` 文件夹，然后重新运行 `install` 以纠正它。
