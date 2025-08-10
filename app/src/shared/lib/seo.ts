const SITE_NAME = "Plumffel NFT";
export function getSiteTitle(text?: string) {
  const title = text ? `${SITE_NAME} - ${text}` : SITE_NAME;
  return title;
}
