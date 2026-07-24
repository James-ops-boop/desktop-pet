# 阶段 4：Omen 占位美术与动画框架

## 当前状态

阶段 4 的原创 Omen Q 版占位资源、桌子与基础道具、动画资源配置、独立动画控制器、
待机/点击/拖动反馈、两种模式手动切换和安全淡入淡出已经实现。阶段 0–4 全量检查、
TypeScript/Vite 生产构建、Rust 格式与测试、Tauri Debug EXE 构建和主要 Windows
实机链路均已通过。

## 范围

本阶段严格实现：

- 原创 Q 版 Omen 占位主视觉
- 桌子、键盘、鼠标、书本、咖啡、游戏设备和餐食基础道具
- 角色预览分类与运行态动画状态 ID 的分离
- 可替换的 Omen 动画资源包和动画资源注册表
- 独立于 React 页面组件的动画控制器
- 同步模式和生活模式的模式内待机
- 四段连续点击反馈
- 受保护的拖动反馈
- 设置页与桌宠右键菜单的手动模式切换
- 模式切换时的淡出、资源换层和淡入
- 右键菜单暂停或继续动画

本阶段没有实现全局键盘/鼠标监听、输入事件节流、现实作息、三餐记录、活动调度或
九类完整角色动作。

## 视觉资源

### Omen 主视觉

主视觉由内置图像生成能力生成，再通过项目工具移除纯色背景并验证透明通道。最终资源：

```text
public/assets/characters/omen/phase4/omen-base.png
```

图像尺寸为 `1254 × 1254` RGBA，四角完全透明，可见轮廓未触及画布边缘。设计使用
2.5–3 头身的深蓝兜帽影法师、黑/靛蓝披风和肩甲轮廓、三道蓝紫发光面纹与双手，
不包含文字、徽标、场景、官方原画或直接复制的官方素材。

生成提示的核心约束为：原创 Q 版深色影法师、明确兜帽与三道面部光纹、紧凑全身轮廓、
安静克制且略带反差萌、适合置于桌后、纯色抠图背景、无桌子/道具/阴影/文字/徽标。

### 分层道具

基础道具使用可编辑 SVG，并统一采用 `380 × 380` 定位画布：

- `public/assets/props/phase4/desk.svg`
- `public/assets/props/phase4/keyboard.svg`
- `public/assets/props/phase4/mouse.svg`
- `public/assets/props/phase4/book.svg`
- `public/assets/props/phase4/coffee.svg`
- `public/assets/props/phase4/game-device.svg`
- `public/assets/props/phase4/meal.svg`

同步模式显示角色、桌子、键盘和鼠标；生活模式只显示角色和桌子。其他道具已经进入
资源包，供后续生活活动和完整动作阶段使用，但本阶段不提前调度或播放这些活动。

## 动画架构

### 页面预览分类与运行态状态

阶段 3 的九类 `CharacterActionId` 保持角色页预览语义：

```text
idle, keyboard, mouse, study, gaming, coffee, meal, sleep, shadow
```

阶段 4 新建独立运行态 `AnimationStateId`：

```text
sync-idle
life-idle
click-look
click-tilt
click-shadow-gather
click-vanish
dragging
mode-transition
```

这样阶段 5 可以增加左右手键盘、鼠标移动和点击状态，阶段 6/7 可以增加活动和完整动作，
而不需要破坏角色页稳定的九类入口。

### 动画控制器

`src/services/animation-controller/animationController.ts` 是纯状态转换层，记录：

- 当前可见模式和目标模式
- 当前运行态动画 ID
- 过渡阶段：steady、fade-out、fade-in
- 连续点击次数与链窗口
- 一次性动作结束时间
- 暂停状态

每个状态具有优先级、播放类型、可中断性和时长元数据。模式切换优先级最高，拖动次之，
点击反馈低于拖动，默认待机最低。模式切换和拖动期间点击不会打断保护动作。

`useAnimationController.ts` 只负责把纯状态转换接到 React 定时器。`PetWindow` 负责发送
用户意图，不保存点击链、优先级或过渡细节。

### 模式切换

模式切换路径为：

```text
currentMode 设置更新
  -> controller mode-requested
  -> fade-out 当前模式
  -> 切换可见资源层
  -> fade-in 新模式
  -> 新模式 idle
```

在 fade-out 时重新选择当前模式会取消离场并回到待机；fade-in 时再选择另一模式会从
当前已显示模式重新执行安全过渡，避免快速切换留下混合资源或卡死状态。

