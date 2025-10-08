import tl = require('azure-pipelines-task-lib/task');
import { encode } from 'gpt-tokenizer';
import OpenAI from "openai";

type SupportedProvider = 'openai' | 'azure-openai';

export class ChatGPT {
    private readonly systemMessage: string = '';
    private readonly _maxChunksPerFile: number;
    private readonly _tokenBuffer: number;

    constructor(
        private readonly _openAi: OpenAI,
        private readonly _provider: SupportedProvider,
        private readonly _modelOrDeployment: string,
        checkForBugs: boolean = false,
        checkForPerformance: boolean = false,
        checkForBestPractices: boolean = false,
        additionalPrompts: string[] = [],
        maxChunksPerFile: number = 20,
        tokenBuffer: number = 1200
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
        this._maxChunksPerFile = maxChunksPerFile;
        this._tokenBuffer = tokenBuffer;
    }

    public async PerformCodeReview(diff: string, fileName: string): Promise<string> {
        const tokenLimit = this.getContextLimit(this._modelOrDeployment, this._provider);

        const chunks = this.chunkByTokens(diff, tokenLimit);
        if (chunks.length === 0) {
            tl.warning(`Unable to process diff for file ${fileName} as it exceeds token limits.`)
            return '';
        }

        const collected: string[] = [];
        for (const piece of chunks) {
            const openAi = await this._openAi.chat.completions.create({
                messages: [
                    { role: 'system', content: this.systemMessage },
                    { role: 'user', content: piece }
                ],
                model: this._modelOrDeployment
            });
            const choice = openAi.choices?.[0]?.message?.content?.trim();
            if (choice && choice.toUpperCase() !== 'NO_COMMENT') {
                collected.push(choice);
            }
        }

        if (collected.length === 0) {
            return 'NO_COMMENT';
        }

        // Merge responses with a simple separator to keep markdown readable.
        return collected.join('\n\n---\n\n');
    }

    private getContextLimit(modelOrDeployment: string, provider: SupportedProvider): number {
        const name = (modelOrDeployment || '').toLowerCase();
        const is4oMini = name.includes('4o-mini');
        const is4o = name.includes('4o');
        const is4Turbo = name.includes('4-turbo');
        const is35 = name.includes('3.5');
        const is35_16k = is35 && name.includes('16k');

        // Heuristics based on common context sizes
        if (is4oMini || is4o || is4Turbo) {
            return 128000; // modern 4o/4o-mini/4-turbo context
        }

        if (is35_16k) {
            return 16000;
        }
        if (is35) {
            return 4097;
        }

        // Azure deployments can be arbitrary names; default high for modern models
        if (provider === 'azure-openai') {
            return 128000;
        }

        // Safe default for unknown models
        return 128000;
    }

    private chunkByTokens(content: string, tokenLimit: number): string[] {
        // Reserve some headroom for system message and response
        const buffer = Math.max(0, this._tokenBuffer);
        const maxContentTokens = Math.max(1000, tokenLimit - buffer);

        const lines = content.split(/\r?\n/);
        const chunks: string[] = [];
        let current: string[] = [];
        let currentTokens = 0;

        for (const line of lines) {
            if (chunks.length >= this._maxChunksPerFile) {
                break;
            }
            const tentative = current.length > 0 ? `${line}\n` : `${line}\n`;
            const tTokens = encode(tentative).length;
            if (currentTokens + tTokens > maxContentTokens) {
                if (current.length > 0) {
                    chunks.push(current.join('\n'));
                    current = [];
                    currentTokens = 0;
                }

                // If even a single line is too big, hard-truncate that line
                if (tTokens > maxContentTokens) {
                    // Truncate by characters until it fits
                    let cut = line;
                    let cutTokens = encode(cut).length;
                    while (cut.length > 0 && cutTokens > maxContentTokens) {
                        cut = cut.slice(0, Math.max(0, Math.floor(cut.length * 0.8)));
                        cutTokens = encode(cut).length;
                    }
                    if (cut.length > 0) {
                        chunks.push(cut);
                    }
                    continue;
                }
            }

            current.push(line);
            currentTokens += tTokens;
        }

        if (current.length > 0 && chunks.length < this._maxChunksPerFile) {
            chunks.push(current.join('\n'));
        }

        return chunks;
    }

}
