---
layout: doc
title: 缓存任务
editLink: false
---

# {{ $frontmatter.title }}

每个 `JavaScript` 或 `TypeScript` 代码库都需要运行 `package.json` 脚本，比如 `build`、 `test` 和 `lint`。在 Turborepo，我们称这些任务为。

Turborepo 可以缓存任务的结果和日志，从而为缓慢的任务带来巨大的加速。

## 缺少缓存

代码库中的每个任务都有输入和输出。

- `build` 任务可能将源文件作为输入并将日志输出到 `stderr` 和 `stdout` 以及绑定文件。
- `lint` 或 `test` 任务可能将源文件作为输入并将日志输出到 `stdout` 和 `stderr`。

假设您使用 Turborepo 运行一个 `build` 任务，使用 `turbo run build`:

![](https://qiniucdn2.wangdashuai.top/web-components-note/cache-miss.webp)

- Turborepo 将评估任务的输入(默认情况下是工作区文件夹中所有非 git 忽略的文件) ，并将它们转换为散列(例如 78awdk123)。
- 检查本地文件系统缓存中用 hash 命名的文件夹(例如 `./node_module/.cache/turbo/78awdk123` )。
- 如果 Turborepo 没有找到任何与计算散列匹配的工件，那么 Turborepo 将*执行该任务*。
- 一旦任务完成，Turborepo 将所有*输出*(包括文件和日志)保存到散列下的缓存中。

::: info
Turborepo 在创建 hash-source 文件、环境变量甚至相关工作区的源文件时考虑了大量信息。
:::

## 命中缓存

假设您在不更改任何输入的情况下再次运行任务:
![](https://qiniucdn2.wangdashuai.top/web-components-note/cache-hit.webp)

- `hash` 是相同的，因为输入没有改变(例如 `78awdk123` )
- Turborepo 将在其缓存中找到具有计算散列的文件夹(例如 `./node_module/.cache/turbo/78awdk123` )
- Turborepo 不运行任务，而是重放输出——将保存的日志打印到 `stdout`，并将保存的输出文件恢复到文件系统中各自的位置。

从缓存还原文件和日志几乎是瞬间发生的。这可以将构建时间从几分钟或几小时降低到几秒或几毫秒。虽然具体的结果取决于代码库依赖关系图的形状和粒度，但是大多数团队发现使用 Turborepo 的缓存可以将每月的构建时间减少 _40-85%_ 。

## 配置缓存输出 `outputs`

使用 `pipeline` ，您可以跨 Turborepo 配置缓存约定。

若要重写默认的缓存输出行为，请将一个 globs 数组传递给 `pipeline.<task>.outputs` 。任何满足任务的通配符模式的文件都将被视为工件。

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "outputs": [".next/**", "!.next/cache/**"],
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

如果您的任务没有发出任何文件(例如使用 Jest 的单元测试) ，您可以省略输出。即使没有任何文件输出，Turborepo 也会自动记录和缓存每个任务的日志。如果没有输入变化(例如，如果有一个缓存命中) ，随后的运行将重播这些日志。

当您运行 `turbo run build test` 时，Turborepo 将执行您的 `build` 和测试脚本，并将它们的输出缓存到 `./node_module/.cache/turbo` 。

::: info
缓存 ESLint 的提示: 通过在 ESLint 之前设置 `TIMING = 1` 变量，您可以获得一个可缓存的漂亮终端输出(即使对于非错误)。在 [ESLint](https://eslint.org/docs/latest/developer-guide/working-with-rules#per-rule-performance) 文档中了解更多信息。
:::

## 配置缓存输入 `inputs`

当工作区中的任何文件发生更改时，将认为该工作区已更新。但是，对于某些任务，我们只希望在相关文件发生更改时重新运行该任务。通过指定 `inputs` ，我们可以定义与特定任务相关的文件。例如，下面的 `test` 配置中，如果自上次执行以来，确定 `src/` 和 `test/` 子目录中的 `.tsx` 或 `.ts` 文件是否已经更改。

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    // ... omitted for brevity

    "test": {
      // A workspace's `test` task depends on that workspace's
      // own `build` task being completed first.
      "dependsOn": ["build"],
      // A workspace's `test` task should only be rerun when
      // either a `.tsx` or `.ts` file has changed.
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"]
    }
  }
}
```

## 关闭缓存

有时你真的不想写缓存输出(例如，当你使用 `next dev` 或者 `react-scripts start` 实时重新加载)。若要禁用缓存写，请将 `--no-cache` 附加到任何命令:

```bash
turbo run dev --no-cache
```

请注意 `--no-cache` 禁用缓存写操作，但不禁用缓存读操作。如果要禁用缓存读取，请使用 `--force` 标志。

您还可以通过设置 `pipeline` 来禁用特定任务的缓存 `pipeline.<task>.cache` :

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## 基于文件更改的缓存

对于某些任务，如果不相关的文件已更改，则可能不希望缓存丢失。例如，更新 `README.md` 可能不需要触发 `test` 任务的缓存丢失。您可以使用输入来限制 `turbo` 为特定任务考虑的文件集。在这种情况下，只考虑 `.ts` 还有 `.tsx` 文件与确定 `test` 任务的缓存命中率相关:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    // ...other tasks
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"]
    }
  }
}
```

`package.json` 始终被认为是其所在工作空间中的任务的输入。这是因为任务本身的定义存在于 `package.json` 中 `script` 键。如果更改该值，任何缓存的输出都将被视为无效。

如果希望所有任务都依赖于某些文件，可以在 `globalDependency` 数组中声明此依赖项。

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"], // [!code ++]
  "pipeline": {
    // ...other tasks
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"]
    }
  }
}
```

::: info
`turbo.json` 总是被认为是一个全局依赖项，如果修改 `turbo.json`，所有缓存都将失效。
:::

## 基于环境变量改变缓存

当你在编译时使用 `turbo` 和内联环境变量时(例如 `Next.js` 或 `Create React App`)，告诉 `turbo` 这一点很重要。否则，您可能会发布带有错误环境变量的缓存构建！

您可以根据环境变量的值来控制 `turbo` 的缓存行为:

- 在 `pipeline` 定义中的 `env` 键中包含环境变量，将影响基于每个任务或每个工作空间任务的缓存。
- 任何名称中包含 `THASH` 的环境变量的值都会影响所有任务的缓存指纹。

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      // env vars will impact hashes of all "build" tasks
      "env": ["SOME_ENV_VAR"],
      "outputs": ["dist/**"]
    },

    // override settings for the "build" task for the "web" app
    "web#build": {
      "dependsOn": ["^build"],
      "env": [
        // env vars that will impact the hash of "build" task for only "web" app
        "STRIPE_SECRET_KEY",
        "NEXT_PUBLIC_STRIPE_PUBLIC_KEY",
        "NEXT_PUBLIC_ANALYTICS_ID"
      ],
      "outputs": [".next/**"]
    }
  }
}
```

