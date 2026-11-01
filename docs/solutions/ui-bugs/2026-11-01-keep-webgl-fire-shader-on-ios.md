---
title: "Keep the WebGL fire shader active on iOS"
date: 2026-11-01
category: ui-bugs
module: apps/web
problem_type: ui_bug
component: frontend_stimulus
symptoms:
  - "On iOS, the blob displayed the SVG fallback instead of the requested WebGL shader."
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - webgl
  - ios
  - shader-precision
  - requestanimationframe
  - svg-fallback
---

# Keep the WebGL fire shader active on iOS

## Problem

The fire effect was intended to use the same animated WebGL shader on phones as on desktop. A follow-up change instead selected an SVG fallback for every iOS browser before checking whether WebGL worked, so iPhone users could not see the shader.

The earlier report that the shader looked static on a physical iPhone was not reproduced independently. This note documents the confirmed fallback regression and the compatibility changes, not a proven root cause for that original hardware report.

## Symptoms

- After the iOS user-agent check was added, the canvas was hidden and the SVG fallback shown on iOS, even when WebGL was available.
- The fallback looked different from the shader the user requested.

## What Didn't Work

- Raising the shader to `highp` alone did not establish that the animation worked on physical iOS hardware.
- Forcing the SVG fallback made the displayed shape move, but it bypassed the shader instead of fixing its mobile rendering path.
- Switching to SVG when the animation watchdog fired hid the WebGL canvas rather than trying to resume its render loop.

## Solution

In `apps/web/src/components/BlobField.astro`, remove the iOS user-agent/platform branch that calls `useFallback()` before WebGL initialization. Select the same fragment shader based on the available precision: use `highp` when supported and compile its `mediump` variant otherwise. Keep the shader clock bounded more tightly for `mediump` devices (32 seconds versus 1024 seconds for `highp`) to limit the time value passed to lower-precision arithmetic. These periods are not seamless shader-time cycles, so wrapping can visibly jump; this is a precision tradeoff, not phase-continuous looping.

If the animation watchdog detects that `requestAnimationFrame` callbacks have stalled, stop and attempt to restart that loop instead of switching to SVG. The watchdog does not detect a GPU/context hang or verify that a new frame was drawn. Keep the SVG fallback for actual capability or setup failures, such as unavailable WebGL, shader/program/buffer initialization failure, or context loss.

## Why This Works

The renderer is selected by WebGL capability rather than the browser's user-agent string. Supported iOS browsers therefore follow the same WebGL setup and shader draw path. The `mediump` variant keeps the same shader calculations available on devices without fragment `highp`; its shorter clock period limits the value's magnitude, at the cost of a possible visible jump at wrap. The watchdog attempts to reschedule the animation loop and keeps the WebGL canvas selected, but does not guarantee that a stalled GPU resumes drawing.

The confirmed cause of the fallback regression was the unconditional iOS branch. The exact reason the shader originally appeared static on the user's physical iPhone remains unverified.

## Prevention

- Prefer capability checks over user-agent routing when choosing between renderers; do not replace the requested renderer solely because a browser identifies as iOS.
- Add a mobile browser regression check that asserts WebGL is active and the fallback class is absent, then compares captures separated in time over the blob region.
- Verify on physical iOS/WebKit when available. A Chromium mobile viewport with an iPhone Chrome user-agent is not a physical-device test.
- Exercise both precision modes across their clock-wrap boundaries; if the visible jump is unacceptable, use a phase-continuous bounded clock rather than increasing the period blindly.

Verification for the correction: the web build and production deployment passed. In Chromium at a mobile viewport using an iPhone Chrome user-agent, both production canvases had WebGL contexts, `blob-field--fallback` was absent, fragment `highp` precision was 23, and screenshots 800 ms apart differed in the shader region. Physical iOS was not available for verification.

## Related Issues

- `apps/web/src/components/BlobField.astro` — shader setup, precision selection, animation loop, context-loss handling, and watchdog.
- `5c3891d` introduced the iOS fallback; `c8cc132` removed the user-agent branch and restored the WebGL path.
- [Production CI/CD run](https://github.com/ovenmakemeheat/piang-note/actions/runs/41289716805).