### 点击与拖动

连续点击窗口为 720 ms，依次触发：

1. `click-look`
2. `click-tilt`
3. `click-shadow-gather`
4. `click-vanish`

一次性动作到期后返回当前模式待机。左键手势先交给原生窗口拖动；短促且没有位移的
手势识别为点击，持续或产生位移的手势触发拖动反馈。位置锁定时保持既有禁止拖动语义。

## 角色资源映射

`src/characters/omen/animation.ts` 集中定义：

- Omen 主视觉与全部道具路径
- 图层 z 顺序
- 同步/生活模式的可见图层
- 两种模式的待机状态
- 九类角色页预览资源

`OMEN_MANIFEST.animationResources` 已从九个 `null` 替换为资源包提供的真实路径。
`AnimatedPetStage` 从 `animationRegistry` 按角色 ID 解析资源包，不在桌宠组件中硬编码
Omen 的具体文件路径。

## 自动化结果

| 验证项 | 状态 | 记录 |
| --- | --- | --- |
| Vitest | 通过 | 5 个测试文件、38 项测试全部通过 |
| 动画控制器测试 | 通过 | 覆盖完整模式过渡、离场取消、四段点击链、过渡与拖动保护 |
| 阶段 0–4 结构检查 | 通过 | `npm run check` 包含全部五个阶段脚本 |
| TypeScript/Vite 构建 | 通过 | 86 个模块完成转换 |
| Rust 格式检查 | 通过 | `cargo fmt --check` |
| Rust 测试 | 通过 | lib/bin/doc-test 目标全部通过 |
| Tauri Debug EXE | 通过 | `npm run tauri build -- --debug --no-bundle` |

Rust 链接仍有既有的中文本地化 stdout warning，但编译和所有测试目标成功。

## Windows 实机验收

| 验收项 | 状态 | 记录 |
| --- | --- | --- |
| Omen 辨识度 | 通过 | 深色大兜帽、三道蓝紫面纹、肩甲披风轮廓和 Q 版比例清晰 |
| 同步模式视觉 | 通过 | 桌后 Omen、键盘、鼠标和 A 标记可见 |
| 生活模式视觉 | 通过 | 同一角色与桌子保留，固定键盘和鼠标完全移除，B 标记可见 |
| 右键模式入口 | 通过 | 原生菜单含同步模式 A、生活模式 B，勾选状态跟随配置 |
| 设置页模式入口 | 通过 | 两个原生 radio 可手动切换，保存状态成功 |
| 模式过渡 | 通过 | 同步→生活→同步均完成淡出换层淡入，未出现混合道具或卡死 |
| 单击反馈 | 通过 | 短按桌宠触发受控视觉反馈；四段顺序由纯逻辑测试覆盖 |
| 动画暂停入口 | 通过 | 右键菜单显示暂停动画/继续动画文案 |
| 角色页资源预览 | 通过 | 显示阶段 4 主视觉、两模式接入状态和九类资源映射 |
| 既有窗口行为 | 通过 | 桌宠保持透明、无边框、置顶并跳过任务栏；设置窗口仍可打开 |

验收结束前已经恢复：

```text
currentCharacterId = omen
currentMode = sync
petScale = 1
petOpacity = 1
alwaysOnTop = true
```

## 尚未解决的问题

- 阶段 4 只提供模式内待机、点击、拖动和过渡；左右手键盘、鼠标移动/点击和高频输入
  要等阶段 5 的全局输入与节流系统。
- 书本、咖啡、游戏设备和餐食已经具备资源，但不在本阶段伪造生活活动；现实作息和
  活动调度属于阶段 6。
- 九类角色页入口已映射到可替换资源，但完整动作播放和每类动作退出逻辑属于阶段 7。
- 当前主视觉为原创生成式占位位图，后续可替换为人工统一绘制的正式分层素材。
- 运行时资源删除或损坏后的完整恢复仍属于阶段 8。
- 本阶段没有重复切换 Windows 100%/125%/150% 显示缩放，也没有完成多显示器负坐标
  实机回归。

## 下一阶段准备

阶段 5 将严格实现同步模式：

- 全局键盘与鼠标监听
- 只保留按键区域分类、不记录实际输入内容
- 输入事件节流和动画触发频率限制
- 左手、右手、双手和高频输入状态
- 鼠标移动、左右点击与滚轮反馈
- 同步模式设置页接线

阶段 5 不应提前实现阶段 6 的现实时间作息或三餐记录。
