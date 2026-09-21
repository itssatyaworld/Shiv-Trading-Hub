/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#10243d',
    tint: '#ef7d24',

    // Core surfaces
    background: '#f7f8fa',
    foreground: '#10243d',

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#10243d',

    // Primary action color (buttons, links, active states)
    primary: '#ef7d24',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#e8edf3',
    secondaryForeground: '#10243d',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#eef1f4',
    mutedForeground: '#6c7786',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#ffe8d5',
    accentForeground: '#a84f0d',

    // Destructive actions (delete, error states)
    destructive: '#c94747',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#dce3ea',
    input: '#dce3ea',
    navy: '#10243d',
  },

  dark: {
    text: '#f7f8fa',
    tint: '#ff9b4b',
    background: '#0d1b2c',
    foreground: '#f7f8fa',
    card: '#15283d',
    cardForeground: '#f7f8fa',
    primary: '#ff8d37',
    primaryForeground: '#0d1b2c',
    secondary: '#20364e',
    secondaryForeground: '#f7f8fa',
    muted: '#20364e',
    mutedForeground: '#b9c4d1',
    accent: '#4a2e1b',
    accentForeground: '#ffd3b0',
    destructive: '#f07474',
    destructiveForeground: '#ffffff',
    border: '#2b425a',
    input: '#2b425a',
    navy: '#071321',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 14,
};

export default colors;
