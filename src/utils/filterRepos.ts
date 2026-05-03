import type { Repo } from '../types';

/** Sidebar search (name + description) and optional language chip filter. */
export function filterRepos(
  repos: Repo[],
  search: string,
  langFilter: string
): Repo[] {
  const q = search.toLowerCase();
  return repos.filter(
    (r) =>
      (r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)) &&
      (langFilter === 'All' || r.language === langFilter)
  );
}
