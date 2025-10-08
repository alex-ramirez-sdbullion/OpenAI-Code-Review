# Open AI Code Review DevOps Extension

## Supercharge Your Code Reviews with Open AI

Welcome to the Open AI Code Review DevOps Extension – your new ally in building top-notch software! This extension seamlessly integrates Open AI's powerful language models into your Azure DevOps pipeline, transforming code reviews into an intelligent and efficient process.

### Get Started Now!

Enhance your development workflow with Open AI Code Review. Start receiving intelligent and actionable insights on your code changes. Install the extension today and experience the future of code reviews!

## Why Choose Open AI Code Review?

- **Automated Code Reviews:** Say goodbye to manual code inspections! Let Open AI analyze your code changes, catching bugs, performance issues, and suggesting best practices.
- **Effortless Installation:** A simple one-click installation from the [Azure DevOps Marketplace]([https://marketplace.visualstudio.com/azuredevops](https://marketplace.visualstudio.com/items?itemName=AidanCole.oaicr)) gets you up and running instantly.
- **AI-Powered Insights:** Leverage the latest advancements in natural language processing to receive insightful comments on your pull requests.
- **Faster Reviews:** Reduce the time spent on code reviews. Let Open AI handle the routine, allowing your team to focus on impactful work.
- **Configurable and Customizable:** Tailor the extension to your needs with customizable settings. Specify the Open AI model, define file exclusions, and more.

## Prerequisites

- [Azure DevOps Account](https://dev.azure.com/)
- An AI provider credential:
  - [OpenAI API Key](https://platform.openai.com/docs/overview), or
  - [Azure OpenAI resource with API key](https://learn.microsoft.com/azure/ai-services/openai/how-to/create-resource)

## Getting started

1. Install the Open AI Code Review DevOps Extension from the [Azure DevOps Marketplace]([https://marketplace.visualstudio.com/azuredevops](https://marketplace.visualstudio.com/items?itemName=AidanCole.oaicr)).
1. Add Open AI Code Review Task to Your Pipeline. Use the following example configuration:

```yaml
trigger:
  branches:
    exclude:
      - '*'

pr:
  branches:
    include:
      - '*'

jobs:
- job: CodeReview
  pool:
    vmImage: 'ubuntu-latest'
  steps:
  - task: OpenAICodeReviewTask@1
    inputs:
      aiProvider: 'openai'
      api_key: $(OpenAI_ApiKey)
      ai_model: 'gpt-4o-mini'
      bugs: true
      performance: true
      best_practices: true
      file_extensions: 'js,ts,css,html'
      file_excludes: 'file1.js,file2.py,secret.txt'
      additional_prompts: 'Fix variable naming, Ensure consistent indentation, Review error handling approach'
```

> 💡 Store API keys in secure pipeline variables or Azure Key Vault secrets and reference them here instead of hardcoding values.

1. (Optional) Configure Azure OpenAI instead of the public OpenAI service:

```yaml
- task: OpenAICodeReviewTask@1
  inputs:
    aiProvider: 'azure-openai'
    api_key: $(AzureOpenAI_ApiKey)
    azureEndpoint: 'https://my-resource.openai.azure.com'
    azureDeployment: 'gpt-4o'
    azureApiVersion: '2024-08-01-preview'
    bugs: true
    performance: true
    best_practices: true
```

Ensure the deployment name matches what you configured in Azure OpenAI Studio and that the API version is supported for that deployment.
   
1. If you do not already have Build Validation configured for your branch already add [Build validation](https://learn.microsoft.com/en-us/azure/devops/repos/git/branch-policies?view=azure-devops&tabs=browser#build-validation) to your branch policy to trigger the code review when a Pull Request is created

## FAQ

### Q: What agent job settings are required?

A: Ensure that "Allow scripts to access OAuth token" is enabled as part of the agent job. Follow the [documentation](https://learn.microsoft.com/en-us/azure/devops/pipelines/build/options?view=azure-devops#allow-scripts-to-access-the-oauth-token) for more details.

### Q: What permissions are required for Build Administrators?

A: Build Administrators must be given "Contribute to pull requests" access. Check [this Stack Overflow answer](https://stackoverflow.com/a/57985733) for guidance on setting up permissions.

### Bug Reports

If you find a bug or unexpected behavior, please [open a bug report](https://github.com/a1dancole/openai-code-review/issues/new?assignees=&labels=bug&template=bug_report.md&title=).

### Feature Requests

If you have ideas for new features or enhancements, please [submit a feature request](https://github.com/a1dancole/openai-code-review/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=).

## License

This project is licensed under the [MIT License](LICENSE).

If you would like to contribute to the development of this extension, please follow our contribution guidelines.

## Troubleshooting

- Missing OAuth token: Enable "Allow scripts to access OAuth token" in the agent job. The task uses `System.AccessToken` to call Azure DevOps APIs.
- Insufficient permissions: Grant the Project Build Service the "Contribute to pull requests" permission on the repo.
- Node handler mismatch: The task relies on Node 20 for the global `fetch`. Ensure your pipeline agent supports Node 20; otherwise add `node-fetch@2` and re-enable its import.
- No files reviewed: When using `file_extensions`, provide comma-separated extensions like `ts,js,cs` (with or without leading dots). Excludes should be plain file names, comma-separated.

## Build and Package

Follow these steps to build the task (TypeScript → JavaScript) and create a VSIX for publishing to the Azure DevOps Marketplace.

1) Install tfx (or use npx)

- Global (may print deprecation warnings):
  - `npm i -g tfx-cli`
- Or use npx (no global install):
  - `npx tfx-cli@0.22.1 --help`

2) Install task dependencies and build

- `cd "Open AI Code Review/src"`
- `npm install`
- `npm run build`  (generates `main.js` in the same folder)

3) Package the extension

- `cd ..` (back to `Open AI Code Review`)
- `tfx extension create --manifest-globs vss-extension.json`

This produces a `.vsix` file you can upload in the Publisher portal. Ensure your pipeline uses a Microsoft-hosted image (e.g., `ubuntu-latest`) with Node 20 handler available.

Notes
- The task now uses the global `fetch` API and requires the Node 20 handler at runtime. Ensure your agent supports Node 20. If you must run on Node 16, add `node-fetch@2` and re-add the import.
- If you want to avoid npm deprecation warnings from `tfx-cli`, use the `npx` form shown above.
