# DeepSeek Harness Desktop - 扩展开发指南

本文档介绍如何为 DeepSeek Harness 桌面版开发和安装扩展插件。

## 扩展类型

桌面版支持四类扩展：

### 1. Cordis Bundle 插件（推荐）

最常见的扩展类型，用于添加新工具、服务或 UI 组件。

```
my-extension/
├── package.json
├── cordis.patch.yml      # 插件注册配置
├── src/
│   └── index.js          # 插件实现
└── README.md
```

#### package.json 模板

```json
{
  "name": "@deepseek-ai/dsh-my-extension",
  "version": "0.1.0",
  "description": "My custom extension for DSH Desktop",
  "type": "module",
  "main": "src/index.js",
  "files": ["src", "cordis.patch.yml"],
  "dsh": {
    "bundle": {
      "patch": "./cordis.patch.yml"
    }
  },
  "peerDependencies": {
    "@deepseek-ai/cordis": "^4.0.1"
  }
}
```

#### cordis.patch.yml 模板

```yaml
# 添加新的 Tool
- insert:
    - id: my-tool
      name: '@deepseek-ai/dsh-my-extension'
      config:
        # 工具配置...

# 禁用不需要的默认工具
- id: tool-bash
  disabled: true
```

#### src/index.js 模板

```js
/**
 * My Extension - Host Plugin
 */
const name = 'dsh-my-extension';
const inject = []; // 依赖的服务

function apply(ctx) {
  // 注册 Tool
  ctx.tool('myTool', {
    description: '执行我的自定义操作',
    inputSchema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: '输入参数' }
      },
      required: ['input']
    },
    execute: async (args, extra) => {
      const { input } = args;
      // 业务逻辑
      return { result: `处理了: ${input}` };
    }
  });

  // 或注册 Service
  ctx.provide('myService', {
    doSomething: async () => { /* ... */ }
  });
}

export { name, inject, apply };
```

### 2. Client UI 插件

为 Web GUI 添加新的 UI 组件。

```js
// src/client.js
import React from 'react';

function MyComponent(props) {
  return React.createElement('div', null, '我的 UI 组件');
}

export default {
  name: 'my-client-extension',
  apply(ctx) {
    // 注册到特定 Slot
    ctx.slot('conversation').insert({
      component: MyComponent,
      order: 100,
      props: { /* ... */ }
    });
  }
};
```

### 3. Agent Preset

定义特定场景的 AI Agent 配置。

```
my-preset/
├── cordis.yml              # Cordis 配置
├── prompt/
│   ├── system.md           # 系统提示词
│   └── sections/
│       └── persona.md      # Persona 段落
└── tools/
    └── my-tool.js          # 工具定义
```

### 4. 原生能力扩展

利用 Electron 原生 API 的扩展。

```js
// host 端：暴露原生 API
ctx.provide('nativeDialog', {
  openDirectory: async () => {
    const { dialog } = require('electron').remote;
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    return result.filePaths[0];
  }
});

// client 端：调用原生 API
const dir = await window.dsh.desktop.openDirectoryPicker();
```

## 安装扩展

### 方法 1：通过 dsh plugin 命令

```bash
# 从 npm 安装
dsh plugin --profile desktop add @deepseek-ai/dsh-my-extension

# 从本地路径安装
dsh plugin --profile desktop add /path/to/my-extension
```

### 方法 2：手动复制到 node_modules

```bash
# 将插件包复制到 profile 的 node_modules
cp -r /path/to/my-extension ~/.dsh/profiles/desktop/node_modules/@deepseek-ai/
```

### 方法 3：编辑 cordis.patch.yml

直接在 profile 的配置文件中添加插件：

```bash
# 编辑 desktop profile 的 patch 文件
nano ~/.dsh/profiles/desktop/cordis.patch.yml
```

```yaml
- insert:
    - id: my-tool
      name: '@deepseek-ai/dsh-my-extension'
```

## 扩展开发示例

### 示例 1：添加文件选择工具

```js
// packages/extension/file-picker/src/index.js
import { dialog } from 'electron';

const name = 'dsh-file-picker';
const inject = [];

function apply(ctx) {
  ctx.tool('filePicker', {
    description: '打开系统文件选择对话框',
    inputSchema: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['open', 'save'],
          description: '对话框模式'
        },
        filters: {
          type: 'array',
          description: '文件过滤器'
        }
      }
    },
    execute: async (args) => {
      const { mode = 'open', filters } = args;
      
      if (mode === 'open') {
        const result = await dialog.showOpenDialog({ filters });
        return { path: result.filePaths[0] };
      } else {
        const result = await dialog.showSaveDialog({ filters });
        return { path: result.filePath };
      }
    }
  });
}

export { name, inject, apply };
```

### 示例 2：添加系统通知服务

```js
// packages/extension/notifications/src/index.js
import { Notification } from 'electron';

const name = 'dsh-notifications';
const inject = [];

function apply(ctx) {
  ctx.provide('notificationService', {
    send: async (options) => {
      const { title, body, icon } = options;
      const notif = new Notification({ title, body, icon });
      notif.show();
      return { success: true };
    }
  });
}

export { name, inject, apply };
```

### 示例 3：添加自定义 UI 组件

```js
// packages/extension/custom-ui/src/client.js
import React from 'react';

function StatusPanel({ status }) {
  return React.createElement('div', { className: 'status-panel' },
    React.createElement('h3', null, '任务状态'),
    React.createElement('p', null, status || '待处理')
  );
}

export default {
  name: 'dsh-custom-ui',
  apply(ctx) {
    // 插入到 conversation slot
    ctx.slot('conversation').insert({
      component: StatusPanel,
      order: 50,
      props: { status: 'initializing' }
    });
  }
};
```

## 调试扩展

### 查看插件加载状态

```bash
# 查看当前 profile 的配置树
dsh --profile desktop --dump-config

# 查看默认配置（不含用户层）
dsh --profile desktop --dump-default-config
```

### 启用详细日志

```bash
# 设置调试日志
DEBUG=dsh:* dsh --profile desktop
```

### 浏览器 DevTools

开发模式下会自动打开 DevTools，可以：
- 查看 Console 日志
- 调试 React 组件
- 检查 Network 请求

## 最佳实践

1. **保持向后兼容**：确保新插件不与现有工具冲突
2. **使用命名空间**：以 `@deepseek-ai/dsh-` 或 `dsh-` 开头命名
3. **遵循 Cordis 规范**：正确声明 inject 依赖和提供的服务
4. **测试跨平台**：在 macOS、Windows、Linux 上测试扩展
5. **文档齐全**：提供 README 和使用说明

## 发布扩展

### 发布到 npm

```bash
cd my-extension
npm publish
```

### 创建本地包

```bash
cd my-extension
pnpm pack
# 生成 my-extension-0.1.0.tgz
```

### 从本地安装

```bash
dsh plugin --profile desktop add ./my-extension-0.1.0.tgz
```

## 常见问题

### Q: 插件未加载？
A: 检查：
1. `cordis.patch.yml` 格式是否正确
2. 插件是否在 `node_modules` 中
3. 运行 `dsh --profile desktop --dump-config` 查看配置

### Q: Tool 未出现在对话中？
A: 检查：
1. Tool 是否注册在 agent preset 中
2. 是否被 `disabled: true` 禁用
3. 重启 DSH 进程

### Q: 原生 API 不可用？
A: 确保在 preload 脚本中正确暴露了 API：
```js
contextBridge.exposeInMainWorld('dsh', {
  desktop: {
    openDirectoryPicker: () => ipcRenderer.invoke('desktop:open-directory-picker')
  }
});
```
