export const SITE_URL = "https://ovenheat.com";
export const SITE_NAME = "Guntee Doungmanee";
export const PERSON_ID = `${SITE_URL}/about/#person`;

export function absoluteUrl(path: string) {
	return new URL(path, `${SITE_URL}/`).href;
}

export function canonicalPath(pathname: string) {
	const path = pathname.replace(/\/+$/, "");
	return path ? `${path}/` : "/";
}

export function serializeJsonLd(value: unknown) {
	return JSON.stringify(value)
		.replace(/</g, "\\u003c")
		.replace(/>/g, "\\u003e")
		.replace(/&/g, "\\u0026")
		.replace(/\u2028/g, "\\u2028")
		.replace(/\u2029/g, "\\u2029");
}
