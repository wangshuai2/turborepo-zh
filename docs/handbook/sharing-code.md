---
layout: doc
title: Monorepo 代码共享
editLink: false
---

# {{ $frontmatter.title }}

Monorepos 允许您在应用程序之间共享代码，而不会互相印象。要做到这一点，你需要构建软件包来在你的应用程序之间共享代码。

## 什么是包 package？

“package”这个词有双重含义，当它涉及到 monorepos。它可以指这两种情况之一：

1. 通过像 `npm` 这样的包管理器从注册表下载到 `node_modules` 中的一组文件。
2. 包含可在应用程序之间共享的代码的工作区——通常是在 `/packages`。

这种双重含义可能会让刚接触 monorepo 场景的人感到非常困惑。您可能非常熟悉软件包安装，但不太熟悉工作区。

事实上他们非常相似。包只是一段共享代码。除了已安装的包位于 `node_modules` 中，本地包位于工作区中——很可能位于 `/packages` 文件夹中。

## 包结构

每个包包含一个 `package.json`。您可能熟悉使用这些工具来管理应用程序中的依赖项和脚本。

不过，你可能没有注意到之前的 `main` 和 `name` 字段：

```json
{
  // The name of your package
  "name": "my-lib",

  // When this package is used, this file is actually
  // the thing that gets imported
  "main": "./index.js"
}
```

这两个字段对于决定这个包在导入时的行为非常重要。例如，如果 `index.js` 有一些导出:

```js
export const myFunc = () => {
  console.log('Hello!')
}
```

然后我们将这个文件导入到我们的一个应用程序中：

```jsx
import { myFunc } from 'my-lib'

myFunc() // Hello!
```

然后我们就可以在应用程序中使用 `my-lib` 文件夹中的代码了。

总而言之，每个包必须在其 `package.json` 中声明一个 `name` 和一个 `main`。

::: info
`package.json` 中的包解析是一个非常复杂的话题，我们在这里无法对其进行公正的处理。

`package.json` 中的其他字段可能优先于 `main`，这取决于包的导入方式。

检查 `npm` 文档的指南，对于我们的使用 `main` 将是足够好的。
:::

## 接下来

我们将介绍两种类型的软件包-内部软件包和外部软件包:

[内部包](/handbook/sharing-code/internal-packages) 只能用于 monorepo 内部。它们的设置相对简单，如果您的项目是封闭源代码的，那么它们对您来说将是最有用的。

[外部包](/handbook/publishing-packages) 被打包并发送到包注册中心。这对于设计系统、共享实用程序库或任何开源工作都很有用。然而，它们在捆绑、版本控制和发布方面引入了更多的复杂性。
