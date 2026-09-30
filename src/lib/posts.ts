import { getCollection, type CollectionEntry } from 'astro:content';

// Jekyll filenames are YYYY-MM-DD-slug; the old permalink was /:year/:slug/.
export function postParams(post: CollectionEntry<'blog'>) {
  const [, year, slug] = post.id.match(/^(\d{4})-\d{2}-\d{2}-(.+)$/)!;
  return { year, slug };
}

export function postUrl(post: CollectionEntry<'blog'>) {
  const { year, slug } = postParams(post);
  return `/${year}/${slug}/`;
}

export async function getPosts() {
  const posts = await getCollection('blog');
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}
