# DeepSeek Harness Desktop 架构设计

## 系统架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DeepSeek Harness Desktop                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Electron Main Process                             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │   │
│  │  │ BrowserWindow│  │  System Tray │  │  Auto Update │  │  IPC Hub  │  │   │
│  │  │  (Web GUI)  │  │  (通知/菜单) │  │  (后台更新)  │  │ (原生API) │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              │ HTTP/WebSocket                               │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    DSH Web Server (子进程)                           │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                    Cordis Host Runtime                        │  │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │  │   │
│  │  │  │ Plugins  │ │ Services │ │  Tools   │ │  Slots   │        │  │   │
│  │  │  │ (扩展)   │ │ (服务)   │ │ (工具)   │ │ (UI槽)   │        │  │   │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │  │   │
│  │  │                                                         │  │   │
│  │  │  ┌─────────────────────────────────────────────────────┐ │  │   │
│  │  │  │              Profile: desktop                       │ │  │   │
│  │  │  │  Bundles: dsh-base → dsh-web-app → dsh-bundle-desktop│ │  │   │
│  │  │  │  Preset: standard                                   │ │  │   │
│  │  │  └─────────────────────────────────────────────────────┘ │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              │ WebSocket                                    │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Browser Renderer (Web GUI)                       │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                    React UI Components                         │  │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐  │  │   │
│  │  │  │Conversation│ │  Tools  │ │ Settings │ │  Jobs   │ │  More  │  │   │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └────────┘  │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                              │                                        │
│  │                              │ window.dsh.desktop API                 │
│  │                              ▼                                        │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                   Native Bridge (Preload)                    │    │   │
│  │  │  openDirectoryPicker()  showNotification()                   │    │   │
│  │  │  openFilePicker()       openExternal()                       │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 分层架构

### Layer 1: Core (dsh-base)
- LLM 集成（DeepSeek、Pi AI）
- Session 管理
- Agent 循环
- Sandbox 系统
- 基础 Tools（bash、fs、web）

### Layer 2: Web Surface (dsh-web-app)
- Web server
- API Gateway
- Client-Server 通信
- UI 组件注册

### Layer 3: Desktop Bundle (dsh-bundle-desktop)
- 桌面环境适配
- 禁用 LAN 暴露
- 桌面 Persona

### Layer 4: Electron Shell
- BrowserWindow 管理
- 系统托盘
- 原生对话框
- 自动更新

### Layer 5: Extension System
- Cordis 插件
- Client UI 组件
- Agent Presets
- 原生 API 桥接

## 扩展点

### 1. Cordis Plugin 扩展点
```yaml
# 在 cordis.patch.yml 中添加
- insert:
    - id: my-tool
      name: 'my-extension'
```

### 2. Client Slot 扩展点
```js
ctx.slot('conversation').insert({
  component: MyComponent,
  order: 100
});
```

### 3. Service 扩展点
```js
ctx.provide('myService', {
  method: async () => { /* ... */ }
});
```

### 4. Tool 扩展点
```js
ctx.tool('myTool', {
  description: '...',
  inputSchema: {...},
  execute: async (args) => { /* ... */ }
});
```

### 5. Agent Preset 扩展点
```yaml
# 在 preset 的 cordis.yml 中
- id: my-preset-tools
  name: '@deepseek-ai/dsh-my-tools'
```

## 数据流

### 1. 启动流程
```
Electron App
  → Boot DSH subprocess
    → Load profiles/desktop/dsh.profile
      → Apply dsh-base bundle
      → Apply dsh-web-app bundle
      → Apply dsh-bundle-desktop patch
      → Start web server (:3080)
        → Create BrowserWindow
          → Load http://127.0.0.1:3080
            → Client connects via WebSocket
```

### 2. 工具调用流程
```
User Input (UI)
  → WebSocket → API Gateway
    → Tool Registry Lookup
      → Execute Tool (host)
        → Return Result
          → WebSocket → UI Display
```

### 3. 原生 API 调用流程
```
Client Code
  → window.dsh.desktop.openDirectoryPicker()
    → IPC → Main Process
      → dialog.showOpenDialog()
        → Return Path
          → IPC → Client
            → Resolve Promise
```

## 安全考虑

### 1. 网络隔离
- 桌面版默认绑定 127.0.0.1
- 不支持 0.0.0.0（防止网络暴露）
- Trusted hosts 仅包含本地地址

### 2. Context Isolation
- Node integration: false
- Context isolation: true
- Preload script 提供有限 API

### 3. IPC 白名单
- 只暴露必要的原生 API
- 所有 IPC 调用经过验证
- 无直接 require 访问

## 平台支持

| 平台 | 状态 | 包格式 |
|------|------|--------|
| macOS | ✅ | .dmg, .zip |
| Windows | ✅ | .exe (NSIS) |
| Linux | ✅ | .AppImage, .deb |

## 性能优化

1. **按需加载**: 只有需要时才加载完整 UI
2. **资源压缩**: ASAR 打包减少体积
3. **内存管理**: 合理管理 BrowserWindow 生命周期
4. **背景更新**: 静默后台更新不阻塞用户

## 故障排除

### 问题：DSH 进程启动失败
```bash
# 查看详细日志
DEBUG=dsh:* dsh --profile desktop --dump-config

# 检查依赖
ls ~/.dsh/profiles/desktop/node_modules/
```

### 问题：窗口无法加载
```bash
# 手动测试 DSH
dsh --profile desktop --dump-default-config

# 检查端口
lsof -i :3080
```

### 问题：扩展未生效
```bash
# 查看当前配置
dsh --profile desktop --dump-config | grep my-extension

# 重新安装扩展
dsh plugin --profile desktop remove my-extension
dsh plugin --profile desktop add my-extension
```
