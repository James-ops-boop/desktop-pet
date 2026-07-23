# Shadow Companion

Shadow Companion 是一个从零开发的 Windows 桌宠应用。项目当前严格处于
**阶段 2：主设置界面**。角色系统和动画尚未开始开发。

> 这是个人、非商业的同人项目。仓库不包含或分发《无畏契约 / VALORANT》
> 官方角色原画、模型或动画资源。

## 当前功能

- 启动后只显示透明、无边框、置顶且跳过任务栏的桌宠占位窗口
- 鼠标左键拖动桌宠，停止移动后保存物理像素坐标
- 深色主设置窗口，以及常规、桌宠、同步模式、生活模式、角色、性能、关于七页导航
- 常规、桌宠和性能偏好即时保存，不设置统一“保存”按钮
- 桌宠支持 50%–150% 五档大小、25%–100% 透明度、始终置顶和位置锁定
- 右键原生菜单：打开主设置、切换桌宠大小、切换置顶、锁定或解锁位置、退出应用
- Windows 开机启动可实际启用或关闭，并与本地配置保持同步
- 记住上次位置可关闭；关闭后重启会按当前尺寸重新居中
- 点击设置窗口关闭按钮只隐藏窗口，不结束桌宠
- 重复启动保持单实例，并恢复已隐藏或最小化的设置窗口
- 两个窗口通过同一个 Rust 设置服务同步经过校验的 schema v2 配置
- 同步模式、生活模式和角色页仅建立后续阶段骨架；性能页暂只保存偏好

当前 CSS 图形仍是占位内容，不是正式 Omen 美术。

## 基本操作

- 拖动桌宠：按住鼠标左键移动
- 打开菜单：在桌宠上点击鼠标右键
- 打开设置：右键菜单选择“打开主设置”
- 调整桌宠：使用桌宠设置页，或右键菜单中的“桌宠大小”
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

配置以 `appSettings` 为单一根对象写入。读取时会迁移旧版本并逐字段校验：
非法值回退到对应默认值，连续值限制在安全范围，多显示器负坐标会被保留。
Rust 进程级互斥锁负责完整的读改写事务，revision 事件负责两个窗口的即时同步。

## 当前机器的开发工具位置

- Rust / Cargo：`D:\DevTools\rust`
- Visual Studio 2022 Build Tools：`D:\DevTools\VS2022BuildTools`
- 项目：`D:\桌宠`

其他开发机器无需使用相同路径，只需满足
[Tauri Windows 前置条件](https://v2.tauri.app/start/prerequisites/)。

阶段记录位于 `docs/development/`。下一步将严格进入阶段 3 的角色数据模型、注册表、
筛选、角色卡片和确认启用流程，不提前制作动画或输入监听。

## 仓库

<https://github.com/James-ops-boop/desktop-pet>
