// Fetch live star counts at build time. Falls back to the value in each
// project's front matter if the API is unreachable or rate-limited.
const cache = new Map<string, Promise<number | null>>();

export function getStars(repo: string): Promise<number | null> {
  if (!cache.has(repo)) {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    cache.set(
      repo,
      fetch(`https://api.github.com/repos/${repo}`, { headers })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => (d && typeof d.stargazers_count === 'number' ? d.stargazers_count : null))
        .catch(() => null),
    );
  }
  return cache.get(repo)!;
}

export function formatStars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);
}
