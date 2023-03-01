---
layout: doc
title: Monorepo中的Testing
editLink: false
---

# {{ $frontmatter.title }}

与 `linting` 和构建一样，测试也是生产就绪 monorepo 的重要组成部分。无论您使用的是端到端测试还是单元测试套件，将它们与 Turborepo 集成将带来巨大的速度提升。

## 运行测试任务

假设我们有一个 monorepo，看起来像这样：

```
├── apps
│   └── web
│       └── package.json
└── packages
    └── shared
        └── package.json

```

`apps/web` 和 `packages/shared` 都有自己的测试套件。它们的 `package.json` 文件是这样的：

::: code-group

```json [Jest]
// apps/web/package.json
{
  "scripts": {
    "test": "jest"
  }
}
```

```json [Vitest]
// apps/web/package.json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

:::

在 `root` 的 `turbo.json` 中，我们建议您在 `pipeline` 中设置一个 `test` 任务:

```json
{
  "pipeline": {
    "test": {}
  }
}
```

现在，您可以运行 `turbo test` 并让 Turborepo 测试整个存储库。

由于 Turborepo 的缓存，这也意味着只有修改过文件的存储库才会被测试 —— 从而节省了大量时间。

## 监听模式下运行 `test`

当您正常运行测试套件时，它会完成并输出到 `stdout`。这意味着你可以用 Turborepo 缓存它。

但是，当您在监视模式下运行测试时，进程永远不会退出。这使得监视任务更像是一个开发任务。

由于这种差异，我们建议指定两个单独的 Turborepo 任务：一个用于运行测试，另一个用于在监视模式下运行它们。

下面是一个例子：

::: code-group

```json [Jest]
// apps/web/package.json

{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

```json [Vitest]
// apps/web/package.json

{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

:::

::: code-group

```json [turbo.json]
{
  "pipeline": {
    "test": {},
    "test:watch": {
      "cache": false
    }
  }
}
```

:::

::: code-group

```json [package.json]
{
  "scripts": {
    "test": "turbo run test",
    "test:watch": "turbo run test:watch"
  }
}
```

:::
