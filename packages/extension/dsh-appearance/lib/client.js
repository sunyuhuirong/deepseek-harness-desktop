window.__ModuleLoader__.load({
	id: "dsh-appearance",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.jsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/tokens.js
var PRESET_THEMES = {
  default: { labelKey: "preset.default", light: {}, dark: {} },
  minimal: {
    labelKey: "preset.minimal",
    light: {
      "--dsw-alias-bg-base": "#ffffff",
      "--dsw-alias-bg-layer-1": "#fafafa",
      "--dsw-alias-bg-layer-2": "#f4f4f5",
      "--dsw-alias-bg-overlay": "#fafafa",
      "--dsw-alias-bg-module-platform": "#fafafa",
      "--dsw-specific-sidebar-fill": "#fafafa",
      "--dsw-alias-label-primary": "#18181b",
      "--dsw-alias-label-secondary": "#52525b",
      "--dsw-alias-label-tertiary": "#a1a1aa",
      "--dsw-alias-label-primary-dimmed": "#71717a",
      "--dsw-alias-brand-primary": "#3f3f46",
      "--dsw-alias-brand-text": "#ffffff",
      "--dsw-alias-border-l1": "#e4e4e7",
      "--dsw-alias-border-l2": "#d4d4d8",
      "--dsw-alias-state-error-primary": "#dc2626",
      "--dsw-alias-state-success-primary": "#16a34a",
      "--dsw-alias-state-warn-primary": "#d97706",
      "--dsw-alias-state-business-primary": "#3f3f46",
      "--dsw-alias-interactive-bg-hover": "#ececee",
      "--dsw-alias-interactive-bg-active": "#e4e4e7",
      "--dsw-alias-button-primary-fill": "#18181b",
      "--dsw-alias-button-primary-hover": "#27272a"
    },
    dark: {
      "--dsw-alias-bg-base": "#09090b",
      "--dsw-alias-bg-layer-1": "#101013",
      "--dsw-alias-bg-layer-2": "#18181b",
      "--dsw-alias-bg-overlay": "#101013",
      "--dsw-alias-bg-module-platform": "#18181b",
      "--dsw-specific-sidebar-fill": "#101013",
      "--dsw-alias-label-primary": "#fafafa",
      "--dsw-alias-label-secondary": "#a1a1aa",
      "--dsw-alias-label-tertiary": "#63636b",
      "--dsw-alias-label-primary-dimmed": "#8a8a93",
      "--dsw-alias-brand-primary": "#fafafa",
      "--dsw-alias-brand-text": "#09090b",
      "--dsw-alias-border-l1": "#27272a",
      "--dsw-alias-border-l2": "#3f3f46",
      "--dsw-alias-state-error-primary": "#f87171",
      "--dsw-alias-state-success-primary": "#4ade80",
      "--dsw-alias-state-warn-primary": "#fbbf24",
      "--dsw-alias-state-business-primary": "#a1a1aa",
      "--dsw-alias-interactive-bg-hover": "#1f1f22",
      "--dsw-alias-interactive-bg-active": "#27272a",
      "--dsw-alias-button-primary-fill": "#fafafa",
      "--dsw-alias-button-primary-hover": "#e4e4e7"
    }
  },
  violet: {
    labelKey: "preset.violet",
    light: {
      "--dsw-alias-bg-base": "#faf8ff",
      "--dsw-alias-bg-layer-1": "#f5f1ff",
      "--dsw-alias-bg-layer-2": "#eee9fb",
      "--dsw-alias-bg-overlay": "#f5f1ff",
      "--dsw-alias-bg-module-platform": "#eee9fb",
      "--dsw-specific-sidebar-fill": "#f5f1ff",
      "--dsw-alias-label-primary": "#2a2350",
      "--dsw-alias-label-secondary": "#5b5386",
      "--dsw-alias-label-tertiary": "#9a93bd",
      "--dsw-alias-label-primary-dimmed": "#756db0",
      "--dsw-alias-brand-primary": "#7c3aed",
      "--dsw-alias-brand-text": "#ffffff",
      "--dsw-alias-border-l1": "#e4e0f3",
      "--dsw-alias-border-l2": "#d3cceb",
      "--dsw-alias-state-error-primary": "#dc2626",
      "--dsw-alias-state-success-primary": "#16a34a",
      "--dsw-alias-state-warn-primary": "#d97706",
      "--dsw-alias-state-business-primary": "#7c3aed",
      "--dsw-alias-interactive-bg-hover": "#e8e2f8",
      "--dsw-alias-interactive-bg-active": "#ddd4f4",
      "--dsw-alias-button-primary-fill": "#7c3aed",
      "--dsw-alias-button-primary-hover": "#6d28d9"
    },
    dark: {
      "--dsw-alias-bg-base": "#12101f",
      "--dsw-alias-bg-layer-1": "#181529",
      "--dsw-alias-bg-layer-2": "#201c36",
      "--dsw-alias-bg-overlay": "#181529",
      "--dsw-alias-bg-module-platform": "#201c36",
      "--dsw-specific-sidebar-fill": "#181529",
      "--dsw-alias-label-primary": "#ece7fb",
      "--dsw-alias-label-secondary": "#a79fd1",
      "--dsw-alias-label-tertiary": "#6f6898",
      "--dsw-alias-label-primary-dimmed": "#8f88b8",
      "--dsw-alias-brand-primary": "#a78bfa",
      "--dsw-alias-brand-text": "#1c1740",
      "--dsw-alias-border-l1": "#2a2547",
      "--dsw-alias-border-l2": "#3b3470",
      "--dsw-alias-state-error-primary": "#f87171",
      "--dsw-alias-state-success-primary": "#4ade80",
      "--dsw-alias-state-warn-primary": "#fbbf24",
      "--dsw-alias-state-business-primary": "#a78bfa",
      "--dsw-alias-interactive-bg-hover": "#241f40",
      "--dsw-alias-interactive-bg-active": "#2e2850",
      "--dsw-alias-button-primary-fill": "#7c3aed",
      "--dsw-alias-button-primary-hover": "#8b5cf6"
    }
  },
  forest: {
    labelKey: "preset.forest",
    light: {
      "--dsw-alias-bg-base": "#f8fbf6",
      "--dsw-alias-bg-layer-1": "#f1f8ef",
      "--dsw-alias-bg-layer-2": "#e8f2e5",
      "--dsw-alias-bg-overlay": "#f1f8ef",
      "--dsw-alias-bg-module-platform": "#e8f2e5",
      "--dsw-specific-sidebar-fill": "#f1f8ef",
      "--dsw-alias-label-primary": "#1f3d23",
      "--dsw-alias-label-secondary": "#4e6b52",
      "--dsw-alias-label-tertiary": "#8aa58d",
      "--dsw-alias-label-primary-dimmed": "#6b8a6f",
      "--dsw-alias-brand-primary": "#2f9e44",
      "--dsw-alias-brand-text": "#ffffff",
      "--dsw-alias-border-l1": "#ddebd8",
      "--dsw-alias-border-l2": "#c9dfc3",
      "--dsw-alias-state-error-primary": "#dc2626",
      "--dsw-alias-state-success-primary": "#2f9e44",
      "--dsw-alias-state-warn-primary": "#d97706",
      "--dsw-alias-state-business-primary": "#2f9e44",
      "--dsw-alias-interactive-bg-hover": "#e2efdf",
      "--dsw-alias-interactive-bg-active": "#d7e8d3",
      "--dsw-alias-button-primary-fill": "#2f9e44",
      "--dsw-alias-button-primary-hover": "#2b8a3e"
    },
    dark: {
      "--dsw-alias-bg-base": "#0e1712",
      "--dsw-alias-bg-layer-1": "#131f18",
      "--dsw-alias-bg-layer-2": "#1a2a1f",
      "--dsw-alias-bg-overlay": "#131f18",
      "--dsw-alias-bg-module-platform": "#1a2a1f",
      "--dsw-specific-sidebar-fill": "#131f18",
      "--dsw-alias-label-primary": "#e4f2e6",
      "--dsw-alias-label-secondary": "#9cbfa3",
      "--dsw-alias-label-tertiary": "#5f8266",
      "--dsw-alias-label-primary-dimmed": "#84a88c",
      "--dsw-alias-brand-primary": "#69db7c",
      "--dsw-alias-brand-text": "#0f2013",
      "--dsw-alias-border-l1": "#223527",
      "--dsw-alias-border-l2": "#2f4a36",
      "--dsw-alias-state-error-primary": "#f87171",
      "--dsw-alias-state-success-primary": "#4ade80",
      "--dsw-alias-state-warn-primary": "#fbbf24",
      "--dsw-alias-state-business-primary": "#69db7c",
      "--dsw-alias-interactive-bg-hover": "#1a2b20",
      "--dsw-alias-interactive-bg-active": "#24402c",
      "--dsw-alias-button-primary-fill": "#2f9e44",
      "--dsw-alias-button-primary-hover": "#37b24d"
    }
  },
  amber: {
    labelKey: "preset.amber",
    light: {
      "--dsw-alias-bg-base": "#fffcf7",
      "--dsw-alias-bg-layer-1": "#fbf5ea",
      "--dsw-alias-bg-layer-2": "#f5ecdb",
      "--dsw-alias-bg-overlay": "#fbf5ea",
      "--dsw-alias-bg-module-platform": "#f5ecdb",
      "--dsw-specific-sidebar-fill": "#fbf5ea",
      "--dsw-alias-label-primary": "#3a2e1e",
      "--dsw-alias-label-secondary": "#6f5d42",
      "--dsw-alias-label-tertiary": "#a89b83",
      "--dsw-alias-label-primary-dimmed": "#8a7959",
      "--dsw-alias-brand-primary": "#d97706",
      "--dsw-alias-brand-text": "#ffffff",
      "--dsw-alias-border-l1": "#efe3cc",
      "--dsw-alias-border-l2": "#e2d2b2",
      "--dsw-alias-state-error-primary": "#dc2626",
      "--dsw-alias-state-success-primary": "#16a34a",
      "--dsw-alias-state-warn-primary": "#d97706",
      "--dsw-alias-state-business-primary": "#d97706",
      "--dsw-alias-interactive-bg-hover": "#f0e7d3",
      "--dsw-alias-interactive-bg-active": "#e8dac0",
      "--dsw-alias-button-primary-fill": "#d97706",
      "--dsw-alias-button-primary-hover": "#b45309"
    },
    dark: {
      "--dsw-alias-bg-base": "#1b1610",
      "--dsw-alias-bg-layer-1": "#241d14",
      "--dsw-alias-bg-layer-2": "#2f261a",
      "--dsw-alias-bg-overlay": "#241d14",
      "--dsw-alias-bg-module-platform": "#2f261a",
      "--dsw-specific-sidebar-fill": "#241d14",
      "--dsw-alias-label-primary": "#f5ead9",
      "--dsw-alias-label-secondary": "#c0ac8c",
      "--dsw-alias-label-tertiary": "#857155",
      "--dsw-alias-label-primary-dimmed": "#a89372",
      "--dsw-alias-brand-primary": "#fbbf24",
      "--dsw-alias-brand-text": "#2a1f0d",
      "--dsw-alias-border-l1": "#3a2f21",
      "--dsw-alias-border-l2": "#4f412c",
      "--dsw-alias-state-error-primary": "#f87171",
      "--dsw-alias-state-success-primary": "#4ade80",
      "--dsw-alias-state-warn-primary": "#fbbf24",
      "--dsw-alias-state-business-primary": "#fbbf24",
      "--dsw-alias-interactive-bg-hover": "#2c2417",
      "--dsw-alias-interactive-bg-active": "#453624",
      "--dsw-alias-button-primary-fill": "#d97706",
      "--dsw-alias-button-primary-hover": "#b45309"
    }
  }
};
var CUSTOM_TOKEN_GROUPS = [
  {
    id: "background",
    labelKey: "tokens.background",
    tokens: [
      ["--dsw-alias-bg-base", "token.bgBase"],
      ["--dsw-alias-bg-layer-1", "token.bgLayer1"],
      ["--dsw-alias-bg-layer-2", "token.bgLayer2"],
      ["--dsw-alias-bg-overlay", "token.bgOverlay"],
      ["--dsw-alias-bg-module-platform", "token.bgModule"],
      ["--dsw-specific-sidebar-fill", "token.sidebarFill"]
    ]
  },
  {
    id: "text",
    labelKey: "tokens.text",
    tokens: [
      ["--dsw-alias-label-primary", "token.labelPrimary"],
      ["--dsw-alias-label-secondary", "token.labelSecondary"],
      ["--dsw-alias-label-tertiary", "token.labelTertiary"],
      ["--dsw-alias-label-primary-dimmed", "token.labelDimmed"]
    ]
  },
  {
    id: "brand",
    labelKey: "tokens.brand",
    tokens: [
      ["--dsw-alias-brand-primary", "token.brandPrimary"],
      ["--dsw-alias-brand-text", "token.brandText"]
    ]
  },
  {
    id: "border",
    labelKey: "tokens.border",
    tokens: [
      ["--dsw-alias-border-l1", "token.borderL1"],
      ["--dsw-alias-border-l2", "token.borderL2"]
    ]
  },
  {
    id: "state",
    labelKey: "tokens.state",
    tokens: [
      ["--dsw-alias-state-error-primary", "token.stateError"],
      ["--dsw-alias-state-success-primary", "token.stateSuccess"],
      ["--dsw-alias-state-warn-primary", "token.stateWarn"],
      ["--dsw-alias-state-business-primary", "token.stateBusiness"]
    ]
  }
];

// src/client/theme.js
function createThemeEngine(ctx, scope) {
  const source = "dsh-appearance";
  let disposer = null;
  function composeTokens(cfg) {
    const preset = PRESET_THEMES[cfg.themePreset] ?? PRESET_THEMES.default;
    const custom = cfg.customTokens ?? {};
    const names = /* @__PURE__ */ new Set([
      ...Object.keys(preset.light),
      ...Object.keys(preset.dark),
      ...Object.keys(custom)
    ]);
    const out = {};
    for (const name of names) {
      const c = custom[name];
      out[name] = {
        light: c?.light || preset.light[name] || preset.dark[name] || "",
        dark: c?.dark || preset.dark[name] || preset.light[name] || ""
      };
    }
    return out;
  }
  function apply2() {
    const cfg = scope.getSnapshot().value ?? {};
    const tokens = composeTokens(cfg);
    disposer?.();
    disposer = null;
    if (Object.keys(tokens).length === 0) return;
    try {
      disposer = ctx.theme.overrideTokens(source, tokens);
    } catch (error) {
      ctx.logger?.warn?.("[dsh-appearance] theme apply failed", error);
    }
  }
  return { apply: apply2 };
}

// src/client/settings.jsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function useSnapshot(scope) {
  const [cfg, setCfg] = (0, import_react.useState)(() => scope.getSnapshot().value ?? {});
  (0, import_react.useEffect)(() => scope.subscribe(() => {
    setCfg(scope.getSnapshot().value ?? {});
  }), [scope]);
  return cfg;
}
function useScopeSet(scope, cfg) {
  return (field, value) => {
    if (value === void 0) scope.unset(field);
    else scope.set(field, value);
  };
}
function tokenValue(cfg, name, mode) {
  const preset = PRESET_THEMES[cfg.themePreset] ?? PRESET_THEMES.default;
  const custom = cfg.customTokens?.[name];
  return custom?.[mode] ?? preset.light?.[name] ?? preset.dark?.[name] ?? "";
}
function AppearanceSection({ t, scope }) {
  const cfg = useSnapshot(scope);
  const set = useScopeSet(scope, cfg);
  const updateToken = (name, mode, value) => {
    const next = {
      ...cfg.customTokens ?? {},
      [name]: {
        light: tokenValue(cfg, name, "light"),
        dark: tokenValue(cfg, name, "dark"),
        [mode]: value
      }
    };
    set("customTokens", next);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-appearance-section", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: t("section.preset") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-appearance-preset-grid", children: Object.entries(PRESET_THEMES).map(([id, preset]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        onClick: () => set("themePreset", id),
        className: id === (cfg.themePreset ?? "default") ? "dsh-appearance-active" : "",
        children: t(preset.labelKey)
      },
      id
    )) }),
    cfg.themePreset && cfg.themePreset !== "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => set("themePreset", "default"), children: t("preset.reset") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: t("section.tokens") }),
    CUSTOM_TOKEN_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { className: "dsh-appearance-token-group", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", { children: t(group.labelKey) }),
      group.tokens.map(([name, labelKey]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-appearance-token-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-appearance-token-label", children: t(labelKey) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
          t("token.light"),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "color",
              value: tokenValue(cfg, name, "light"),
              onChange: (event) => updateToken(name, "light", event.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
          t("token.dark"),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "color",
              value: tokenValue(cfg, name, "dark"),
              onChange: (event) => updateToken(name, "dark", event.target.value)
            }
          )
        ] })
      ] }, name))
    ] }, group.id)),
    cfg.customTokens && Object.keys(cfg.customTokens).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => scope.unset("customTokens"), children: t("token.clear") })
  ] });
}

