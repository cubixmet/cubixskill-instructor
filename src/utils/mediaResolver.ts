import { resolveMediaUrl } from './media.utils';
export { resolveMediaUrl, formatBytes, formatMediaDate, formatMediaDateTime, type MediaLike } from './media.utils';
export default function resolveMediaUrlAlias(value?: any): string {
  return resolveMediaUrl(value);
}
