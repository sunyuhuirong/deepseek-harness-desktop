# DeepSeek Harness Desktop

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgray.svg)]()

DeepSeek Harness 桌面应用 — 基于 Electron 的 Native 包装层，完整支持 Cordis 插件扩展系统。

## ✨ 特性

- 🖥️ **Native 体验**：原生窗口、系统托盘、菜单栏
- 🔌 **完整扩展**：Cordis 插件、Client UI、Agent Preset 全部支持
- 🛠️ **原生 API**：文件对话框、系统通知、剪贴板访问
- 🔄 **自动更新**：后台静默更新
- 🎨 **热重载**：开发时实时预览
- 📦 **多平台**：macOS、Windows、Linux

## 🚀 快速开始

### 安装

```bash
# 克隆仓库
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness

# 安装依赖
cd apps/desktop
pnpm install

# 启动开发模式
pnpm dev
```

### 打包

```bash
# macOS
pnpm package:mac

# Windows
pnpm package:win

# Linux
pnpm package:linux
```

## 📁 项目结构

```
apps/desktop/
├── src/
│   ├── main/               # Electron 主进程
│   │   └── index.js        # 入口：窗口管理、DSH引导、IPC
│   └── preload/            # Preload 脚本
│       └── index.js        # 暴露 window.dsh.desktop API
├── assets/                 # 应用图标等静态资源
├── profiles/
│   └── desktop/            # Desktop Profile 配置
│       └── dsh.profile     # Bundle 列表
├── cordis.desktop.patch.yml # 桌面专属 Cordis patch
├── electron-builder.yml     # 打包配置
├── package.json
├── README.md
├── EXTENSIONS.md           # 扩展开发指南
└── docs/
    └── ARCHITECTURE.md     # 架构设计文档
```

## 🔌 扩展系统

### 安装插件

```bash
# 从 npm 安装
dsh plugin --profile desktop add @deepseek-ai/dsh-my-extension

# 从本地安装
dsh plugin --profile desktop add /path/to/my-extension
```

### 查看配置

```bash
# 查看完整配置树
dsh --profile desktop --dump-config

# 查看默认配置
dsh --profile desktop --dump-default-config
```

### 创建扩展

参考 [EXTENSIONS.md](EXTENSIONS.md) 了解如何创建：
- Cordis Bundle 插件
- Client UI 组件
- Agent Preset
- 原生 API 扩展

## 🎯 原生 API

桌面应用通过 `window.dsh.desktop` 暴露以下 API：

```javascript
// 文件对话框
const dir = await window.dsh.desktop.openDirectoryPicker();
const file = await window.dsh.desktop.openFilePicker({ filters: [...] });
const savedPath = await window.dsh.desktop.saveFilePicker('output.txt');

// 系统通知
await window.dsh.desktop.showNotification({
  title: '任务完成',
  body: '你的代码已生成'
});

// 打开外部链接
await window.dsh.desktop.openExternal('https://example.com');

// 窗口控制
window.dsh.desktop.minimize();
window.dsh.desktop.maximize();
window.dsh.desktop.close();
```

## 📚 文档

- [架构设计](docs/ARCHITECTURE.md) - 系统架构和数据流
- [扩展开发](EXTENSIONS.md) - 如何创建和管理扩展
- [API 参考](docs/API.md) - 完整 API 文档

## 🤝 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](../../CONTRIBUTING.md) 了解详细信息。

## 📄 License

MIT
