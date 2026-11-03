export interface ImageFlameTuning {
	speed: number;
	contrast: number;
	edgeCutoff: number;
	edgeSoftness: number;
	edgeStrength: number;
	boundaryWobble: number;
	flameReach: number;
	distortion: number;
	texture: number;
	imageDetail: number;
	colorLayers: number;
}

export interface ImageFlameOptions extends Partial<ImageFlameTuning> {
	maxPixelRatio?: number;
	tuningPanel?: HTMLElement | null;
}

export const DEFAULT_IMAGE_FLAME_TUNING: ImageFlameTuning = {
	speed: 1,
	contrast: 1.7,
	edgeCutoff: 0.12,
	edgeSoftness: 0.125,
	edgeStrength: 0,
	boundaryWobble: 0.07,
	flameReach: 0.075,
	distortion: 1.1,
	texture: 0.065,
	imageDetail: 1.2,
	colorLayers: 8,
};

type ImageFlameTuningKey = keyof ImageFlameTuning;

const tuningUniformNames: Record<ImageFlameTuningKey, string> = {
	speed: "u_speed",
	contrast: "u_contrast",
	edgeCutoff: "u_edge_cutoff",
	edgeSoftness: "u_edge_softness",
	edgeStrength: "u_edge_strength",
	boundaryWobble: "u_boundary_wobble",
	flameReach: "u_flame_reach",
	distortion: "u_distortion",
	texture: "u_texture_strength",
	imageDetail: "u_image_detail",
	colorLayers: "u_color_layers",
};

const canvasExpansion = 1.5;
const vertexSource = `
	attribute vec2 a_position;
	void main() {
		gl_Position = vec4(a_position, 0.0, 1.0);
	}
`;

