# 阶段 0：环境检查与技术验证

## 范围

本阶段只验证 Tauri 2 在当前 Windows 环境上的关键能力，不开发正式设置界面、
角色系统、输入监听、生活模式或动画。

## 技术决策

- 使用 Tauri 配置静态创建 `pet` 与 `settings` 两个窗口，避免单实例回调发生
  在前端动态创建设置窗口之前的竞态。
- `pet` 使用透明、无边框、无阴影、置顶、`skipTaskbar` 配置。
- `settings` 在启动时创建但设为不可见；第二次启动由 Rust 单实例回调执行
  `unminimize → show → set_focus`。
- 配置探针使用官方 `tauri-plugin-store`，关闭自动保存并显式调用 `save()`，
  让重启验收结果确定可观察。
- 阶段 0 不引入 Electron、社区窗口插件或 Win32 自定义代码。

## 环境快照

- Windows：25H2，build 26200，x64
- Node.js：24.14.1
- npm：11.11.0
- Rust：1.97.1，`stable-x86_64-pc-windows-msvc`
- Cargo：1.97.1
- Visual Studio Build Tools：17.14
- MSVC：19.44
- Windows SDK：10.0.26100.0
- WebView2 Runtime：150.0.4078.83

## 验收记录

| 验收项 | 状态 | 证据 |
| --- | --- | --- |
| 阶段 0 配置断言 | 通过 | `npm run test:phase0` |
| 前端 TypeScript / Vite 构建 | 通过 | `npm run build`，39 个模块完成转换 |
| Rust 测试与编译 | 通过 | `cargo test`，lib/bin/doc-test 全部通过 |
| Tauri debug 可执行文件构建 | 通过 | `shadow-companion.exe`，版本 0.1.0 |
| `pet` 透明、无边框 | 通过 | 实机截图可透出后方窗口，无原生标题栏 |
| `pet` 不显示在任务栏 | 通过 | `skipTaskbar` 自动断言及实机观察 |
| `settings` 初始隐藏 | 通过 | 完整重启后仅 `pet` 可见 |
| 第二次启动保持单进程 | 通过 | PID 56000 保持不变，进程数始终为 1 |
| 第二次启动唤醒 `settings` | 通过 | 二次启动后设置窗显示并获得焦点 |
| Store 重启后保留 | 通过 | 重启后计数从 1 变为 2，磁盘 JSON 可读取 |

## 测试产物

- Debug EXE：`src-tauri/target/debug/shadow-companion.exe`
- Store：
  `%APPDATA%/io.github.jamesopsboop.shadow-companion/phase0-settings.json`
- 阶段 0 Store 实测值：`phase0LaunchCount = 2`

首次 Rust 链接在中文系统上产生一条本地化 linker stdout 警告，但编译、测试和
可执行文件运行均正常，不属于功能错误。

## 尚未进入的阶段

阶段 1 的桌宠拖动、右键菜单、正式窗口生命周期和统一设置模型均未开始。
