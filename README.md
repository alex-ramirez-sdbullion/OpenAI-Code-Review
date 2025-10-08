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
      ai_model: 'gpt-3.5-turbo'
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
    azureApiVersion: '2024-02-15-preview'
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
