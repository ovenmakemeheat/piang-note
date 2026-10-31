import alchemy from "alchemy";
import { Astro } from "alchemy/cloudflare";
import { CloudflareStateStore } from "alchemy/state";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });

const app = await alchemy("piang-note", {
	// CI runners are ephemeral; development keeps its existing local state.
	stateStore:
		process.env.ALCHEMY_STATE_STORE === "cloudflare"
			? (scope) => new CloudflareStateStore(scope)
			: undefined,
});
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
