/** URL for a file in /public that works under any base path. */
export function asset(path: string) {
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}
