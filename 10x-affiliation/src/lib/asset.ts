/**
 * URL for a file in /public that works under any base path: "/" for the normal site,
 * "./" for the shareable preview build, which is served from a sub-folder.
 */
export function asset(path: string) {
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}
