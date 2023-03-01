---
layout: doc
title: 疑难解答
editLink: false
---

# {{ $frontmatter.title }}

## 处理不匹配的软件包版本

随着 monorepo 的增长，您可能会在不同的工作区中使用不同版本的软件包。

例如，`app` 可能使用 `react@18.0.0`，但是 `web` 可以使用 `react@17.0.0`。当您刚从一个 multi-repo 设置迁移过来时，这一点尤其明显。

不同存储库中的不匹配依赖关系可能意味着代码会意外运行。例如，如果安装了多个版本，React 就会出错。

### `@manypkg/cli`

我们推荐的处理这个问题的方法是使用 [`@manypkg/cli`](https://www.npmjs.com/package/@manypkg/cli) —— 一个 CLI 可以确保您的依赖关系在您的存储库中匹配。

这里有一个简单的例子。在 `package.json` 的根目录中，添加一个 `postinstall` 脚本。

```json
{
  "scripts": {
    // 这将检查您的依赖项匹配
    // 每次安装后
    "postinstall": "manypkg check"
  },
  "dependencies": {
    // 确保你安装了 @manypkg/cli
    "@manypkg/cli": "latest"
  }
}
```

您还可以运行 `manypkg fix` 来自动更新整个存储库。
