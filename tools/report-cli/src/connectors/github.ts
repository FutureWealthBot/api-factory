import fs from 'fs';
import path from 'path';

type GitHubReport = {
  provider: 'github';
  authenticated: boolean;
  repoUrl?: string;
  headSha?: string;
  defaultBranch?: string;
  ci?: { provider: string; status?: string; conclusion?: string };
  error?: string;
};

function readRepoFromPackage(projectPath: string) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
    if (pkg?.repository) {
      if (typeof pkg.repository === 'string') return pkg.repository;
      if (pkg.repository?.url) return pkg.repository.url;
    }
  } catch {
    // ignore
  }
  return undefined;
}

function readRepoFromGitConfig(projectPath: string) {
  try {
    const gitConfig = fs.readFileSync(path.join(projectPath, '.git', 'config'), 'utf8');
    const m = gitConfig.match(/url = (.+)\n/);
    if (m && m[1]) return m[1].trim();
  } catch {
    // ignore
  }
  return undefined;
}

export async function gatherGitHub(projectPath: string): Promise<GitHubReport> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { provider: 'github', authenticated: false };

  const repoUrl = process.env.GITHUB_REPO || readRepoFromPackage(projectPath) || readRepoFromGitConfig(projectPath);
  if (!repoUrl) return { provider: 'github', authenticated: true, error: 'repo not detected' };

  // normalize repo (owner/repo)
  const short = repoUrl.replace(/^(git\+)?https?:\/\/(github.com\/)*/i, '').replace(/\.git$/, '').replace(/^git@github.com:/, '');
  const parts = short.split('/').filter(Boolean);
  if (parts.length < 2) return { provider: 'github', authenticated: true, error: 'repo parse failed', repoUrl };
  const owner = parts[0];
  const repo = parts[1];

  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };
  try {
    // get repo info
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      return { provider: 'github', authenticated: true, repoUrl, error: `repo API ${repoRes.status}` };
    }
  const repoJson = (await repoRes.json()) as Record<string, unknown> | undefined;
  const defaultBranch = (repoJson && (repoJson.default_branch as string | undefined)) || undefined;

    // get latest commit on default branch
    const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?sha=${defaultBranch}&per_page=1`, { headers });
    let headSha: string | undefined;
    if (commitsRes.ok) {
      const commits = (await commitsRes.json()) as Array<Record<string, unknown>> | undefined;
      headSha = commits && commits[0] ? (commits[0].sha as string | undefined) : undefined;
    }

    // get latest workflow run
    const runsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=1`, { headers });
    let ci;
    if (runsRes.ok) {
      const runs = (await runsRes.json()) as Record<string, unknown> | undefined;
      const run = runs && (runs['workflow_runs'] as Array<Record<string, unknown>> | undefined)?.[0];
      if (run) ci = { provider: 'github-actions', status: run.status as string | undefined, conclusion: run.conclusion as string | undefined };
    }

    return { provider: 'github', authenticated: true, repoUrl, headSha, defaultBranch, ci };
  } catch {
    return { provider: 'github', authenticated: true, repoUrl, error: 'unknown error' };
  }
}
