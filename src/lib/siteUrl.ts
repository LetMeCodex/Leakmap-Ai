export const getSiteUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }

  return "http://localhost:3000";
};

export const buildEvidenceUrl = (evidenceId: string): string => {
  return `${getSiteUrl()}/evidence/${evidenceId}`;
};

export const buildSourceUrl = (sourceId: string): string => {
  return `${getSiteUrl()}/sources/${sourceId}`;
};

export const buildPassportUrl = (passportId: string): string => {
  return `${getSiteUrl()}/passport/${passportId}`;
};
