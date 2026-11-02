import { defineMiddleware } from "astro:middleware";

const canonicalHost = "ovenheat.com";
const supportedHosts = new Set([canonicalHost, `www.${canonicalHost}`]);

export const onRequest = defineMiddleware((context, next) => {
	if (!import.meta.env.PROD || !supportedHosts.has(context.url.hostname)) {
		return next();
	}

	if (
		context.url.protocol === "https:" &&
		context.url.hostname === canonicalHost
	) {
		return next();
	}

	const canonicalUrl = new URL(context.url);
	canonicalUrl.protocol = "https:";
	canonicalUrl.hostname = canonicalHost;
	canonicalUrl.port = "";
	return Response.redirect(canonicalUrl.toString(), 301);
});
