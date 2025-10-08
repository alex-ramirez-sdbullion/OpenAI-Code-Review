import tl = require('azure-pipelines-task-lib/task');
import { encode } from 'gpt-tokenizer';
import OpenAI from "openai";

type SupportedProvider = 'openai' | 'azure-openai';

export class ChatGPT {
    private readonly systemMessage: string = '';

    constructor(
        private readonly _openAi: OpenAI,
        private readonly _provider: SupportedProvider,
        private readonly _modelOrDeployment: string,
        checkForBugs: boolean = false,
        checkForPerformance: boolean = false,
        checkForBestPractices: boolean = false,
        additionalPrompts: string[] = []
    ) {
        this.systemMessage = `Your task is to act as a code reviewer of a Pull Request:
        - Use bullet points if you have multiple comments.
    ${checkForBugs ? '- If there are any bugs, highlight them.' : ''}
    ${checkForPerformance ? '- If there are major performance problems, highlight them.' : ''}
    ${checkForBestPractices ? '- Provide details on missed use of best-practices.' : ''}
    ${additionalPrompts.length > 0 ? additionalPrompts.map(str => `- ${str}`).join('\n') : ''}
        - Do not highlight minor issues and nitpicks.
        - Only provide instructions for improvements 
        - If you have no instructions respond with NO_COMMENT only, otherwise provide your instructions.
    
        You are provided with the code changes (diffs) in a unidiff format.
        
        The response should be in markdown format.`
    }

    public async PerformCodeReview(diff: string, fileName: string): Promise<string> {

        const tokenLimit = this._provider === 'azure-openai' ? 16000 : 4097;

        if (!this.doesMessageExceedTokenLimit(diff + this.systemMessage, tokenLimit)) {
            let openAi = await this._openAi.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: this.systemMessage
                    },
                    {
                        role: 'user',
                        content: diff
                    }
                ], model: this._modelOrDeployment
            });

            let response = openAi.choices;

            if (response.length > 0) {
                return response[0].message.content!;
            }
        }

        tl.warning(`Unable to process diff for file ${fileName} as it exceeds token limits.`)
        return '';
    }

    private doesMessageExceedTokenLimit(message: string, tokenLimit: number): boolean {
        let tokens = encode(message);
        return tokens.length > tokenLimit;
    }

}