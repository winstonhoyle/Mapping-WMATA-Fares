const CODE = /^[A-Z]\d{2}$/;

/** "/a01" -> "A01"; anything else -> "". */
export const parseStationPath = (pathname: string): string => {
  const parts = pathname.split("/").filter(Boolean);
  const code = parts.length === 1 ? parts[0].toUpperCase() : "";
  return CODE.test(code) ? code : "";
};

export const buildStationPath = (code: string): string => `/${code}`;