const fragmentSource = `
	precision highp float;
	uniform vec2 u_resolution;
	uniform vec2 u_image_resolution;
	uniform float u_image_scale;
	uniform float u_time;
	uniform float u_speed;
	uniform float u_contrast;
	uniform float u_edge_cutoff;
	uniform float u_edge_softness;
	uniform float u_edge_strength;
	uniform float u_boundary_wobble;
	uniform float u_flame_reach;
	uniform float u_distortion;
	uniform float u_texture_strength;
	uniform float u_image_detail;
	uniform float u_color_layers;
	uniform vec3 u_background;
	uniform sampler2D u_image;

	float hash(vec2 p) {
		return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
	}

	float noise(vec2 p) {
		vec2 i = floor(p);
		vec2 f = fract(p);
		f = f * f * (3.0 - 2.0 * f);
		return mix(
			mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
			mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
			f.y
		);
	}

	float fbm(vec2 p) {
		float value = 0.0;
		float amplitude = 0.5;
		for (int octave = 0; octave < 4; octave++) {
			value += noise(p) * amplitude;
			p = p * 2.07 + 7.1;
			amplitude *= 0.5;
		}
		return value;
	}

	vec2 coverUv(vec2 uv) {
		float imageAspect = u_image_resolution.x / u_image_resolution.y;
		float viewAspect = u_resolution.x / u_resolution.y;
		if (imageAspect > viewAspect) {
			uv.x = (uv.x - 0.5) * (viewAspect / imageAspect) + 0.5;
		} else {
			uv.y = (uv.y - 0.5) * (imageAspect / viewAspect) + 0.5;
		}
		return uv;
	}

	float luminance(vec2 uv) {
		return dot(texture2D(u_image, clamp(uv, 0.001, 0.999)).rgb, vec3(0.299, 0.587, 0.114));
	}

	void main() {
		vec2 uv = gl_FragCoord.xy / u_resolution.xy;
		vec2 p = vec2(uv.x * (u_resolution.x / u_resolution.y), uv.y);
		float t = u_time * u_speed * 0.55;
		float warp = fbm(vec2(p.x * 2.0, p.y * 2.8 - t * 0.38));
		float sway = sin(p.y * 5.4 - t * 0.9 + p.x * 2.4) * 0.04;

		// Keep the source at its original apparent size while giving the fire room to escape its frame.
		vec2 imageCoord = (uv - 0.5) / u_image_scale + 0.5;
		vec2 sourceUv = coverUv(clamp(imageCoord, 0.003, 0.997));
		sourceUv += u_distortion * vec2(sway * 0.42 + (warp - 0.5) * 0.035, (warp - 0.5) * 0.018);
		sourceUv = clamp(sourceUv, 0.003, 0.997);

		vec3 source = texture2D(u_image, sourceUv).rgb;
		float sourceLuma = dot(source, vec3(0.299, 0.587, 0.114));
		vec2 texel = 1.0 / u_image_resolution;
		float edge = abs(luminance(sourceUv + vec2(texel.x, 0.0)) - luminance(sourceUv - vec2(texel.x, 0.0)))
			+ abs(luminance(sourceUv + vec2(0.0, texel.y)) - luminance(sourceUv - vec2(0.0, texel.y)));

		float flow = fbm(vec2(p.x * 4.0 + 2.0, p.y * 4.6 - t * 0.5));
		float flow2 = fbm(vec2(p.x * 6.4 + 13.0, p.y * 5.8 - t * 0.68));
		float fine = noise(vec2(p.x * 17.0 + 5.4, p.y * 19.0 - t * 0.9));
		float base = sin(p.x * 4.8 + flow * 2.4 + t * 0.15) * 0.035
			+ sin(p.x * 8.2 - t * 0.16) * 0.02;
		float tips = sin(p.x * 11.5 + flow2 * 2.8 + t * 0.18) * 0.025;

		// Preserve tonal edges from the image; use fire noise to bend, not erase, its features.
		float contrast = clamp((0.68 - sourceLuma) * u_contrast, 0.0, 1.0);
		float edgeDetail = smoothstep(u_edge_cutoff, u_edge_cutoff + u_edge_softness, edge);
		float imageForm = contrast * 0.8 + edgeDetail * u_edge_strength;
		float field = imageForm * 0.86 + (flow - 0.5) * 0.11 + (flow2 - 0.5) * 0.08
			+ (fine - 0.5) * u_texture_strength + base + tips;

		float frameEdge = u_image_scale * 0.5;
		float frameDistance = length(uv - 0.5);
		float edgeWave = (flow - 0.5) * u_boundary_wobble
			+ sin(p.x * 7.0 + p.y * 5.0 + flow2 * 2.8 + t * 0.16)
				* u_boundary_wobble * 0.54;
		float outside = smoothstep(frameEdge + edgeWave - 0.012, frameEdge + edgeWave + 0.018, frameDistance);
		float outsideDistance = max(frameDistance - frameEdge - edgeWave, 0.0);
		float extension = (imageForm * 0.86 + (flow - 0.5) * 0.11 + (flow2 - 0.5) * 0.08
			+ (fine - 0.5) * u_texture_strength + base + tips)
			* exp(-outsideDistance / max(u_flame_reach, 0.001));
		field = mix(field, extension, outside);
		float sourceDetail = (0.5 - sourceLuma) * 0.34 + edge * 0.75;
		float highlight = field + sourceDetail * u_image_detail
			+ sin(p.x * 5.0 + t * 0.2) * 0.035;

		vec3 dark = vec3(0.43, 0.20, 0.13);
		vec3 mid = vec3(0.62, 0.32, 0.16);
		vec3 light = vec3(0.76, 0.53, 0.28);
		float levels = max(u_color_layers - 1.0, 1.0);
		float imageTone = clamp((highlight - 0.1) * 1.2, 0.0, 1.0);
		float tone = floor(imageTone * levels + 0.5) / levels;
		float palettePosition = tone * 3.0;
		vec3 color;
		if (palettePosition < 1.0) {
			color = mix(u_background, dark, palettePosition);
		} else if (palettePosition < 2.0) {
			color = mix(dark, mid, palettePosition - 1.0);
		} else {
			color = mix(mid, light, palettePosition - 2.0);
		}
		float opacity = 1.0 - smoothstep(0.0, max(u_flame_reach, 0.001), outsideDistance);
		opacity = mix(1.0, opacity, outside);
		gl_FragColor = vec4(color, opacity);
	}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function readPageColor() {
	const hex = getComputedStyle(document.documentElement)
		.getPropertyValue("--palette-page")
		.trim()
		.match(/^#([\da-f]{6})$/i)?.[1];
	if (!hex) return null;
	return [0, 2, 4].map(
		(index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255,
	);
}

export function mountImageFlame(
	image: HTMLImageElement,
	options: ImageFlameOptions = {},
) {
	const host = image.parentElement;
	if (!host) return () => {};

	const canvas = document.createElement("canvas");
	canvas.className = "image-flame-canvas";
	canvas.dataset.imageFlame = "";
	canvas.setAttribute("aria-hidden", "true");
	host.insertBefore(canvas, image);
	host.classList.add("image-flame-host");

	const {
		maxPixelRatio: requestedPixelRatio,
		tuningPanel = null,
		...tuningOverrides
	} = options;
	const tuning: ImageFlameTuning = {
		...DEFAULT_IMAGE_FLAME_TUNING,
		...tuningOverrides,
	};
	const maxPixelRatio = Math.max(1, Math.min(requestedPixelRatio ?? 1.35, 2));
	const settingsStorageKey = "piang-note-image-flame-tuning-v2";
	if (tuningPanel) {
		try {
			const saved = JSON.parse(
				localStorage.getItem(settingsStorageKey) ?? "{}",
			) as Partial<ImageFlameTuning>;
			for (const input of tuningPanel.querySelectorAll<HTMLInputElement>(
				"[data-image-flame-control]",
			)) {
				const key = input.dataset.imageFlameControl as ImageFlameTuningKey;
				const value = saved[key];
				if (
					key in tuning &&
					typeof value === "number" &&
					Number.isFinite(value) &&
					value >= Number(input.min) &&
					value <= Number(input.max)
				) {
					tuning[key] = value;
				}
				input.value = String(tuning[key]);
				const output = tuningPanel.querySelector<HTMLOutputElement>(
					`[data-image-flame-value="${key}"]`,
				);
				if (output) output.value = tuning[key].toFixed(3);
			}
		} catch {
			// Dev tuning storage is optional; always keep the image effect usable.
		}
	}
	const clockOrigin = (() => {
		try {
			const key = "piang-note-fire-clock-origin";
			const saved = Number(sessionStorage.getItem(key));
			if (saved > 0) return saved;
			const now = Date.now();
			sessionStorage.setItem(key, String(now));
			return now;
		} catch {
			return Date.now();
		}
	})();

	let disposed = false;
	let failed = false;
	let ready = false;
	let shaderTimePeriod = 32;
	let frame = 0;
	let lastDraw = 0;
	let visible = true;
	let gl: WebGLRenderingContext | null = null;
	let program: WebGLProgram | null = null;
	let buffer: WebGLBuffer | null = null;
	let texture: WebGLTexture | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let intersectionObserver: IntersectionObserver | null = null;
	let themeObserver: MutationObserver | null = null;
	let colorSchemeMediaQuery: MediaQueryList | null = null;

	const textureLocationRef: { location: WebGLUniformLocation | null } = {
		location: null,
	};
	const resolutionLocationRef: { location: WebGLUniformLocation | null } = {
		location: null,
	};
	const imageResolutionLocationRef: { location: WebGLUniformLocation | null } =
		{ location: null };
	const imageScaleLocationRef: { location: WebGLUniformLocation | null } = {
		location: null,
	};
	const timeLocationRef: { location: WebGLUniformLocation | null } = {
		location: null,
	};
	const tuningLocations = new Map<
		ImageFlameTuningKey,
		WebGLUniformLocation | null
	>();
	const backgroundLocationRef: { location: WebGLUniformLocation | null } = {
		location: null,
	};

	const removeCanvas = () => {
		if (ready) host.classList.remove("image-flame-active");
		canvas.remove();
		host.classList.remove("image-flame-host");
	};

	const stop = () => {
		if (frame) cancelAnimationFrame(frame);
		frame = 0;
	};

	const readTime = () => ((Date.now() - clockOrigin) / 1000) % shaderTimePeriod;

	const applyTuning = () => {
		if (!gl || !program) return;
		gl.useProgram(program);
		for (const key of Object.keys(
			tuningUniformNames,
		) as ImageFlameTuningKey[]) {
			gl.uniform1f(tuningLocations.get(key) ?? null, tuning[key]);
		}
		draw(readTime());
	};

	const onTuningInput = (event: Event) => {
		const input = event.target;
		if (!(input instanceof HTMLInputElement) || !tuningPanel) return;
		const key = input.dataset.imageFlameControl as ImageFlameTuningKey;
		if (!(key in tuning)) return;
		tuning[key] = Number(input.value);
		const output = tuningPanel.querySelector<HTMLOutputElement>(
			`[data-image-flame-value="${key}"]`,
		);
		if (output) output.value = tuning[key].toFixed(3);
		applyTuning();
		try {
			localStorage.setItem(settingsStorageKey, JSON.stringify(tuning));
		} catch {
			// Tuning still works when browser storage is disabled.
		}
	};
	const onTuningReset = () => {
		if (!tuningPanel) return;
		Object.assign(tuning, DEFAULT_IMAGE_FLAME_TUNING);
		for (const input of tuningPanel.querySelectorAll<HTMLInputElement>(
			"[data-image-flame-control]",
		)) {
			const key = input.dataset.imageFlameControl as ImageFlameTuningKey;
			if (!(key in tuning)) continue;
			input.value = String(tuning[key]);
			const output = tuningPanel.querySelector<HTMLOutputElement>(
				`[data-image-flame-value="${key}"]`,
			);
			if (output) output.value = tuning[key].toFixed(3);
		}
		applyTuning();
		try {
			localStorage.removeItem(settingsStorageKey);
		} catch {
			// Reset still applies for the current page when storage is disabled.
		}
	};

	tuningPanel?.addEventListener("input", onTuningInput);
	tuningPanel
		?.querySelector("[data-image-flame-reset]")
		?.addEventListener("click", onTuningReset);

	const updateBackground = () => {
		if (!gl || !program) return;
		const channels = readPageColor();
		if (!channels) return;
		gl.useProgram(program);
		gl.clearColor(channels[0], channels[1], channels[2], 0);
		gl.uniform3f(
			backgroundLocationRef.location,
			channels[0],
			channels[1],
			channels[2],
		);
	};

	const draw = (time: number) => {
		if (!gl || !program) return;
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.uniform2f(resolutionLocationRef.location, canvas.width, canvas.height);
		gl.uniform1f(timeLocationRef.location, time);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		if (!ready) {
			ready = true;
			host.classList.add("image-flame-active");
		}
	};

	const resize = () => {
		if (!gl || !host.isConnected) return;
		const bounds = host.getBoundingClientRect();
		if (!bounds.width || !bounds.height) return;
		const pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
		const width = Math.max(
			1,
			Math.round(bounds.width * canvasExpansion * pixelRatio),
		);
		const height = Math.max(
			1,
			Math.round(bounds.height * canvasExpansion * pixelRatio),
		);
		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
		}
		draw(readTime());
	};

	const tick = (now: number) => {
		frame = 0;
		if (disposed || !visible || document.hidden) return;
		if (now - lastDraw >= 32) {
			draw(readTime());
			lastDraw = now;
		}
		frame = requestAnimationFrame(tick);
	};

	const start = () => {
		if (
			disposed ||
			failed ||
			!gl ||
			!program ||
			!visible ||
			document.hidden ||
			frame
		)
			return;
		frame = requestAnimationFrame(tick);
	};

	const releaseResources = () => {
		if (gl) {
			if (texture) gl.deleteTexture(texture);
			if (buffer) gl.deleteBuffer(buffer);
			if (program) gl.deleteProgram(program);
		}
		texture = null;
		buffer = null;
		program = null;
	};

	const fail = () => {
		if (disposed || failed) return;
		failed = true;
		stop();
		image.removeEventListener("load", onImageLoad);
		image.removeEventListener("error", onImageError);
		document.removeEventListener("visibilitychange", onVisibilityChange);
		window.removeEventListener("resize", resize);
		tuningPanel?.removeEventListener("input", onTuningInput);
		tuningPanel
			?.querySelector("[data-image-flame-reset]")
			?.removeEventListener("click", onTuningReset);
		colorSchemeMediaQuery?.removeEventListener("change", updateBackground);
		resizeObserver?.disconnect();
		intersectionObserver?.disconnect();
		themeObserver?.disconnect();
		releaseResources();
		removeCanvas();
	};

	const initialize = () => {
		if (disposed || failed || !image.isConnected || !image.complete) return;
		if (!image.naturalWidth) {
			fail();
			return;
		}
		const context = canvas.getContext("webgl", {
			alpha: true,
			antialias: false,
			depth: false,
			stencil: false,
			premultipliedAlpha: false,
		});
		if (!context) {
			fail();
			return;
		}
		gl = context;

		const highPrecision = gl.getShaderPrecisionFormat(
			gl.FRAGMENT_SHADER,
			gl.HIGH_FLOAT,
		)?.precision;
		shaderTimePeriod = highPrecision ? 1024 : 32;
		const fragment = highPrecision
			? fragmentSource
			: fragmentSource.replace(
					"precision highp float;",
					"precision mediump float;",
				);
		const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
		const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);
		if (!vertexShader || !fragmentShader) {
			if (vertexShader) gl.deleteShader(vertexShader);
			if (fragmentShader) gl.deleteShader(fragmentShader);
			fail();
			return;
		}

		program = gl.createProgram();
		if (!program) {
			fail();
			return;
		}
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.bindAttribLocation(program, 0, "a_position");
		gl.linkProgram(program);
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			fail();
			return;
		}

		buffer = gl.createBuffer();
		texture = gl.createTexture();
		if (!buffer || !texture) {
			fail();
			return;
		}
		gl.useProgram(program);
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
			gl.STATIC_DRAW,
		);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		const maxTextureSize = Math.min(
			2048,
			Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 2048,
		);
		const textureScale = Math.min(
			1,
			maxTextureSize / Math.max(image.naturalWidth, image.naturalHeight),
		);
		let textureImage: HTMLImageElement | HTMLCanvasElement = image;
		let textureWidth = image.naturalWidth;
		let textureHeight = image.naturalHeight;
		if (textureScale < 1) {
			const scaledImage = document.createElement("canvas");
			scaledImage.width = Math.round(image.naturalWidth * textureScale);
			scaledImage.height = Math.round(image.naturalHeight * textureScale);
			const context = scaledImage.getContext("2d");
			if (!context) {
				fail();
				return;
			}
			context.imageSmoothingQuality = "high";
			context.drawImage(image, 0, 0, scaledImage.width, scaledImage.height);
			textureImage = scaledImage;
			textureWidth = scaledImage.width;
			textureHeight = scaledImage.height;
		}
		try {
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				textureImage,
			);
		} catch {
			fail();
			return;
		}

		textureLocationRef.location = gl.getUniformLocation(program, "u_image");
		resolutionLocationRef.location = gl.getUniformLocation(
			program,
			"u_resolution",
		);
		imageResolutionLocationRef.location = gl.getUniformLocation(
			program,
			"u_image_resolution",
		);
		imageScaleLocationRef.location = gl.getUniformLocation(
			program,
			"u_image_scale",
		);
		timeLocationRef.location = gl.getUniformLocation(program, "u_time");
		for (const key of Object.keys(
			tuningUniformNames,
		) as ImageFlameTuningKey[]) {
			tuningLocations.set(
				key,
				gl.getUniformLocation(program, tuningUniformNames[key]),
			);
		}
		backgroundLocationRef.location = gl.getUniformLocation(
			program,
			"u_background",
		);
		gl.uniform1i(textureLocationRef.location, 0);
		gl.uniform2f(
			imageResolutionLocationRef.location,
			textureWidth,
			textureHeight,
		);
		gl.uniform1f(imageScaleLocationRef.location, 1 / canvasExpansion);
		gl.clearColor(40 / 255, 40 / 255, 40 / 255, 0);

		applyTuning();
		updateBackground();
		resize();
		if (typeof ResizeObserver !== "undefined") {
			resizeObserver = new ResizeObserver(resize);
			resizeObserver.observe(host);
		}
		if (typeof IntersectionObserver !== "undefined") {
			intersectionObserver = new IntersectionObserver(([entry]) => {
				visible = entry.isIntersecting;
				if (visible) start();
				else stop();
			});
			intersectionObserver.observe(host);
		}
		window.addEventListener("resize", resize);
		themeObserver = new MutationObserver(updateBackground);
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});
		colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: light)");
		colorSchemeMediaQuery.addEventListener("change", updateBackground);
		start();
	};

	const onVisibilityChange = () => {
		if (document.hidden) stop();
		else start();
	};
	const onImageLoad = () => initialize();
	const onImageError = () => fail();
	const onContextLost = (event: Event) => {
		event.preventDefault();
		fail();
	};

	canvas.addEventListener("webglcontextlost", onContextLost);
	document.addEventListener("visibilitychange", onVisibilityChange);
	if (image.complete) initialize();
	else {
		image.addEventListener("load", onImageLoad, { once: true });
		image.addEventListener("error", onImageError, { once: true });
	}

	return () => {
		if (disposed) return;
		disposed = true;
		stop();
		image.removeEventListener("load", onImageLoad);
		image.removeEventListener("error", onImageError);
		canvas.removeEventListener("webglcontextlost", onContextLost);
		document.removeEventListener("visibilitychange", onVisibilityChange);
		window.removeEventListener("resize", resize);
		tuningPanel?.removeEventListener("input", onTuningInput);
		tuningPanel
			?.querySelector("[data-image-flame-reset]")
			?.removeEventListener("click", onTuningReset);
		colorSchemeMediaQuery?.removeEventListener("change", updateBackground);
		resizeObserver?.disconnect();
		intersectionObserver?.disconnect();
		themeObserver?.disconnect();
		releaseResources();
		removeCanvas();
	};
}
