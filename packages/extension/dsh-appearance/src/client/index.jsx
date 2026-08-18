import { createThemeEngine } from './theme.js';
import { AppearanceSection } from './settings.jsx';
import { zh, en } from './locales.js';

const NS = 'appearance';
const SETTINGS_NAMESPACE = 'dsh-appearance';

const inject = [
  'slots',
  'locale',
  'theme',
  'settingsScope',
  'connection',
  'remote'
];

function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-appearance: dictionaries');
  const t = ctx.locale.bind(NS);

  const scope = ctx.settingsScope.bind({ namespace: SETTINGS_NAMESPACE });
  const themeEngine = createThemeEngine(ctx, scope);

  const injected = () => ({ t, scope, themeEngine });

  ctx.effect(() => scope.subscribe(() => {
    themeEngine.apply();
  }), 'dsh-appearance: settings watcher');

  themeEngine.apply();

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'dsh-appearance',
    order: 5,
    label: () => t('section.nav'),
    locale: NS,
    inject: injected
  }, AppearanceSection));
}

export { apply, inject };
