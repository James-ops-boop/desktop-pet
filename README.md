# Shadow Companion

Shadow Companion 是一个从零开发的 Windows 桌宠应用。项目当前严格处于
**阶段 0：环境检查与技术验证**，尚未开始正式 UI、角色动画或业务功能开发。

> 这是个人、非商业的同人项目。仓库不包含或分发《无畏契约 / VALORANT》
> 官方角色原画、模型或动画资源。

## 当前验证范围

- Tauri 2 + React + TypeScript + Vite 最小工程
- 可见的透明、无边框、置顶且跳过任务栏的 `pet` 测试窗口
- 启动时创建但默认隐藏的 `settings` 测试窗口
- 第二次启动同一可执行文件时唤醒原进程的 `settings` 窗口
- 使用官方 Tauri Store 插件写入、读取并显式保存本地配置

## 开发命令

```powershell
npm install
npm run build
npm run tauri dev
npm run tauri build -- --debug --no-bundle
```

阶段 0 的单实例验收必须重复启动同一个构建产物，不能同时运行两个
`npm run tauri dev`：

```text
src-tauri\target\debug\shadow-companion.exe
```

## 当前机器的阶段 0 工具位置

- Rust / Cargo：`D:\DevTools\rust`
- Visual Studio 2022 Build Tools：`D:\DevTools\VS2022BuildTools`
- 项目：`D:\桌宠`

其他开发机器无需使用相同路径，只需满足
[Tauri Windows 前置条件](https://v2.tauri.app/start/prerequisites/)。

## 仓库

<https://github.com/James-ops-boop/desktop-pet>
