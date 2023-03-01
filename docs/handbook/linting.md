---
layout: doc
title: Monorepo中的Linting
editLink: false
---

# {{ $frontmatter.title }}

在 monorepo 中起毛可能很棘手。您的大多数工作区可能包含需要 Linted 的代码——因此找到最有效的 Linted 方法非常困难。

在本指南中，我们将提出一种发挥 Turborepo 优势的方法：

- 在工作区内运行 Lint 任务，而不是从 root ;
- 在工作区之间共享尽可能多的配置。

## 运行任务

我们建议在 `turbo.json` 中指定一个 `lint` 任务。

```json
{
  "pipeline": {
    "lint": {}
  }
}
```

然后，在每个需要 `Lint` 的工作区中，添加一个 `lint` 脚本。我们将使用 TypeScript 作为示例:

```json
{
  "scripts": {
    "lint": "tsc"
  }
}
```

这种模式有两个好处：

- 并行化：Lint 任务将同时运行，加速它们
- 缓存：Lint 任务只会在已更改的工作区上重新运行。

意味着您可以使用一个命令 `lint` 您的整个项目:

```bash
turbo run lint
```

## 共享配置文件

在 monorepo 之间共享配置有助于保持开发体验的一致性。大多数 linter 都有一个共享配置或跨不同文件扩展配置的系统。

到目前为止，我们已经建立了共享配置的指南：

- [Typescript](/handbook/linting/typescript)
- [ESLint](/handbook/linting/eslint)
