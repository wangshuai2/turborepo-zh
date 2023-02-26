---
layout: doc
title: 配置工作区
editLink: false
---

# {{ $frontmatter.title }}

大多数 monorepos 可以使用适用于所有工作区的 `pipeline` 在根目录中声明 `turbo.json`。有时，monorepo 可能包含需要以不同方式配置任务的工作空间。为了适应这种情况，从版本 1.8 开始，Turborepo 允许您在任何工作区中使用 `turbo.json` 扩展根配置。这种灵活性使一组更多样化的应用程序和软件包能够共存，并允许工作空间所有者在不影响 monorepo 的其他应用程序和软件包的情况下维护专门的任务和配置。

## 它是如何工作的

要覆盖根 `turbo.json` 中定义的任何任务的配置，在 monorepo 的任何工作区中添加一个 `turbo.json` 文件，并使用顶级 `extends` 键:

```json
// apps/my-app/turbo.json
{
  "extends": ["//"],
  "pipeline": {
    "build": {
      // custom configuration for the build task in this workspace
    },
    // new tasks only available in this workspace
    "special-task": {}
  }
}
```

::: warning
目前，`extends` 键的唯一有效值是 `["//"]`。`//`是一个特殊名称，用于标识 monorepo 的根目录。
:::

工作区中的配置可以重写 `pipeline` 的任何配置。如果不包含配置，则配置将从扩展的 `turbo.json` 继承。

## Examples

为了说明这一点，让我们看看一些用例。

### 不同的框架

假设 monorepo 有多个 `Next.js` 应用程序和一个 `SvelteKit` 应用程序。这两个框架都使用各自的 `package.json` 中的 `build` 脚本创建它们的构建输出。您可以将 Turborepo 配置为在根目录下使用单个 `turbo.json` 运行这些任务，如下所示:

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "outputs": [".next/**", ".svelte-kit/**"]
    }
  }
}
```

请注意。`.next/**` 及 `.svelte-kit/**` 需要指定 `outputs`，即使 `Next.js` 应用程序不生成。`Svelte-kit` 目录，依然如此。使用 Workspace Configuration，您可以在 `apps/my-svelte-kit-app/turbo.json` 中的 `SvelteKit` 工作区中添加自定义配置:

```json
// apps/my-svelte-kit-app/turbo.json
{
  "extends": ["//"],
  "pipeline": {
    "build": {
      "outputs": [".svelte-kit/**"]
    }
  }
}
```

并从根配置中删除该配置:

```json
{
  "pipeline": {
    "build": {
      "outputs": [".next/**", ".svelte-kit/**"] // [!code --]
      "outputs": [".next/**"] // [!code ++]
    }
  }
}
```

这不仅使每个配置更容易阅读，而且使配置更接近于使用它的位置。

### 特殊任务

在另一个例子中，假设一个工作区中的 `build` 任务`dependsOn`一个`compile`任务。您可以通用地将其声明为 `dependsOn: ["compile"]`。这意味着您的根 `turbo.json` 必须有一个空的 `compile` 任务条目:

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["compile"]
    },
    "compile": {}
  }
}
```

使用 Workspace Configuration，您可以将 `compile` 任务移动到 `apps/my-custom-app/turbo.json`。

```json
// apps/my-app/turbo.json
{
  "extends": ["//"],
  "pipeline": {
    "build": {
      "dependsOn": ["compile"]
    },
    "compile": {}
  }
}
```

把它从根部移除:

```json
{
  "pipeline": {
    "build": {} // [!code ++]
    "build": { // [!code --]
      "dependsOn": ["compile"] // [!code --]
    }, // [!code --]
    "compile": {} // [!code --]
  }
}
```

现在，`my-app` 的所有者，可以拥有 `build` 任务的完全所有权，但是继续继承在根目录中定义的任何其他任务。

## 与特定于工作区的任务的比较

乍一看，Workspace Configuration 可能听起来很像根 `turbo.json` 中的 `workspace#task` 语法。这些特性是相似的，但有一个显著的区别: 当您在根 `turbo.json` 中声明一个特定于 Workspace 的特性时，它会完全覆盖基线任务配置。使用 Workspace Configuration，则合并任务配置。

再考虑一下 monorepo 与多个 Next.js 应用程序和一个 Sveltekit 应用程序的例子。如果没有特定于工作区的任务，您可以像下面这样配置您的根 `turbo.json`:

```json
{
  "pipeline": {
    "build": {
      "outputMode": "hash-only",
      "inputs": ["src/**"],
      "outputs": [".next/**"]
    },
    "my-sveltekit-app#build": {
      "outputMode": "hash-only", // must duplicate this
      "inputs": ["src/**"], // must duplicate this
      "outputs": [".svelte-kit/**"]
    }
  }
}
```

在本例中，`my-sveltekit-app#build` 完全覆盖了 Sveltekit 应用程序的 `build`，因此 `outputMode` 和 `inputs` 也需要重复。

对于 Workspace Configuration，`outputMode` 和 `inputs` 是继承的，因此不需要复制它们。您只需覆盖 `outputs` `my-sveltekit-app` 配置。

::: info
虽然没有计划删除特定于工作区的任务配置，但我们希望工作区配置可以用于大多数用例。
:::

## 局限性

尽管总体思路与根 `turbo.json` 相同，但是 Workspace Configuration 提供了一组护栏，可以防止工作区创建混乱的情况。这些护栏在这里列出，以表明它们是故意的，而不是偶然的:

工作区配置不能使用 `workspace#task` 语法作为 pipeline.

根据配置的位置推断工作区，不可能更改其他工作区的配置。例如，在“my-nextjs-app”的工作区配置中:

```json
// apps/my-nextjs-app/turbo.json
{
  "pipeline": {
    "my-nextjs-app#build": {
      // ❌ This is not allowed. Even though it's
      // referencing the correct workspace, "my-nextjs-app"
      // is inferred, and we don't need to specify it again.
      // This syntax also has different behavior, so we do not want to allow it.
      // (see "Comparison to Workspace-specific tasks" section)
    },
    "my-sveltekit-app#build": {
      // ❌ Changing configuration for the "my-sveltekit-app" workspace
      // from Workspace Configuraton in "my-nextjs-app" is not allowed.
    },
    "build": {
      // ✅ just use the task name!
    }
  }
}
```

注意，`build` 任务仍然可以依赖于特定于工作区的任务:

```json
// apps/my-nextjs-app/turbo.json
{
  "pipeline": {
    "build": {
      // ✅ It's still ok to have workspace#task in dependsOn!
      "dependsOn": ["some-pkg#compile"]
    }
  }
}
```

- 工作区配置不能覆盖 `pipeline` key 以外的任何内容。
  - 例如，不可能覆盖 `globalEnv` 或 `globalDependency`。我们希望 monorepo 所有者能够完全控制它，如果这个配置不是真正的全局配置，那么就不应该这样配置它。
- root 中的 `turbo.json` 不能配置 `extends` key。
  - 为了避免在工作区上创建循环依赖关系，根 `turbo.json` 不能从任何地方进行扩展。

## 故障排除

在大型 monorepos 中，有时很难理解 Turborepo 是如何解释你的配置的。为了提供帮助，我们在运行输出中添加了一个 `resolvedTaskDefinition`。例如，如果运行 `turbo run build --dry-run`，输出将包括在运行 `build` 任务之前考虑的所有 `turbo.json` 配置的组合。
