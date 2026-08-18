# DeepSeek Harness - Desktop Branch

This repository contains the Desktop branch of DeepSeek Harness, a native wrapper for the DSH web application.

## 🏗️ Project Structure

```
deepseek-harness/
├── apps/
│   └── desktop/                 # Desktop application (Electron)
│       ├── src/
│       │   ├── main/           # Electron main process
│       │   └── preload/        # Preload script
│       ├── assets/             # App icons
│       ├── profiles/           # DSH profile configurations
│       ├── docs/               # Documentation
│       ├── examples/           # Extension examples
│       ├── cordis.desktop.patch.yml
│       ├── electron-builder.yml
│       ├── package.json
│       ├── README.md
│       ├── EXTENSIONS.md
│       └── install.sh
├── packages/
│   └── bundle/
│       └── desktop-app/        # Desktop Cordis bundle plugin
│           ├── src/
│           ├── cordis.patch.yml
│           └── package.json
└── .gitignore
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Electron (will be installed automatically)

### Installation

```bash
# Clone the repository
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness

# Install desktop dependencies
cd apps/desktop
pnpm install

# Run in development mode
pnpm dev
```

### Building for Distribution

```bash
# macOS
pnpm package:mac

# Windows
pnpm package:win

# Linux
pnpm package:linux
```

## 📖 Documentation

- [Desktop App README](apps/desktop/README.md)
- [Architecture Design](apps/desktop/docs/ARCHITECTURE.md)
- [Extension Development Guide](apps/desktop/EXTENSIONS.md)

## 🔌 Extension System

The Desktop version fully supports the Cordis extension system:

1. **Cordis Bundle Plugins** - Add new tools, services, and UI components
2. **Agent Presets** - Define custom AI agent configurations
3. **Client UI Extensions** - Add React components to the Web GUI
4. **Native API Extensions** - Leverage Electron native capabilities

See [EXTENSIONS.md](apps/desktop/EXTENSIONS.md) for details.

## 🎯 Key Features

- **Native Window Management** - Resizable, minimizable to tray
- **System Integration** - Native file dialogs, notifications, tray icon
- **Auto Updates** - Background updates via electron-updater
- **Full Extension Support** - All Cordis plugins work as-is
- **Cross-Platform** - macOS, Windows, Linux support

## 🛠️ Development

### Project Setup

```bash
# Install all dependencies
pnpm install

# Start development server
pnpm dev

# Build web frontend (required for dev)
pnpm build:web
```

### Testing

```bash
# Test the desktop profile configuration
dsh --profile desktop --dump-config

# Test with debug logging
DEBUG=dsh:* dsh --profile desktop
```

## 📝 License

MIT
