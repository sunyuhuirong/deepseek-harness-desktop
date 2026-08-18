import { PRESET_THEMES } from './tokens.js';

/**
 * 主题引擎：把「预设主题 + 自定义 token」合并成 overrideTokens 的格式
 * （{ '--dsw-*': { light, dark } }），并应用到 ctx.theme。
 *
 * 相同 source id 重复调用 overrideTokens 会替换上一次覆盖，因此
 * 设置每次变更时重新 apply 即可，无需手动拆除（仍保留 disposer 防御）。
 */
export function createThemeEngine(ctx, scope) {
  const source = 'dsh-appearance';
  let disposer = null;

  function composeTokens(cfg) {
    const preset = PRESET_THEMES[cfg.themePreset] ?? PRESET_THEMES.default;
    const custom = cfg.customTokens ?? {};
    const names = new Set([
      ...Object.keys(preset.light),
      ...Object.keys(preset.dark),
      ...Object.keys(custom)
    ]);
    const out = {};
    for (const name of names) {
      const c = custom[name];
      out[name] = {
        light: c?.light || preset.light[name] || preset.dark[name] || '',
        dark: c?.dark || preset.dark[name] || preset.light[name] || ''
      };
    }
    return out;
  }

  function apply() {
    const cfg = scope.getSnapshot().value ?? {};
    const tokens = composeTokens(cfg);
    disposer?.();
    disposer = null;
    if (Object.keys(tokens).length === 0) return;
    try {
      disposer = ctx.theme.overrideTokens(source, tokens);
    } catch (error) {
      ctx.logger?.warn?.('[dsh-appearance] theme apply failed', error);
    }
  }

  return { apply };
}
