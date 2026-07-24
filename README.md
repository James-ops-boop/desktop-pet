# Shadow Companion

Shadow Companion 是一个从零开发的 Windows 桌宠应用。项目当前严格处于
**阶段 4：Omen 占位美术与动画框架**。阶段 5 的全局键鼠监听尚未开始开发。

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
- 角色页支持全部、决斗、先锋、控场、哨卫五类职业筛选
- 角色卡片浏览与实际启用分离；只有明确确认才写入当前角色
- Omen 属于控场且是当前唯一可用角色，其他内置角色均显示为制作中
- 角色注册表、模式支持、动作支持、主题和资源路径均由独立 manifest 配置
- Omen 已接入原创 Q 版位图占位形象、桌子以及可替换的键盘、鼠标、书本、咖啡、
  游戏设备和餐食 SVG 道具
- 独立动画控制器定义运行态状态、优先级、循环/一次性/保护动作和模式过渡，不把
  状态机写进 React 页面
- 同步模式 A 与生活模式 B 可由设置页或桌宠右键菜单手动切换；程序不会自动切换
- 同步模式显示固定键盘与鼠标，生活模式不显示固定键鼠
- 单击支持四段反馈：看向用户、歪头、阴影聚集、短暂消失后重现
- 拖动具有受保护反馈；模式切换使用淡出、换层、淡入流程，快速切换不会卡死
- 右键菜单可以暂停或继续动画
- 角色页显示阶段 4 Q 版预览、两种形态接入状态和九类可替换资源映射
- 同步模式全局输入、生活模式作息调度和九类完整动作仍分别属于阶段 5、6、7

当前 Omen 美术是通过图像生成制作的原创同人占位资源，配套道具为项目原创 SVG。
仓库不包含 VALORANT 官方角色原画。

## 基本操作

- 拖动桌宠：按住鼠标左键移动
- 打开菜单：在桌宠上点击鼠标右键
- 打开设置：右键菜单选择“打开主设置”
- 调整桌宠：使用桌宠设置页，或右键菜单中的“桌宠大小”
- 切换模式：使用桌宠设置页的“当前模式”，或右键菜单中的“桌宠模式”
- 单击互动：在未发生拖动时单击桌宠；连续点击会推进四段反馈
- 暂停动画：右键菜单选择“暂停动画”，再次选择“继续动画”
- 浏览角色：打开“角色”，使用职业筛选和角色卡片切换右侧预览
- 启用角色：只有可用且不是当前角色时，“设为当前桌宠”按钮才可点击
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
`currentCharacterId` 还会通过角色注册表校验：未知、制作中、未安装或资源异常的角色
不能成为当前桌宠，会安全回退到 Omen。

## 添加角色

角色领域代码位于：

```text
src/models/character.ts
src/models/animation.ts
src/characters/<character-id>/manifest.ts
src/characters/<character-id>/animation.ts
src/characters/registry.ts
src/characters/animationRegistry.ts
src/services/character-manager/
src/services/animation-controller/
public/assets/characters/
public/assets/props/
```

新增角色的预期流程：

1. 新建独立角色目录和 `manifest.ts`。
2. 填写职业、可用状态、主题色、模式与动作支持、资源路径和说明。
3. 将本地原创或已获授权的资源放入 `public/assets/characters/`。
4. 在角色目录新增动画资源包，并按统一图层契约引用角色、桌子和道具。
5. 在角色注册表与动画资源注册表中注册。
6. 通过注册表测试和 `npm run check`，无需修改角色页面或动画控制器核心结构。

`available` 角色必须具备健康的本地资源；`in-development` 与 `not-installed`
角色仍可浏览，但不能启用。“当前使用”是根据设置动态派生的状态，不写进 manifest。

## 替换 Omen 占位资源

阶段 4 资源集中在：

```text
public/assets/characters/omen/phase4/
public/assets/props/phase4/
src/characters/omen/animation.ts
```

角色主体与道具使用同一个 `380 × 380` 设计画布。替换文件时保持透明背景、完整轮廓和
相同画布定位，即可继续使用现有模式、点击、拖动和过渡逻辑；业务组件不依赖具体文件名，
实际路径由 Omen 动画资源包统一配置。

## 当前机器的开发工具位置

- Rust / Cargo：`D:\DevTools\rust`
- Visual Studio 2022 Build Tools：`D:\DevTools\VS2022BuildTools`
- 项目：`D:\桌宠`

其他开发机器无需使用相同路径，只需满足
[Tauri Windows 前置条件](https://v2.tauri.app/start/prerequisites/)。

阶段记录位于 `docs/development/`。下一步将严格进入阶段 5 的全局键鼠监听、事件节流
和同步模式动作映射，不提前实现阶段 6 的生活作息调度。

## 仓库

<https://github.com/James-ops-boop/desktop-pet>
