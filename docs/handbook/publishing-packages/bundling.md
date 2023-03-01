---
layout: doc
title: Monorepo构建包
editLink: false
---

# {{ $frontmatter.title }}

与内部包不同，外部包可以部署到 `npm` 并在本地使用。在本指南中，我们将使用 `bunlder` 将包绑定到 `CommonJS`，这是 `npm` 上最常用的格式。

## 建立一个构建脚本

让我们从使用[内部包教程](/handbook/sharing-code/internal-packages)创建的包开始。

在那里，我们创建了一个 `math-helpers` 包，其中包含了一些用于加法和减法的 `helpers` 函数。我们认为这个包对于 npm 来说已经足够好了，所以我们将对其进行 `bunlder`。

在该教程的最后，我们在 `/packages` 下设置了一个包，它看起来是这样的：

```
├── apps
│   └── web
│       └── package.json
├── packages
│   └── math-helpers
│       ├── src
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
├── package.json
└── turbo.json
```

我们将使用一个 `bunlder` 为 `math-helpers` 添加一个 `build` 脚本。如果您不确定该选择哪一个，我们建议 [tsup](https://tsup.egoist.dev/)。

---

第一次安装，在 `packages/math-helpers` 里使用软件包管理器的 `tsup` 。
::: code-group

```json [tsup]
{
  "scripts": {
    "build": "tsup src/index.ts --format cjs --dts"
  }
}
```

:::

`tsup` 默认将文件输出到 `dist` 目录，因此您应该:

1. 将 `dist` 添加到 `.gitignore` 文件中，以确保它们不是由 git 提交的；
2. 将 `dist` 添加到 `turbo.json` 中的 `build` 输出中。

```json
{
  "pipeline": {
    "build": {
      "outputs": ["dist/**"]
    }
  }
}
```

这样，在运行 `tsup` 时，输出可以由 Turborepo 缓存。

我们应该将 `main` 更改为指向 `package.json` 中的 `./dist/index.js`。`types`可以指向 `./dist/index.d.ts`：

```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

::: warning
如果您在使用 `main` 和 `types` 时遇到错误，请查看 `tsup` 文件！
:::

### 在运行之前构建我们的软件包

在我们 `turbo run build` 之前，有一件事我们需要考虑。

我们刚刚在 monorepo 中添加了一个任务依赖项。构建 `packages/math-helpers` 需要在构建 `apps/web` 之前运行。

幸运的是，我们可以使用 `dependsOn` 轻松地配置它。

```json
{
  "pipeline": {
    "build": {
      "dependsOn": [
        // Run builds in workspaces I depend on first
        "^build"
      ]
    }
  }
}
```

现在，我们可以运行 `turbo run build`，它会在构建我们的 `app` 之前自动构建我们的包。

## 设置开发脚本

我们的设置有个小问题。我们正在构建我们的软件包，但是它在 dev 中并不是很好。

我们对 `math-helpers` 包所做的更改没有反映在我们的应用程序中，这是因为我们没有一个可以在工作期间重建包的 `dev` 脚本。

我们可以很容易地添加一个：

::: code-group

```json [tsup]
// packages/math-helpers/package.json

{
  "scripts": {
    "build": "tsup src/index.ts --format cjs --dts",
    "dev": "npm run build -- --watch"
  }
}
```

:::

如果我们已经在 `turbo.json` 中设置了 `dev` 脚本，那么运行 `turbo run dev` 将与我们 `app/web` 的 `dev` 任务并行运行我们 `packages/math` 的开发任务。
