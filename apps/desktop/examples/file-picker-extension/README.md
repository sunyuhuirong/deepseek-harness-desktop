# 示例扩展：文件选择工具

这是一个示例扩展，展示如何为桌面版添加原生文件选择功能。

## 创建扩展

```bash
mkdir -p packages/extension/file-picker/src
cd packages/extension/file-picker
```

## package.json

```json
{
  "name": "@deepseek-ai/dsh-file-picker",
  "version": "0.1.0",
  "description": "Native file picker tool for DSH Desktop",
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

## cordis.patch.yml

```yaml
- insert:
    - id: tool-file-picker
      name: '@deepseek-ai/dsh-file-picker'
```

## src/index.js

```js
/**
 * File Picker Extension
 * Adds native file/directory selection tools to DSH Desktop
 */
import { dialog } from 'electron';

const name = 'dsh-file-picker';
const inject = [];

function apply(ctx) {
  // Directory picker tool
  ctx.tool('pickDirectory', {
    description: 'Open a native directory picker dialog. Returns the selected path.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Dialog title'
        },
        defaultPath: {
          type: 'string',
          description: 'Default directory to open'
        }
      }
    },
    execute: async (args) => {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: args.title || 'Select Directory',
        defaultPath: args.defaultPath
      });
      
      if (result.canceled) {
        return { canceled: true };
      }
      
      return { path: result.filePaths[0] };
    }
  });

  // File picker tool
  ctx.tool('pickFile', {
    description: 'Open a native file picker dialog. Returns the selected file path.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Dialog title'
        },
        filters: {
          type: 'array',
          description: 'File filters, e.g. [{ name: "Images", extensions: ["png", "jpg"] }]'
        },
        defaultPath: {
          type: 'string',
          description: 'Default file path'
        }
      }
    },
    execute: async (args) => {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        title: args.title || 'Select File',
        filters: args.filters,
        defaultPath: args.defaultPath
      });
      
      if (result.canceled) {
        return { canceled: true };
      }
      
      return { path: result.filePaths[0] };
    }
  });

  // Save file tool
  ctx.tool('saveFile', {
    description: 'Open a save file dialog. Returns the selected path.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Dialog title'
        },
        defaultPath: {
          type: 'string',
          description: 'Default file name'
        },
        filters: {
          type: 'array',
          description: 'File filters'
        }
      }
    },
    execute: async (args) => {
      const result = await dialog.showSaveDialog({
        title: args.title || 'Save File',
        defaultPath: args.defaultPath,
        filters: args.filters
      });
      
      if (result.canceled) {
        return { canceled: true };
      }
      
      return { path: result.filePath };
    }
  });
}

export { name, inject, apply };
```

## 安装与测试

```bash
# 安装到桌面 profile
dsh plugin --profile desktop add /path/to/packages/extension/file-picker

# 启动桌面应用
cd apps/desktop
pnpm start

# 在对话中使用
# "帮我选择一个目录" → 会触发 pickDirectory 工具
# "帮我选择一个文件" → 会触发 pickFile 工具
```

## 注意事项

1. 此扩展需要在 Electron main process 环境中运行
2. `dialog` 模块来自 `electron`，需要正确引入
3. 如果需要在 client 端调用，需通过 IPC 转发
