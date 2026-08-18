import { useEffect, useState } from 'react';
import { PRESET_THEMES, CUSTOM_TOKEN_GROUPS } from './tokens.js';

function useSnapshot(scope) {
  const [cfg, setCfg] = useState(() => scope.getSnapshot().value ?? {});
  useEffect(() => scope.subscribe(() => {
    setCfg(scope.getSnapshot().value ?? {});
  }), [scope]);
  return cfg;
}

function useScopeSet(scope, cfg) {
  return (field, value) => {
    if (value === undefined) scope.unset(field);
    else scope.set(field, value);
  };
}

function tokenValue(cfg, name, mode) {
  const preset = PRESET_THEMES[cfg.themePreset] ?? PRESET_THEMES.default;
  const custom = cfg.customTokens?.[name];
  return custom?.[mode] ?? preset.light?.[name] ?? preset.dark?.[name] ?? '';
}

function tokenAlpha(cfg, name, mode) {
  const custom = cfg.customTokens?.[name];
  return typeof custom?.[`${mode}Alpha`] === 'number' ? custom[`${mode}Alpha`] : 100;
}

function clampAlpha(value) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function AppearanceSection({ t, scope }) {
  const cfg = useSnapshot(scope);
  const set = useScopeSet(scope, cfg);

  const updateToken = (name, mode, value) => {
    const next = {
      ...(cfg.customTokens ?? {}),
      [name]: {
        light: tokenValue(cfg, name, 'light'),
        dark: tokenValue(cfg, name, 'dark'),
        lightAlpha: tokenAlpha(cfg, name, 'light'),
        darkAlpha: tokenAlpha(cfg, name, 'dark'),
        [mode]: value
      }
    };
    set('customTokens', next);
  };

  const updateAlpha = (name, mode, value) => {
    const next = {
      ...(cfg.customTokens ?? {}),
      [name]: {
        light: tokenValue(cfg, name, 'light'),
        dark: tokenValue(cfg, name, 'dark'),
        lightAlpha: tokenAlpha(cfg, name, 'light'),
        darkAlpha: tokenAlpha(cfg, name, 'dark'),
        [`${mode}Alpha`]: clampAlpha(value)
      }
    };
    set('customTokens', next);
  };

  const renderMode = (name, mode) => (
    <label className="dsh-appearance-mode">
      <span className="dsh-appearance-mode-label">{t(mode === 'light' ? 'token.light' : 'token.dark')}</span>
      <input
        type="color"
        value={tokenValue(cfg, name, mode)}
        onChange={(event) => updateToken(name, mode, event.target.value)}
      />
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={tokenAlpha(cfg, name, mode)}
        title={t('token.alpha')}
        onChange={(event) => updateAlpha(name, mode, Number(event.target.value))}
      />
      <span className="dsh-appearance-alpha-value">{tokenAlpha(cfg, name, mode)}%</span>
    </label>
  );

  return (
    <div className="dsh-appearance-section">
      <h3>{t('section.preset')}</h3>
      <div className="dsh-appearance-preset-grid">
        {Object.entries(PRESET_THEMES).map(([id, preset]) => (
          <button
            key={id}
            type="button"
            onClick={() => set('themePreset', id)}
            className={id === (cfg.themePreset ?? 'default') ? 'dsh-appearance-active' : ''}
          >
            {t(preset.labelKey)}
          </button>
        ))}
      </div>
      {cfg.themePreset && cfg.themePreset !== 'default' && (
        <button type="button" onClick={() => set('themePreset', 'default')}>
          {t('preset.reset')}
        </button>
      )}

      <h3>{t('section.tokens')}</h3>
      {CUSTOM_TOKEN_GROUPS.map((group) => (
        <fieldset key={group.id} className="dsh-appearance-token-group">
          <legend>{t(group.labelKey)}</legend>
          {group.tokens.map(([name, labelKey]) => (
            <div key={name} className="dsh-appearance-token-row">
              <span className="dsh-appearance-token-label">{t(labelKey)}</span>
              {renderMode(name, 'light')}
              {renderMode(name, 'dark')}
            </div>
          ))}
        </fieldset>
      ))}
      {cfg.customTokens && Object.keys(cfg.customTokens).length > 0 && (
        <button type="button" onClick={() => scope.unset('customTokens')}>
          {t('token.clear')}
        </button>
      )}
    </div>
  );
}
