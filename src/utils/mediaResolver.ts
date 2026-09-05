export { resolveMediaUrl, formatBytes, formatMediaDate, formatMediaDateTime, type MediaLike } from './media.utils';
export default function resolveMediaUrlAlias(value?: any): string {
  const { resolveMediaUrl } = require('./media.utils');
  return resolveMediaUrl(value);
}
