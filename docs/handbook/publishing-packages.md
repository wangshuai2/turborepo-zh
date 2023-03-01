---
layout: doc
title: 包的发布
editLink: false
---

# {{ $frontmatter.title }}

使用合适的工具，从 monorepo 发布一个包到 `npm` 可能是一个非常令人满意和顺利的体验。

如果您希望将 monorepo 的一些工作区作为包发布到 `npm`，则应该遵循这个设置。如果不需要发布到 `npm`，则应该使用内部包，它们更容易设置和使用。

## 工具

你需要设置几个工具来让它工作：

首先，需要一个 `bundler` 将代码转换为 `CommonJS`，这是 `npm` 上最常用的格式。您还需要设置一个 `dev` 脚本，以便您可以在本地开发的工作区中工作。

最后，您还需要一个用于[发布和版本控制](/handbook/publishing-packages/versioning-and-publishing)的工具。这将处理您的 monorepo 的包版本和发布到 npm。
