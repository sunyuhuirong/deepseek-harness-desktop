/**
 * 主题 token 清单与预设主题。
 *
 * DSH 的全部配色由 --dsw-* CSS 变量（token）控制。预设主题覆盖
 * alias/specific 层的常用 token；自定义面板开放其中一部分做微调。
 * overrideTokens 要求每个 token 提供 { light, dark } 两个色值。
 */

export const PRESET_THEMES = {
  default: { labelKey: 'preset.default', light: {}, dark: {} },
  minimal: {
    labelKey: 'preset.minimal',
    light: {
      '--dsw-alias-bg-base': '#ffffff',
      '--dsw-alias-bg-layer-1': '#fafafa',
      '--dsw-alias-bg-layer-2': '#f4f4f5',
      '--dsw-alias-bg-overlay': '#fafafa',
      '--dsw-alias-bg-module-platform': '#fafafa',
      '--dsw-specific-sidebar-fill': '#fafafa',
      '--dsw-alias-label-primary': '#18181b',
      '--dsw-alias-label-secondary': '#52525b',
      '--dsw-alias-label-tertiary': '#a1a1aa',
      '--dsw-alias-label-primary-dimmed': '#71717a',
      '--dsw-alias-brand-primary': '#3f3f46',
      '--dsw-alias-brand-text': '#ffffff',
      '--dsw-alias-border-l1': '#e4e4e7',
      '--dsw-alias-border-l2': '#d4d4d8',
      '--dsw-alias-state-error-primary': '#dc2626',
      '--dsw-alias-state-success-primary': '#16a34a',
      '--dsw-alias-state-warn-primary': '#d97706',
      '--dsw-alias-state-business-primary': '#3f3f46',
      '--dsw-alias-interactive-bg-hover': '#ececee',
      '--dsw-alias-interactive-bg-active': '#e4e4e7',
      '--dsw-alias-button-primary-fill': '#18181b',
      '--dsw-alias-button-primary-hover': '#27272a'
    },
    dark: {
      '--dsw-alias-bg-base': '#09090b',
      '--dsw-alias-bg-layer-1': '#101013',
      '--dsw-alias-bg-layer-2': '#18181b',
      '--dsw-alias-bg-overlay': '#101013',
      '--dsw-alias-bg-module-platform': '#18181b',
      '--dsw-specific-sidebar-fill': '#101013',
      '--dsw-alias-label-primary': '#fafafa',
      '--dsw-alias-label-secondary': '#a1a1aa',
      '--dsw-alias-label-tertiary': '#63636b',
      '--dsw-alias-label-primary-dimmed': '#8a8a93',
      '--dsw-alias-brand-primary': '#fafafa',
      '--dsw-alias-brand-text': '#09090b',
      '--dsw-alias-border-l1': '#27272a',
      '--dsw-alias-border-l2': '#3f3f46',
      '--dsw-alias-state-error-primary': '#f87171',
      '--dsw-alias-state-success-primary': '#4ade80',
      '--dsw-alias-state-warn-primary': '#fbbf24',
      '--dsw-alias-state-business-primary': '#a1a1aa',
      '--dsw-alias-interactive-bg-hover': '#1f1f22',
      '--dsw-alias-interactive-bg-active': '#27272a',
      '--dsw-alias-button-primary-fill': '#fafafa',
      '--dsw-alias-button-primary-hover': '#e4e4e7'
    }
  },
  violet: {
    labelKey: 'preset.violet',
    light: {
      '--dsw-alias-bg-base': '#faf8ff',
      '--dsw-alias-bg-layer-1': '#f5f1ff',
      '--dsw-alias-bg-layer-2': '#eee9fb',
      '--dsw-alias-bg-overlay': '#f5f1ff',
      '--dsw-alias-bg-module-platform': '#eee9fb',
      '--dsw-specific-sidebar-fill': '#f5f1ff',
      '--dsw-alias-label-primary': '#2a2350',
      '--dsw-alias-label-secondary': '#5b5386',
      '--dsw-alias-label-tertiary': '#9a93bd',
      '--dsw-alias-label-primary-dimmed': '#756db0',
      '--dsw-alias-brand-primary': '#7c3aed',
      '--dsw-alias-brand-text': '#ffffff',
      '--dsw-alias-border-l1': '#e4e0f3',
      '--dsw-alias-border-l2': '#d3cceb',
      '--dsw-alias-state-error-primary': '#dc2626',
      '--dsw-alias-state-success-primary': '#16a34a',
      '--dsw-alias-state-warn-primary': '#d97706',
      '--dsw-alias-state-business-primary': '#7c3aed',
      '--dsw-alias-interactive-bg-hover': '#e8e2f8',
      '--dsw-alias-interactive-bg-active': '#ddd4f4',
      '--dsw-alias-button-primary-fill': '#7c3aed',
      '--dsw-alias-button-primary-hover': '#6d28d9'
    },
    dark: {
      '--dsw-alias-bg-base': '#12101f',
      '--dsw-alias-bg-layer-1': '#181529',
      '--dsw-alias-bg-layer-2': '#201c36',
      '--dsw-alias-bg-overlay': '#181529',
      '--dsw-alias-bg-module-platform': '#201c36',
      '--dsw-specific-sidebar-fill': '#181529',
      '--dsw-alias-label-primary': '#ece7fb',
      '--dsw-alias-label-secondary': '#a79fd1',
      '--dsw-alias-label-tertiary': '#6f6898',
      '--dsw-alias-label-primary-dimmed': '#8f88b8',
      '--dsw-alias-brand-primary': '#a78bfa',
      '--dsw-alias-brand-text': '#1c1740',
      '--dsw-alias-border-l1': '#2a2547',
      '--dsw-alias-border-l2': '#3b3470',
      '--dsw-alias-state-error-primary': '#f87171',
      '--dsw-alias-state-success-primary': '#4ade80',
      '--dsw-alias-state-warn-primary': '#fbbf24',
      '--dsw-alias-state-business-primary': '#a78bfa',
      '--dsw-alias-interactive-bg-hover': '#241f40',
      '--dsw-alias-interactive-bg-active': '#2e2850',
      '--dsw-alias-button-primary-fill': '#7c3aed',
      '--dsw-alias-button-primary-hover': '#8b5cf6'
    }
  },
  forest: {
    labelKey: 'preset.forest',
    light: {
      '--dsw-alias-bg-base': '#f8fbf6',
      '--dsw-alias-bg-layer-1': '#f1f8ef',
      '--dsw-alias-bg-layer-2': '#e8f2e5',
      '--dsw-alias-bg-overlay': '#f1f8ef',
      '--dsw-alias-bg-module-platform': '#e8f2e5',
      '--dsw-specific-sidebar-fill': '#f1f8ef',
      '--dsw-alias-label-primary': '#1f3d23',
      '--dsw-alias-label-secondary': '#4e6b52',
      '--dsw-alias-label-tertiary': '#8aa58d',
      '--dsw-alias-label-primary-dimmed': '#6b8a6f',
      '--dsw-alias-brand-primary': '#2f9e44',
      '--dsw-alias-brand-text': '#ffffff',
      '--dsw-alias-border-l1': '#ddebd8',
      '--dsw-alias-border-l2': '#c9dfc3',
      '--dsw-alias-state-error-primary': '#dc2626',
      '--dsw-alias-state-success-primary': '#2f9e44',
      '--dsw-alias-state-warn-primary': '#d97706',
      '--dsw-alias-state-business-primary': '#2f9e44',
      '--dsw-alias-interactive-bg-hover': '#e2efdf',
      '--dsw-alias-interactive-bg-active': '#d7e8d3',
      '--dsw-alias-button-primary-fill': '#2f9e44',
      '--dsw-alias-button-primary-hover': '#2b8a3e'
    },
    dark: {
      '--dsw-alias-bg-base': '#0e1712',
      '--dsw-alias-bg-layer-1': '#131f18',
      '--dsw-alias-bg-layer-2': '#1a2a1f',
      '--dsw-alias-bg-overlay': '#131f18',
      '--dsw-alias-bg-module-platform': '#1a2a1f',
      '--dsw-specific-sidebar-fill': '#131f18',
      '--dsw-alias-label-primary': '#e4f2e6',
      '--dsw-alias-label-secondary': '#9cbfa3',
      '--dsw-alias-label-tertiary': '#5f8266',
      '--dsw-alias-label-primary-dimmed': '#84a88c',
      '--dsw-alias-brand-primary': '#69db7c',
      '--dsw-alias-brand-text': '#0f2013',
      '--dsw-alias-border-l1': '#223527',
      '--dsw-alias-border-l2': '#2f4a36',
      '--dsw-alias-state-error-primary': '#f87171',
      '--dsw-alias-state-success-primary': '#4ade80',
      '--dsw-alias-state-warn-primary': '#fbbf24',
      '--dsw-alias-state-business-primary': '#69db7c',
      '--dsw-alias-interactive-bg-hover': '#1a2b20',
      '--dsw-alias-interactive-bg-active': '#24402c',
      '--dsw-alias-button-primary-fill': '#2f9e44',
      '--dsw-alias-button-primary-hover': '#37b24d'
    }
  },
  amber: {
    labelKey: 'preset.amber',
    light: {
      '--dsw-alias-bg-base': '#fffcf7',
      '--dsw-alias-bg-layer-1': '#fbf5ea',
      '--dsw-alias-bg-layer-2': '#f5ecdb',
      '--dsw-alias-bg-overlay': '#fbf5ea',
      '--dsw-alias-bg-module-platform': '#f5ecdb',
      '--dsw-specific-sidebar-fill': '#fbf5ea',
      '--dsw-alias-label-primary': '#3a2e1e',
      '--dsw-alias-label-secondary': '#6f5d42',
      '--dsw-alias-label-tertiary': '#a89b83',
      '--dsw-alias-label-primary-dimmed': '#8a7959',
      '--dsw-alias-brand-primary': '#d97706',
      '--dsw-alias-brand-text': '#ffffff',
      '--dsw-alias-border-l1': '#efe3cc',
      '--dsw-alias-border-l2': '#e2d2b2',
      '--dsw-alias-state-error-primary': '#dc2626',
      '--dsw-alias-state-success-primary': '#16a34a',
      '--dsw-alias-state-warn-primary': '#d97706',
      '--dsw-alias-state-business-primary': '#d97706',
      '--dsw-alias-interactive-bg-hover': '#f0e7d3',
      '--dsw-alias-interactive-bg-active': '#e8dac0',
      '--dsw-alias-button-primary-fill': '#d97706',
      '--dsw-alias-button-primary-hover': '#b45309'
    },
    dark: {
      '--dsw-alias-bg-base': '#1b1610',
      '--dsw-alias-bg-layer-1': '#241d14',
      '--dsw-alias-bg-layer-2': '#2f261a',
      '--dsw-alias-bg-overlay': '#241d14',
      '--dsw-alias-bg-module-platform': '#2f261a',
      '--dsw-specific-sidebar-fill': '#241d14',
      '--dsw-alias-label-primary': '#f5ead9',
      '--dsw-alias-label-secondary': '#c0ac8c',
      '--dsw-alias-label-tertiary': '#857155',
      '--dsw-alias-label-primary-dimmed': '#a89372',
      '--dsw-alias-brand-primary': '#fbbf24',
      '--dsw-alias-brand-text': '#2a1f0d',
      '--dsw-alias-border-l1': '#3a2f21',
      '--dsw-alias-border-l2': '#4f412c',
      '--dsw-alias-state-error-primary': '#f87171',
      '--dsw-alias-state-success-primary': '#4ade80',
      '--dsw-alias-state-warn-primary': '#fbbf24',
      '--dsw-alias-state-business-primary': '#fbbf24',
      '--dsw-alias-interactive-bg-hover': '#2c2417',
      '--dsw-alias-interactive-bg-active': '#453624',
      '--dsw-alias-button-primary-fill': '#d97706',
      '--dsw-alias-button-primary-hover': '#b45309'
    }
  }
};

