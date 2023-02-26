---
layout: doc
title: 跳过任务
editLink: false
---

# {{ $frontmatter.title }}

构建缓存可以极大地加速您的任务-但是您可以通过使用 `npx turbo-ignore` 来做得更好。如果您的工作区不受代码更改的影响，则可以完全跳过执行任务。

假设您希望在您的 `web` 应用程序(或其包依赖项)没有任何更改时跳过 `web` 工作区的单元测试。如果您已经在使用[远程缓存](/core-concepts/remote-caching) ，您可能会得到一个缓存命中，但您仍然需要花费时间配置 CI 容器，安装 `npm` 依赖项，以及其他可能需要一段时间的事情。

理想情况下，我们会做一个快速检查，看看是否有任何工作需要在第一个地方发生。

在我们检查完回购之后，但是在进行其他工作之前，我们可以花几秒钟来检查自从父提交以来我们的 `web` 测试是否发生了变化。

```bash
npx turbo-ignore web --task=test
```

这个命令将:

- 过滤 `web` 工作区。
- 与父提交相比，为 `test` 任务创建 `dry` 输出。
- 解析输出以确定哪些包已更改。
- 如果检测到更改，则以 `1` 代码退出。否则，以 `0` 退出。

虽然您可能已经能够命中一个 `>>> FULL TURBO` 缓存为这个任务，我们只是节省时间与所有其他设置任务需要运行您的 CI。

## 使用 `turbo-ignore`

要跳过未受影响的工作，首先要确保您的 git 历史记录在计算机上可用。

`turbo-ignore` 使用 `--filter` 和 `--dry=json` 标志的组合来查找从父提交到当前提交的更改，以识别受影响的包。默认情况下，`turbo-ignore` 会在当前工作目录中找到构建任务的不同之处，但是您可以使用标志自定义这种行为。

下面是将要构建和运行的命令的一个示例:

```bash
npx turbo run build --filter=@example/web...3c8387ffd98b751305fe3f0284befdd00cbd4610 --dry=json
```

请注意，模拟运行不执行生成任务。相反，它会检查您的包，看看您的代码更改是否会在几秒钟内影响您的构建(或其他任务)。

如果 `turbo-ignore` 发现可以跳过该任务，它将以 0 代码退出流程。如果发现更改，则进程将退出为 1。

## 定制行为

若要指定工作区，可以将其添加到命令中，如下所示:

```bash
npx turbo-ignore web
```

其中 `web` 是你的工作空间的名称。

如果您想更改更多的默认行为，有几个标志可用:

- `--task`: 指定 `turbo-ignore` 将调用的命令的任务，默认是 `build` 。
- `--falback`: 指定要比较的 `ref/HEAD`。默认值为 `HEAD^` 。

## 在 Vercel 中使用 `turbo-ignore`

要在 Vercel 上使用 `npx turbo-ignore`，您可以使用 [Ignored Build Step](https://vercel.com/docs/concepts/projects/overview#ignored-build-step) 特性。Vercel 将自动推断出正确的参数，以成功运行 `turbo-ignore`。
