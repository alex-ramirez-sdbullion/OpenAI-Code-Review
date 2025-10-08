import * as tl from "azure-pipelines-task-lib/task";
import { SimpleGit, SimpleGitOptions, simpleGit } from "simple-git";
import * as path from "path";
import binaryExtensions from "./binaryExtensions.json";

export class Repository {

    private gitOptions: Partial<SimpleGitOptions> = {
        baseDir: `${tl.getVariable('System.DefaultWorkingDirectory')}`,
        binary: 'git'
    };

    private readonly _repository: SimpleGit;

    constructor() {
        this._repository = simpleGit(this.gitOptions);
        this._repository.addConfig('core.pager', 'cat');
        this._repository.addConfig('core.quotepath', 'false');
    }

    public async GetChangedFiles(fileExtensions: string | undefined, filesToExclude: string | undefined): Promise<string[]> {
        await this._repository.fetch();

        let targetBranch = this.GetTargetBranch();

        let diffs = await this._repository.diff([targetBranch, '--name-only', '--diff-filter=AM']);
        let files = diffs.split('\n').filter(line => line.trim().length > 0);

        const isBinaryExt = (file: string) => {
            const ext = path.extname(file).slice(1).toLowerCase();
            if (!ext) return false;
            return binaryExtensions.some(be => be.toLowerCase() === ext);
        };

        let filesToReview = files.filter(file => !isBinaryExt(file));

        if(fileExtensions) {
            const includeExts = fileExtensions
                .split(',')
                .map(e => e.trim())
                .filter(e => e.length > 0)
                .map(e => e.replace(/^\./, '').toLowerCase());

            filesToReview = filesToReview.filter(file => {
                const ext = path.extname(file).slice(1).toLowerCase();
                return includeExts.length === 0 || includeExts.includes(ext);
            });
        }

        if(filesToExclude) {
            const namesToExclude = filesToExclude
                .split(',')
                .map(n => n.trim().toLowerCase())
                .filter(n => n.length > 0);
            filesToReview = filesToReview.filter(file => !namesToExclude.includes(path.basename(file).toLowerCase()))
        }

        return filesToReview;
    }

    public async GetDiff(fileName: string): Promise<string> {
        let targetBranch = this.GetTargetBranch();
        
        let diff = await this._repository.diff([targetBranch, '--', fileName]);

        return diff;
    }

    private GetTargetBranch(): string {
        let targetBranchName = tl.getVariable('System.PullRequest.TargetBranchName');

        if (!targetBranchName) {
            targetBranchName = tl.getVariable('System.PullRequest.TargetBranch')?.replace('refs/heads/', '');
        }

        if (!targetBranchName) {
            throw new Error(`Could not find target branch`)
        }

        return `origin/${targetBranchName}`;
    }
}
