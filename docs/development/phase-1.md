# 阶段 1：基础应用骨架

## 范围

本阶段将阶段 0 的技术探针升级为可继续扩展的应用骨架，只实现：

- 正式的 `pet` 与 `settings` 窗口入口
- 窗口打开、隐藏、最小化、关闭拦截和显式退出
- 桌宠原生右键菜单
- 桌宠位置锁定、移动事件保存与启动恢复
- 统一配置模型、校验和串行写入

七页正式设置界面、角色注册表、动画状态机、全局输入监听和生活作息系统均未进入。

## 模块边界

```text
src/
  app/
  config/
  models/
  services/settings-store/
  services/window/
  state/
  styles/
  windows/pet/
  windows/settings/

src-tauri/src/
  commands/
  single_instance/
  windows/
```

`App.tsx` 只根据 Tauri 窗口标签路由。窗口组件不直接实现 Rust 生命周期，
配置持久化也不写在 React 页面中。

## 技术决策

- 右键菜单使用 Tauri 原生 `Menu.popup()`，避免透明小窗口中的 DOM 菜单被边缘裁切。
- 桌宠在鼠标 `mousedown` 时调用原生 `startDragging()`；位置锁定时不调用。
- `onMoved` 提供的 `PhysicalPosition` 经 220 ms trailing debounce 后保存。
- 恢复位置继续使用 `PhysicalPosition`，避免把物理像素误当逻辑像素造成 DPI 漂移。
- 坐标允许为负数，以支持位于主显示器左侧或上方的副显示器。
- `pet` 独享拖动和设置位置权限；`settings` 不继承这两个权限。
- 两个窗口的 Store 权限仅包含加载、读取、写入和保存，不授予删除、清空或重置。
- 设置窗口 `CloseRequested` 由 Rust 立即 `prevent_close()` 并隐藏。
- 真正退出统一调用 Rust `AppHandle::exit(0)`。
- 配置集中在 `settings.json` 的 `appSettings` 根键，显式调用 `save()`。
- 阶段 0 的 `phase0-settings.json` 只作为历史探针，不迁移计数。

## 配置模型

阶段 1 已建立以下基础字段：

- `schemaVersion`
- `currentCharacterId`
- `currentMode`
- `defaultStartMode`
- `petScale`
- `petOpacity`
- `petPositionX`
- `petPositionY`
- `alwaysOnTop`
- `positionLocked`
- `rememberPosition`

配置校验为纯 TypeScript。无效枚举、布尔值、缩放和坐标会逐字段回退；
坐标必须成对有效。

## 验收记录

| 验收项 | 状态 | 证据 |
| --- | --- | --- |
| 配置校验单元测试 | 通过 | Vitest：1 个文件、4 个测试 |
| 阶段 0 回归断言 | 通过 | `npm run test:phase0` |
| 阶段 1 结构断言 | 通过 | `npm run test:phase1` |
| TypeScript / Vite 构建 | 通过 | 57 个模块完成转换 |
| Rust 格式与测试 | 通过 | `cargo fmt --check`、lib/bin/doc-test |
| Tauri Debug EXE 构建 | 通过 | `shadow-companion.exe` |
| 首次启动只显示桌宠 | 通过 | 可见窗口数为 1，设置窗初始隐藏 |
| 原生右键菜单 | 通过 | 打开设置、锁定/解锁、退出均实机触发 |
| 设置窗口关闭只隐藏 | 通过 | 点击标题栏 X 后桌宠仍运行 |
| 设置窗口显式隐藏 | 通过 | 点击“隐藏窗口”后仅桌宠保持可见 |
| 设置窗口最小化与恢复 | 通过 | 窗口报告为已最小化，二次启动后重新可见 |
| 重复启动保持单进程 | 通过 | 二次启动前后 PID 均为 58456 |
| 位置锁定状态 | 通过 | 菜单与桌宠提示在锁定/解锁间同步切换 |
| 位置事件与防抖保存 | 通过 | Windows 移动后写入 `979, 499` |
| 重启恢复位置 | 通过 | 重启前后截图原点均为 `979, 499` |
| 两个显式退出入口 | 通过 | 右键菜单和设置窗口均完整结束进程 |

## 测试说明

Windows 自动化工具的合成拖动没有让系统进入持续的原生窗口移动循环，但
`mousedown → startDragging()` 调用已经由应用内状态确认触发。Windows 系统移动路径
成功触发 `onMoved`、防抖落盘和重启恢复，因此原生拖动调用链、权限与位置持久化链路
均已分别验证。

首次 Rust 链接仍会在中文系统输出一条本地化 linker stdout warning；编译、测试和
可执行文件运行均正常。

## 下一阶段边界

阶段 2 将实现深色主设置界面、左侧七项导航，以及常规、桌宠和性能页面的基础设置。
角色选择、Omen 正式占位资源和动画仍不会在阶段 2 提前开发。
