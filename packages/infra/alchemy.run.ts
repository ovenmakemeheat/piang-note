import alchemy from "alchemy";
import { Astro } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });

const app = await alchemy("piang-note");
const publicServerUrl = alchemy.env.PUBLIC_SERVER_URL;

if (!publicServerUrl) {
	throw new Error("PUBLIC_SERVER_URL is required to deploy the web app.");
}

export const web = await Astro("web", {
	cwd: "../../apps/web",
	entrypoint: "dist/server/entry.mjs",
	assets: "dist/client",
	bindings: {
		PUBLIC_SERVER_URL: publicServerUrl,
	},
});

console.log(`Web    -> ${web.url}`);

await app.finalize();
