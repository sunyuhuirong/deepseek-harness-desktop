import { settingsNamespace } from '@deepseek-ai/dsh-settings';
import z from '@deepseek-ai/schemastery';

/**
 * dsh-appearance — host 端
 *
 * 注册「外观与布局」设置命名空间。客户端通过同名命名空间的
 * settingsScope 读取/写入，host 端负责 schema 校验与持久化
 * （~/.dsh/settings.yaml 的 dsh-appearance 段）。
 */
const name = 'dsh-appearance';
const SETTINGS_NAMESPACE = 'dsh-appearance';
const NS = settingsNamespace(SETTINGS_NAMESPACE);

const AppearanceSettingsSchema = z.object({
  themePreset: z.string().default('default'),
  customTokens: z.dict(z.object({
    light: z.string(),
    dark: z.string()
  })).default({})
});

function apply(ctx) {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(NS, AppearanceSettingsSchema);
  });
}

export { name, apply, AppearanceSettingsSchema, SETTINGS_NAMESPACE, NS };
