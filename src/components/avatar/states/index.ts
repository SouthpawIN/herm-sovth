import defaultEikonText from "../default.eikon" with { type: "text" };
import { parseEikon, type EikonState } from "../eikon";

export type AvatarState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "working"
  | "error";

// The bundled default avatar (built via eikon/scripts/mk_eikon.ts) is
// the source of truth; `/eikon`-picked files override per state. A
// one-frame blank guards against a malformed bundle — the sidebar box
// is fixed-height so worst case is an empty pillar, not a crash.
const BLANK: EikonState = { fps: 1, loopFrom: 1, frames: [[""]] };

export const DEFAULT_EIKON = (() => {
  try { return parseEikon(defaultEikonText) } catch { return undefined }
})();

// Senter's presentation mapping: listening/working are active thought,
// error is a held speaking frame so the avatar stays expressive while the
// error banner is visible. The bundled Eikon still owns the actual art.
export const EIKON_STATE_MAPPING: Record<AvatarState, string> = {
  idle: "idle",
  listening: "thinking",
  thinking: "thinking",
  speaking: "speaking",
  working: "thinking",
  error: "speaking",
};

const mapped = (name: string, fallback: AvatarState = "idle") =>
  DEFAULT_EIKON?.states.get(name) ?? DEFAULT_EIKON?.states.get(fallback) ?? BLANK;

export const STATE_FRAMES: Record<AvatarState, EikonState> = {
  idle: mapped("idle"),
  listening: mapped("thinking"),
  thinking: mapped("thinking"),
  speaking: mapped("speaking"),
  working: mapped("thinking"),
  error: mapped("speaking"),
};
