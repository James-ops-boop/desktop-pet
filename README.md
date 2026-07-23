# Shadow Companion

Shadow Companion 是一个从零开发的 Windows 桌宠应用。项目当前严格处于
**阶段 1：基础应用骨架**。正式设置界面、角色系统和动画尚未开始开发。

> 这是个人、非商业的同人项目。仓库不包含或分发《无畏契约 / VALORANT》
> 官方角色原画、模型或动画资源。

## 当前功能

- 启动后只显示透明、无边框、置顶且跳过任务栏的桌宠占位窗口
- 鼠标左键拖动桌宠，停止移动后保存物理像素坐标
- 右键原生菜单：打开主设置、锁定或解锁位置、退出应用
- 主设置窗口支持打开、最小化、隐藏和显式退出
- 点击设置窗口关闭按钮只隐藏窗口，不结束桌宠
- 重复启动保持单实例，并恢复已隐藏或最小化的设置窗口
- 使用一个经过校验的 `settings.json` 统一保存基础配置

当前 CSS 图形只是 Phase 1 占位内容，不是正式 Omen 美术。

## 基本操作

- 拖动桌宠：按住鼠标左键移动
- 打开菜单：在桌宠上点击鼠标右键
- 打开设置：右键菜单选择“打开主设置”
- 退出应用：右键菜单或设置窗口选择“退出应用”

## 开发命令

```powershell
npm install
npm test
npm run check
npm run build
npm run tauri dev
npm run tauri build -- --debug --no-bundle
```

单实例验收必须重复启动同一个构建产物，不能同时运行两个
`npm run tauri dev`：

```text
src-tauri\target\debug\shadow-companion.exe
```

## 配置文件

开发版配置保存在：

```text
%APPDATA%\io.github.jamesopsboop.shadow-companion\settings.json
```

配置以 `appSettings` 为单一根对象写入。读取时会逐字段校验并归一化：非法值会
回退到对应默认值，连续值会被限制在安全范围；多显示器的负坐标会被保留。

## 当前机器的开发工具位置

- Rust / Cargo：`D:\DevTools\rust`
- Visual Studio 2022 Build Tools：`D:\DevTools\VS2022BuildTools`
- 项目：`D:\桌宠`

其他开发机器无需使用相同路径，只需满足
[Tauri Windows 前置条件](https://v2.tauri.app/start/prerequisites/)。

阶段记录位于 `docs/development/`。

## 仓库

<https://github.com/James-ops-boop/desktop-pet>