/**
 * 自定义面板开放的 token（按分组）。每个条目 [CSS 变量名, 文案键]。
 * 全部使用 hex 值，便于 <input type="color"> 编辑。
 */
export const CUSTOM_TOKEN_GROUPS = [
  {
    id: 'background',
    labelKey: 'tokens.background',
    tokens: [
      ['--dsw-alias-bg-base', 'token.bgBase'],
      ['--dsw-alias-bg-layer-1', 'token.bgLayer1'],
      ['--dsw-alias-bg-layer-2', 'token.bgLayer2'],
      ['--dsw-alias-bg-overlay', 'token.bgOverlay'],
      ['--dsw-alias-bg-module-platform', 'token.bgModule'],
      ['--dsw-specific-sidebar-fill', 'token.sidebarFill']
    ]
  },
  {
    id: 'text',
    labelKey: 'tokens.text',
    tokens: [
      ['--dsw-alias-label-primary', 'token.labelPrimary'],
      ['--dsw-alias-label-secondary', 'token.labelSecondary'],
      ['--dsw-alias-label-tertiary', 'token.labelTertiary'],
      ['--dsw-alias-label-primary-dimmed', 'token.labelDimmed']
    ]
  },
  {
    id: 'brand',
    labelKey: 'tokens.brand',
    tokens: [
      ['--dsw-alias-brand-primary', 'token.brandPrimary'],
      ['--dsw-alias-brand-text', 'token.brandText']
    ]
  },
  {
    id: 'border',
    labelKey: 'tokens.border',
    tokens: [
      ['--dsw-alias-border-l1', 'token.borderL1'],
      ['--dsw-alias-border-l2', 'token.borderL2']
    ]
  },
  {
    id: 'state',
    labelKey: 'tokens.state',
    tokens: [
      ['--dsw-alias-state-error-primary', 'token.stateError'],
      ['--dsw-alias-state-success-primary', 'token.stateSuccess'],
      ['--dsw-alias-state-warn-primary', 'token.stateWarn'],
      ['--dsw-alias-state-business-primary', 'token.stateBusiness']
    ]
  }
];