::: info
不推荐在 `dependsOn` 配置中以 `$` 前缀声明环境变量。
:::

要更改所有任务的缓存，可以在 `globalEnv` 数组中声明环境变量:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      // env vars will impact hashes of all "build" tasks
      "env": ["SOME_ENV_VAR"],
      "outputs": ["dist/**"]
    },

    // override settings for the "build" task for the "web" app
    "web#build": {
      "dependsOn": ["^build"],
      "env": [
        // env vars that will impact the hash of "build" task for only "web" app
        "STRIPE_SECRET_KEY",
        "NEXT_PUBLIC_STRIPE_PUBLIC_KEY",
        "NEXT_PUBLIC_ANALYTICS_ID"
      ],
      "outputs": [".next/**"]
    }
  },
  "globalEnv": [
    // [!code ++]
    "GITHUB_TOKEN" // env var that will impact the hashes of all tasks, // [!code ++]
  ] // [!code ++]
}
```

### 自动包含环境变量

为了确保跨环境的正确缓存，Turborepo 在计算使用检测到的框架构建的应用程序的缓存键时，会自动推断并包含公共环境变量。您可以安全地从 `turbo.json` 中省略特定于框架的公共环境变量:

```json
{
  "pipeline": {
    "build": {
      "env": [
        "NEXT_PUBLIC_EXAMPLE_ENV_VAR" // [!code --]
      ]
    }
  }
}
```

请注意，这种自动检测和包含只有在 Turborepo 成功推断出您的应用程序所使用的框架时才有效。Turborepo 将检测并包含在缓存键中的支持框架和环境变量:

- Astro: `PUBLIC_*`
- Blitz: `NEXT_PUBLIC_*`
- Create React App: `REACT_APP_*`
- Gatsby: `GATSBY_*`
- Next.js: `NEXT_PUBLIC_*`
- Nuxt.js: `NUXT_ENV_*`
- RedwoodJS: `REDWOOD_ENV_*`
- Sanity Studio: `SANITY_STUDIO_*`
- Solid: `VITE_*`
- SvelteKit: `VITE_*`
- Vite: `VITE_*`
- Vue: `VUE_APP_*`

::: info
上面的列表有一些例外。由于各种原因，CI 系统(包括 Vercel)设置了以这些前缀开始的环境变量，即使它们不是构建输出的一部分。这些可以不可预测地改变——即使在每个构建上！使 Turborepo 的缓存失效。为了解决这个问题，Turborepo 使用了一个 `TURBO_CI_VENDOR_ENV_KEY` 变量来从 Turborepo 的推断中排除环境变量。

例如，Vercel 设置 `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`。该值在每次构建时都会更改，因此 Vercel 还设置 `TURBO_CI_VENDOR_ENV_KEY = "NEXT_PUBLIC_VERCEL_"` 以排除这些变量。

幸运的是，您只需要在其他构建系统上注意这一点，在 Vercel 上使用 Turborepo 时不需要担心这些边缘情况。
:::

#### 关于 Monorepos 的笔记

环境变量将只包含在使用该框架的工作区中的任务的 `cache` 键中。换句话说，为 `Next.js` 应用推断的环境变量将只包含在作为 `Next.js` 应用检测到的工作区的缓存键中。Monorepo 中其他工作区中的任务不会受到影响。

例如，考虑一个具有三个工作区的 monorepo: 一个 `Next.js` 项目、一个 `Create React App`项目和一个 `TypeScript` 包。每个都有一个构建脚本，两个应用程序都依赖于 `TypeScript` 项目。假设这个 Turborepo 有一个标准的 `turbo.json` 管道，按顺序构建它们:

```json
{
  "pipeline": {
    "build": {
      "outputs": [".next/**", "!.next/cache/**" "dist/**"],
      "dependsOn": ["^build"]
    }
  }
}
```

从 1.4 开始，当您运行 `turbo run build` 时，Turborepo 在构建 TypeScript 包时不会考虑任何与构建时环境相关的变量。然而，在构建 NEXT.js 应用程序时，Turborepo 会计算散列时，推断以 `NEXT_PUBLIC_` 开头的环境变量，包括 `.next`。类似地，在计算 Create REACT App 的构建脚本的散列时，将包含以 `REACT_APP_PUBLIC_` 开始的所有构建时环境变量。

### `eslint-config-turbo`

为了进一步帮助检测潜入到构建中的看不见的依赖关系，并帮助确保 Turborepo 缓存在每个环境中正确共享，请使用 `eslint-config-turbo` 包。虽然自动环境变量包含应该涵盖大多数框架的大多数情况，但是这个 ESLint 配置将为使用其他构建时内联环境变量的团队提供即时反馈。这也将有助于支持团队使用我们无法自动检测的内部框架。

首先，从根 `eslintrc` 文件中的 `eslint-config-turbo` 扩展:

```json
{
  // Automatically flag env vars missing from turbo.json
  "extends": ["turbo"]
}
```

为了更好地控制规则，您可以直接安装和配置 `eslint-plugin-turbo` 插件，首先将其添加到插件中，然后配置所需的规则:

```json
{
  "plugins": ["turbo"],
  "rules": {
    // Automatically flag env vars missing from turbo.json
    "turbo/no-undeclared-env-vars": "error"
  }
}
```

如果您在代码中使用了没有在 `turbo.json` 中声明的与框架无关的环境变量，那么这个插件会发出警告。

### 看不见的环境变量

由于 Turborepo 在您的任务之前运行，因此在 turbo 已经计算了特定任务的散列之后，您的任务可以创建或变更环境变量。例如，考虑一下 `package.json`:

```json
{
  "scripts": {
    "build": "NEXT_PUBLIC_GA_ID=UA-00000000-0 next build"
  }
}
```

Turbo 在执行 `build` 脚本之前计算了一个任务散列，将无法发现 `NEXT_PUBLIC_GA_ID` 环境变量，因此无法根据其值对缓存进行分区。在调用 turbo 之前，一定要确保所有的环境变量都已经配置好了！

```json
{
  "$schema": "https://turborepo.org/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "env": ["SOME_ENV_VAR"],
      "outputs": [".next/**"]
    }
  }
}
```

### 使用 `dotenv`

框架通常使用 [dotenv](https://github.com/motdotla/dotenv) 在开发服务器启动或创建构建时自动加载环境变量。这使得 Turborepo 很难理解你默认的工作环境:

- `dotenv` 将环境变量存储在一个文件中，而不是存储在环境中
- 这个文件是在 Turborepo 已经开始执行任务之后加载的
- 有时文件被 git 忽略，所以即使没有指定输入，Turborepo 也无法检测到更改

若要确保最终为任务提供了正确的缓存行为，请添加 `.env` 文件到 `globalDependency` 键:

```json
{
  "$schema": "https://turborepo.org/schema.json",
  "globalDependencies": ["**/.env.*local"], // [!code ++]
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "env": ["SOME_ENV_VAR"],
      "outputs": [".next/**"]
    }
  }
}
```

或者，可以将特定的环境变量添加到特定任务的 `inputs` 键中。

## 强制覆盖缓存

相反，如果希望禁用读取缓存并强制 `turbo` 重新执行先前缓存的任务，请添加 `--force` 标志:

```bash
turbo run build --force
```

请注意 —— 强制禁用缓存读操作，但不禁用缓存写操作。如果要禁用缓存写，请使用 `--no-cache` 标志。

## 日志

Turbo 不仅缓存任务的输出，还将终端输出(即合并 `stdout` 和 `stderr`)记录到( `<package>/.turbo/run-<command>.log`)。当 `turbo` 遇到一个缓存的任务时，它将重新输出，就像它再次发生一样。

## Hashing

现在，您可能想知道 Turbo 是如何决定给定任务的缓存命中和未命中的。

首先，`turbo` 构造代码库当前全局状态的 `hash` 表:

- 满足 global 模式的任何文件的内容以及 `globalDependency` 中列出的任何环境变量的值
- 排序后的列表环境变量在名称中任意位置包含 `THASH` 的 `key-value` (例如 `STRIPE_PUBLIC_THASH_SECRET_KEY`，但不包括 `STRIPE_PUBLIC_KEY`)

然后，它添加了更多与给定工作空间的任务相关的因素:

- hash 文件夹中所有受版本控制的文件的内容或与输入 globs 匹配的文件(如果存在)
- 所有内部依赖项的哈希表
- pipeline 中指定的 `outputs` 选项
- 在工作区的 `package.json` 中从根锁文件指定的所有 `dependencies`, `devDependencies`, 和 `optionalDependencies` 的解析版本集
- 工作区任务的名称
- 对应于适用 `pipeline.<task-or-package-task>.dependsOn` 中的环境变量环境变量名称的已排序的键-值对列表。

一旦 `turbo` 在执行时遇到给定工作区的任务，它就会检查缓存(本地和远程)以获得匹配的散列。如果匹配，则跳过执行该任务，将缓存的输出移动或下载到适当位置，并立即重播以前记录的日志。如果缓存中没有任何东西(本地或远程)匹配计算的哈希，`turbo` 将在本地执行任务，然后使用哈希作为索引缓存指定的输出。

给定任务的散列在执行时被注入为一个环境变量的 `TURBO_HASH`。这个值可以用于加盖输出或标记 `Dockerfile` 等。

::: warning
对于 `turbo` v0.6.10，当使用 `npm` 或 `pnpm` 时，`turbo` 的哈希算法与上述算法略有不同。当使用这两个包管理器中的任何一个时，`turbo` 将在其针对每个工作区任务的哈希算法中包含锁文件的哈希内容。它不会像当前 `yarn` 实现那样解析/计算所有依赖项的解析集。
:::
