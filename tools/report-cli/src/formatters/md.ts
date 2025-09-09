type Report = {
  meta?: { name?: string; path?: string; lastUpdated?: string; owner?: string };
  db?: Record<string, unknown>;
  api?: Record<string, unknown>;
  repo?: Record<string, unknown>;
  hosting?: Record<string, unknown>;
  summary?: Record<string, unknown>;
};

export function renderMarkdown(report: Report): string {
  const lines: string[] = [];
  lines.push(`# ${report.meta?.name || 'Project'} — Total Account Status Report`);
  lines.push('');
  lines.push('## 1. Project Overview');
  lines.push(`- Project Name: ${report.meta?.name || ''}`);
  lines.push(`- Folder Path / Repo: ${report.meta?.path || ''}`);
  lines.push(`- Last Updated: ${report.meta?.lastUpdated || ''}`);
  lines.push(`- Owner / Team Lead: ${report.meta?.owner || ''}`);
  lines.push('');

  lines.push('## 2. Database & Backend');
  if (report.db) {
    const db = report.db;
    lines.push(`- Database Provider: ${(db['provider'] as string) || ''}`);
    lines.push(`- Authenticated: ${db['authenticated'] ? 'Yes' : 'No'}`);
    if (db['db'] && (db['db'] as Record<string, unknown>)['url']) lines.push(`- URL: ${((db['db'] as Record<string, unknown>)['url'] as string)}`);
  } else {
    lines.push('- No database info');
  }
  lines.push('');

  lines.push('## 3. API & Services');
  if (report.api) {
    const api = report.api;
    lines.push(`- Auth: ${(api['auth'] as string) || ''}`);
  } else {
    lines.push('- No API info');
  }
  lines.push('');

  lines.push('## 4. Codebase & Repository');
  if (report.repo) {
    const repo = report.repo;
    lines.push(`- Repo: ${(repo['repoUrl'] as string) || ''}`);
    lines.push(`- Default Branch: ${(repo['defaultBranch'] as string) || ''}`);
    lines.push(`- HEAD: ${(repo['headSha'] as string) || ''}`);
    if (repo['ci']) {
      const ci = repo['ci'] as Record<string, unknown>;
      lines.push(`- CI: ${(ci['provider'] as string) || ''} — ${(ci['status'] as string) || ''} ${ci['conclusion'] ? '(' + (ci['conclusion'] as string) + ')' : ''}`);
    }
  }
  lines.push('');

  lines.push('## 5. Hosting & Deployment');
  if (report.hosting) {
    const hosting = report.hosting;
    lines.push(`- Provider: ${(hosting['provider'] as string) || ''}`);
    lines.push(`- Authenticated: ${hosting['authenticated'] ? 'Yes' : 'No'}`);
    if (hosting['latestDeployment']) lines.push(`- Latest Deployment: ${(hosting['latestDeployment'] as string)}`);
  }
  lines.push('');

  lines.push('## 10. Summary Snapshot');
  lines.push(`- Overall Health: ${(report.summary && (report.summary['health'] as string)) || 'unknown'}`);
  if (report.summary && Array.isArray(report.summary['risks']) && (report.summary['risks'] as string[]).length) lines.push(`- Top Risks: ${(report.summary['risks'] as string[]).join(', ')}`);
  if (report.summary && Array.isArray(report.summary['wins']) && (report.summary['wins'] as string[]).length) lines.push(`- Top Wins: ${(report.summary['wins'] as string[]).join(', ')}`);

  return lines.join('\n');
}
