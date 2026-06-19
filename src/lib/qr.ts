import { getSiteUrl } from './siteUrl';

export function getVerificationUrl(type: 'evidence' | 'passport', id: string): string {
  return `${getSiteUrl()}/${type}/${id}`;
}

export function getScanVerificationUrl(scanId: string): string {
  return `${getSiteUrl()}/evidence?scan=${scanId}`;
}
