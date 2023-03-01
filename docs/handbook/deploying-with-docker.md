---
layout: doc
title: 使用Docker构建你的应用
editLink: false
---

# {{ $frontmatter.title }}

构建 [Docker](https://www.docker.com/) 映像是部署各种应用程序的常用方法。然而，这样做，从一个单一的挑战。

## 问题

TL;DR: 在 monorepo 中，不相关的更改会使 Docker 在部署 app 时做不必要的工作。

你有一个像这样的 monorepo：

```
├── apps
│   ├── docs
│   │   ├── server.js
│   │   └── package.json
│   └── web
│       └── package.json
├── package.json
└── package-lock.json
```

您希望使用 Docker 部署 `apps/docs` ，因此需要创建 Dockerfile:

```
# Dockerfile
FROM node:16

WORKDIR /usr/src/app

# Copy root package.json and lockfile
COPY package.json ./
COPY package-lock.json ./

# Copy the docs package.json
COPY apps/docs/package.json ./apps/docs/package.json

RUN npm install

# Copy app source
COPY . .

EXPOSE 8080

CMD [ "node", "apps/docs/server.js" ]
```

这将把 root 目录下 `package.json` 和 root 下的 lockfile 复制到 docker 映像。然后，它会安装依赖项，复制应用程序源代码并启动应用程序。

您还应该创建一个 `.dockerignore` 文件，以防止 `node_modules` 与应用程序的源代码一起复制进来。

```
# .dockerignore
node_modules
npm-debug.log
```

### lockfile 文件的变化

Docker 在如何部署应用程序方面非常聪明。就像 Turbo 一样，它尝试做尽可能少的工作。

在我们 Dockerfile 的例子中，它只会在其映像中的文件与前一次不同的情况下运行 `npm install`。如果没有，它将恢复之前的 `node_module` 目录。

这意味着只要 `package.json`、` apps/docs/package.json` 或 `package-lock.json` 发生变化，`docker` 映像就会运行 `npm install`。

这听起来很棒——直到我们意识到一些事情。`package-lock.json` 是 Monorepo 的全球代表。这意味着如果我们在 `apps/web` 中安装一个新的软件包，我们将导致 `apps/docs` 重新部署。

在大型 monorepo 中，这会导致大量的时间损失，因为对 monorepo 的锁文件的任何更改都会级联成数十或数百个部署。

## 解决方案

解决方案是将 Dockerfile 的输入删减为严格且必要的内容。Turborepo 提供了一个简单的解决方案—`turbo prune`。

```bash
turbo prune --scope="docs" --docker
```

运行此命令将在 `./out` 目录中创建 monorepo 的修剪版本。它只包括 `docs` 所依赖的工作区。

重要的是，它还删减了 lockfile，以便只下载相关的 `node_modules`。

### `--docker` 标识

默认情况下，`turbo prune` 会将所有相关文件放入 `./out` 中。但是，为了优化 Docker 的缓存，理想情况下，我们希望分两个阶段复制文件。

首先，我们希望只复制安装软件包所需的内容。当运行 `--docker` 时，你会在里面发现这个 `./out/json`。

```
out
├── json
│   ├── apps
│   │   └── docs
│   │       └── package.json
│   └── package.json
├── full
│   ├── apps
│   │   └── docs
│   │       ├── server.js
│   │       └── package.json
│   ├── package.json
│   └── turbo.json
└── package-lock.json
```

然后，您可以将文件复制到 `./out/full` 中以添加源文件。

以这种方式分割依赖项和源文件使我们只能在依赖项发生变化时运行 `npm install` ——这使我们获得了更大的加速效果。

::: info
如果没有 `--docker`，则所有被删除的文件都放在 `./out` 中。
:::

### 示例

我们详细的 `with-docker` 示例深入介绍了如何充分利用修剪功能。这是 Dockerfile，为了方便起见，复制过来了。

```
FROM node:alpine AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=web --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:alpine AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install

# Build the project
COPY --from=builder /app/out/full/ .
RUN yarn turbo run build --filter=web...

FROM node:alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/web/next.config.js .
COPY --from=installer /app/apps/web/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

CMD node apps/web/server.js
```

## 远端缓存

要在 Docker 构建期间利用远程缓存，您需要确保构建容器具有访问远程缓存的凭据。

有许多方法来照顾 Docker 图像中的秘密。我们将在这里使用一个简单的策略，使用秘密作为构建参数进行多级构建，最终图像将隐藏这些参数。

假设您使用的 Dockerfile 与上面的类似，我们将在 `turbo build` 之前从 `build` 参数中引入一些环境变量:

```
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

RUN yarn turbo run build --filter=web...
```

`turbo` 现在可以你的远程缓存了。要查看未缓存的 Docker 构建映像的 Turborepo 缓存命中情况，请在项目根目录中运行如下命令:

```bash
docker build -f apps/web/Dockerfile . --build-arg TURBO_TEAM=“your-team-name” --build-arg TURBO_TOKEN=“your-token“ --no-cache
```
