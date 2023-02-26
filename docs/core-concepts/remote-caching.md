---
layout: doc
title: 远程缓存
editLink: false
---

# {{ $frontmatter.title }}

Turborepo 的任务缓存可以节省很多时间，因为它不会重复做同样的工作。

但有一个问题-缓存是本地的计算机。当你和同事一起工作时，这会导致很多重复的工作:

![](https://qiniucdn2.wangdashuai.top/web-components-note/local-caching.webp)

由于 Turborepo 默认只缓存到本地文件系统，相同的任务( `turbo run build` )必须在每台机器上重新执行(由您、您的队友、您的 CI、您的 PaaS 等) ，即使所有的任务输入都是相同的 -- 这会**浪费时间和资源**。

## 一个单独的共享缓存

如果您可以在整个团队(甚至您的 CI)中共享一个 Turborepo 缓存，那会怎么样？

![](https://qiniucdn2.wangdashuai.top/web-components-note/remote-caching.webp)

通过与 Vercel 等供应商合作，Turborepo 可以安全地与远程缓存(一种存储任务结果的云服务器)进行通信。

这样可以避免整个组织的重复工作，从而节省大量时间。

::: warning
远程缓存是 Turborepo 的一个强大功能，但是伴随着强大的功能而来的是巨大的责任。首先确保缓存正确，然后再次检查环境变量的处理。还请记住 Turborepo 将日志作为工件对待，所以要注意要打印到控制台的内容。
:::

## Vercel

### 本地开发

如果你想把你的本地 Turborepo 链接到你的远程缓存，首先用你的 Vercel 帐户验证 Turborepo CLI:

```bash
turbo login
```

::: warning
如果将远程缓存配置为使用单点登录，则需要运行 `npx turbo login -- sso-team=TEAMNAME`，以获得具有正确权限的缓存令牌。
:::

接下来，将 Turborepo 链接到远程缓存:

```bash
turbo link
```

启用后，对当前缓存的工作区进行一些更改，并使用 `turbo run` 对其运行任务。您的缓存工件现在将存储在本地和远程缓存中。

要验证，删除您的本地 Turborepo 缓存:

::: code-group

```bash [unix]
rm -rf ./node_modules/.cache/turbo
```

```bash [win]
rd /s /q "./node_modules/.cache/turbo"
```

:::

然后再次运行相同的构建。如果工作正常，turbo 不应该在本地执行任务，而应该从远程缓存下载日志和工件并将它们返回给您。

### Vercel Builds 上的远程缓存

如果您正在构建和托管您的应用程序在 Vercel，远程缓存将自动设置为您的代表一旦您使用 Turbo。您需要更新您的构建设置，以使用 Turbo 进行构建。

有关说明，请参考 [Vercel 文档](https://vercel.com/docs/concepts/git/monorepos#turborepo?utm_source=turbo.build&utm_medium=referral&utm_campaign=docs-link)。

### 完整性和真实性验证

您可以使 Turborepo 在将工件上传到远程缓存之前使用秘钥对它们进行签名。Turborepo 使用您提供的秘密密钥对工件使用 `HMAC-SHA256` 签名。Turborepo 将在下载远程缓存工件时验证它们的完整性和真实性。任何未能验证的构件将被忽略，并被 Turborepo 视为缓存丢失。

要启用此特性，请将 `turbo.json` 配置中的 `RemoteCache` 选项设置为 `signature: true`。然后通过声明 `TURBO_REMOTE_CACHE_SIGNATURE_KEY` 环境变量来指定您的密钥。

```json
{
  "$schema": "https://turbo.build/schema.json",
  "remoteCache": {
    // Indicates if signature verification is enabled.
    "signature": true
  }
}
```

## 自定义远程缓存

您可以自行托管您自己的远程缓存或使用其他远程缓存服务提供商，只要他们符合 Turborepo 的远程缓存服务器 API。

您可以通过指定 `--api` 和 `--token` 标志来设置远程缓存域，其中 `--api` 是主机名， `--token` 是承载标记。

```bash
turbo run build --api="https://my-server.example.com" --token="xxxxxxxxxxxxxxxxx"
```