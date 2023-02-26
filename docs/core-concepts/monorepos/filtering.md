---
layout: doc
title: 过滤工作区
editLink: false
---

# {{ $frontmatter.title }}

一个 monorepo 可以包含数百或数千个工作空间。默认情况下，从存储库的根运行 `turbo run test` 将在所有可用的工作区中执行 `test` 任务。

![](https://qiniucdn2.wangdashuai.top/web-components-note/no-filter.webp)

Turborepo 支持一个 `--filter` 标志，它允许您选择要在其中执行任务的工作空间。

![](https://qiniucdn2.wangdashuai.top/web-components-note/with-filter.webp)

你可以用它来:

- 按工作区名称筛选
- 按工作区目录进行筛选
- 匹配工作区的 `dependents` 和 `dependencies`
- 从工作区根目录执行任务
- 根据 git 历史记录的变化进行筛选
- 从选择中排除工作区

Turborepo 将根据 `turbo.json` 中的 `pipeline`，针对每个匹配的工作区运行每个任务，确保首先运行依赖于它的任何任务。

## 过滤器语法

### 多个过滤器

通过向命令传递多个 `--filter` 标志，可以指定多个过滤器:

```bash
turbo build --filter=my-pkg --filter=my-app
```

### 根据工作区名称过滤

如果只想在一个工作区中运行脚本，可以使用一个过滤器: `--filter=my-pkg`。

```bash
# Build 'my-pkg', letting `turbo` infer task dependencies
# from the pipeline defined in turbo.json
turbo run build --filter=my-pkg

# Build '@acme/bar', letting `turbo` infer task dependencies
# from the pipeline defined in turbo.json
turbo run build --filter=@acme/bar
```

如果希望在几个名称相似的工作区中运行任务，可以使用 globb 语法: `--filter=*my-pkg*` 。

```bash
# Build all workspaces that start with 'admin-', letting turbo infer task
# dependencies from the pipeline defined in turbo.json
turbo run build --filter=admin-*
```

#### Scopes

有些 monorepos 在他们的工作区名称前面加上一个作用域，比如 `@acme/ui` 和 `@acme/app`。只要作用域(`@acme`)在整个代码库中是唯一的，就可以从过滤器中省略它。

```bash
turbo run build --filter=@acme/ui // [!code --]
turbo run build --filter=ui // [!code ++]
```

### 包含匹配工作区的 dependents

有时，您需要确保您的共享包不会影响任何下游依赖项。

如果 `my-app` 依赖于 `my-lib`，`...my-lib` 将选择 `my-app` 和 `my-lib`。

包括 `^` (`...^my-lib`)将选择 `my-lib` 的所有依赖项，但不包括 `my-lib` 本身。

```bash
# 测试 my-lib 以及所有依赖于 my-lib 的内容
turbo run test --filter=...my-lib

# 测试所有依赖于 my-lib 的内容，但不测试 my-lib 本身
turbo run test --filter=...^my-lib
```

### 包含匹配工作区的 dependencies

有时候，您需要确保在您所针对的库的所有依赖项中运行构建。为此，可以使用 `--filter=my-app...` 。

如果 `my-app` 依赖于 `my-lib`，`my-app...` 将选择 `my-app` 和 `my-lib`。

包括 `^` (`my-app^...`)将选择 `my-app` 的所有依赖项，但不包括 `my-app` 本身。

```bash
# Build 'my-app' and its dependencies
turbo run build --filter=my-app...

# Build 'my-app's dependencies, but not 'my-app' itself
turbo run build --filter=my-app^...
```

### 按目录过滤

当你想要定位一个特定的目录，而不是工作区名称时，这个工具非常有用。它支持:

- 完全匹配: `--filter=./apps/docs`
- Globs: `--filter='./apps/*'`

```bash
# Build all of the workspaces in the 'apps' directory
turbo run build --filter='./apps/*'
```

#### 与其他语法组合

将目录筛选器与其他语法组合时，请在`{}`中附上。例如:

```bash
# Build all of the workspaces in the 'libs' directory,
# and all the workspaces that depends on them
turbo run build --filter=...{./libs/*}
```

### 通过更改的工作区进行筛选

您可以在任何工作区上运行任务，这些工作区在某次提交之后发生了更改。这些需要包起来 `[]`。

例如， `--filter=[HEAD^1]` 将选择在最近的提交中更改的所有工作区:

```bash
# Test everything that changed in the last commit
turbo run test --filter=[HEAD^1]
```

#### 检查提交范围

如果您需要检查一个特定的提交范围，而不是与 `HEAD` 进行比较，那么您可以通过 `[<from commit>...<to commit>]` 设置比较的两端。

```bash
# Test each workspace that changed between 'main' and 'my-feature'
turbo run test --filter=[main...my-feature]
```

#### 忽略已更改的文件

在计算哪些工作区发生了更改时，可以使用 `--ignore` 来指定要忽略的更改的文件

#### 与其他语法组合

您还可以在提交引用前添加 `...` 来匹配其他组件与更改后的工作区之间的依赖关系。例如，如果 `foo` 的任何依赖项在上次提交中发生了更改，可以传递 `--filter=foo...[HEAD^1]` 来选择 `foo`。

```bash
# Build everything that depends on changes in branch 'my-feature'
turbo run build --filter=...[origin/my-feature]

# Build '@foo/bar' if it or any of its dependencies
# changed in the last commit
turbo run build --filter=@foo/bar...[HEAD^1]
```

您甚至可以将 `[]` 和 `{}` 语法组合在一起:

```bash
# Test each workspace in the '@scope' scope that
# is in the 'packages' directory, if it has
# changed in the last commit
turbo run test --filter=@scope/*{./packages/*}[HEAD^1]
```

### 工作区根

可以使用 `//` 选择 monorepo 的根。

```bash
# Run the format script from the root "package.json" file:
turbo run format --filter=//
```

### 不包括工作区

前置 `!` 过滤器。整个过滤器中匹配的工作区将被排除在目标集之外。例如，除了 `@foo/bar: --filter=!@foo/bar`。

```bash
# Build everything except '@foo/bar'
turbo run build --filter=!@foo/bar
# Build all of the workspaces in the 'apps' directory, except the 'admin' workspace
turbo run build --filter=./apps/* --filter=!admin
```

### 通过全局 `turbo`

如果您使用的是全局安装版本的 `turbo`，那么从工作区中运行会自动过滤到该工作区的目录。这意味着运行 `turbo run test --filter={./packages/shared}` 等效于运行 `cd packages/shared && turbo run test`。

使用显式命名的工作区运行总是可以在存储库中的任何地方运行: `turbo run test --filter=shared`。