// src/client/locales.js
var zh = {
  "section.nav": "\u5916\u89C2",
  "section.preset": "\u9884\u8BBE\u4E3B\u9898",
  "section.tokens": "\u81EA\u5B9A\u4E49\u989C\u8272",
  "preset.default": "\u539F\u751F",
  "preset.minimal": "\u6781\u7B80\u9ED1\u767D",
  "preset.violet": "\u6697\u591C\u7D2B",
  "preset.forest": "\u62A4\u773C\u7EFF",
  "preset.amber": "\u6696\u68D5",
  "preset.reset": "\u6062\u590D\u9ED8\u8BA4\u4E3B\u9898",
  "tokens.background": "\u80CC\u666F",
  "tokens.text": "\u6587\u5B57",
  "tokens.brand": "\u54C1\u724C",
  "tokens.border": "\u8FB9\u6846",
  "tokens.state": "\u72B6\u6001",
  "token.bgBase": "\u5E94\u7528\u5E95\u8272",
  "token.bgLayer1": "\u5185\u5BB9\u5C42\u5E95\u8272",
  "token.bgLayer2": "\u6B21\u7EA7\u5C42\u5E95\u8272",
  "token.bgOverlay": "\u6D6E\u5C42\u5E95\u8272",
  "token.bgModule": "\u9762\u677F\u5E95\u8272",
  "token.sidebarFill": "\u4FA7\u8FB9\u680F\u5E95\u8272",
  "token.labelPrimary": "\u4E3B\u6587\u5B57",
  "token.labelSecondary": "\u6B21\u6587\u5B57",
  "token.labelTertiary": "\u8F85\u52A9\u6587\u5B57",
  "token.labelDimmed": "\u5F31\u5316\u6587\u5B57",
  "token.brandPrimary": "\u54C1\u724C\u8272",
  "token.brandText": "\u54C1\u724C\u6587\u5B57",
  "token.borderL1": "\u8FB9\u6846\uFF08\u7EC6\uFF09",
  "token.borderL2": "\u8FB9\u6846\uFF08\u7C97\uFF09",
  "token.stateError": "\u9519\u8BEF\u8272",
  "token.stateSuccess": "\u6210\u529F\u8272",
  "token.stateWarn": "\u8B66\u544A\u8272",
  "token.stateBusiness": "\u4E1A\u52A1\u8272",
  "token.light": "\u6D45\u8272",
  "token.dark": "\u6DF1\u8272",
  "token.clear": "\u6E05\u9664\u5168\u90E8\u81EA\u5B9A\u4E49\u989C\u8272"
};
var en = {
  "section.nav": "Appearance",
  "section.preset": "Preset themes",
  "section.tokens": "Custom colors",
  "preset.default": "Default",
  "preset.minimal": "Minimal",
  "preset.violet": "Violet Night",
  "preset.forest": "Forest",
  "preset.amber": "Amber",
  "preset.reset": "Reset to default theme",
  "tokens.background": "Background",
  "tokens.text": "Text",
  "tokens.brand": "Brand",
  "tokens.border": "Border",
  "tokens.state": "Status",
  "token.bgBase": "App background",
  "token.bgLayer1": "Layer background",
  "token.bgLayer2": "Secondary layer",
  "token.bgOverlay": "Overlay background",
  "token.bgModule": "Panel background",
  "token.sidebarFill": "Sidebar fill",
  "token.labelPrimary": "Primary text",
  "token.labelSecondary": "Secondary text",
  "token.labelTertiary": "Tertiary text",
  "token.labelDimmed": "Dimmed text",
  "token.brandPrimary": "Brand accent",
  "token.brandText": "Brand text",
  "token.borderL1": "Border (thin)",
  "token.borderL2": "Border (thick)",
  "token.stateError": "Error",
  "token.stateSuccess": "Success",
  "token.stateWarn": "Warning",
  "token.stateBusiness": "Accent",
  "token.light": "Light",
  "token.dark": "Dark",
  "token.clear": "Clear all custom colors"
};

// src/client/index.jsx
var NS = "appearance";
var SETTINGS_NAMESPACE = "dsh-appearance";
var inject = [
  "slots",
  "locale",
  "theme",
  "settingsScope",
  "connection",
  "remote"
];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-appearance: dictionaries");
  const t = ctx.locale.bind(NS);
  const scope = ctx.settingsScope.bind({ namespace: SETTINGS_NAMESPACE });
  const themeEngine = createThemeEngine(ctx, scope);
  const injected = () => ({ t, scope, themeEngine });
  ctx.effect(() => scope.subscribe(() => {
    themeEngine.apply();
  }), "dsh-appearance: settings watcher");
  themeEngine.apply();
  ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: "dsh-appearance",
    order: 5,
    label: () => t("section.nav"),
    locale: NS,
    inject: injected
  }, AppearanceSection));
}

		return module.exports;
	}
});