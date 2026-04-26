import { MOOD_PRESETS } from '../models/log.model';

const PRESET_SLUGS = new Set(
  MOOD_PRESETS.map((m) => m.toLowerCase().replace(/\s+/g, '-')),
);

/**
 * CSS class string for log mood pills: base layout + `cotc-mood-pill--{mood}` for glow/colors.
 * Unknown / custom mood strings use `--custom` (neutral purple, same as default).
 */
export function moodPillThemeClass(
  mood: string | null | undefined,
  options?: { listItem?: boolean },
): string {
  const layout = options?.listItem
    ? 'cotc-mood-pill cotc-mood-pill--list'
    : 'cotc-mood-pill';
  if (!mood?.trim()) {
    return `${layout} cotc-mood-pill--default`;
  }
  const slug = mood.trim().toLowerCase().replace(/\s+/g, '-');
  if (!PRESET_SLUGS.has(slug)) {
    return `${layout} cotc-mood-pill--custom`;
  }
  return `${layout} cotc-mood-pill--${slug}`;
}
