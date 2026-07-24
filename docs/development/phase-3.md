# 阶段 3：角色系统和角色选择页

## 当前状态

阶段 3 的角色模型、五个独立角色清单、角色注册表、角色管理器、角色选择页面和自动化
检查已经实现。当前自动化结果为 4 个测试文件、34 项 Vitest 测试全部通过，
`test:phase3` 结构检查通过，TypeScript 与 Vite 生产构建通过。

Windows 实机已完成常规窗口下的角色筛选、卡片浏览、预览隔离、动作入口、禁用状态、
桌宠注册表文案和始终置顶回归验收。最小窗口本轮只完成响应式代码审查；提交和推送
结果以该阶段最终 Git 历史为准。

## 范围

本阶段在阶段 2 的统一配置和七页设置界面基础上实现：

- 可扩展的角色数据模型，以及职业、可用性、资源健康、动作和模式类型
- Omen、Jett、Sova、Sage、Killjoy 五个独立角色清单
- 带清单校验、稳定顺序、职业筛选和安全回退的角色注册表
- “当前角色”和“正在浏览的角色”分离的角色管理器
- 全部、决斗、先锋、控场、哨卫五项职业筛选
- 角色卡片网格、状态标签和大型角色预览区
- 同步模式与生活模式支持情况展示
- 九类动作预览入口和阶段 4 动画占位框架
- 只有明确点击“设为当前桌宠”后才持久化角色的确认流程
- 非法、未知、制作中、未安装或资源异常角色向 Omen 的安全回退
- 桌宠窗口从注册表解析当前角色，不再在标题文案中直接硬编码 Omen
- 原创中性 SVG 占位资源，避免分发官方角色原画

本阶段没有开始正式 Q 版角色美术、动画控制器、模式切换、全局输入监听、生活作息
调度、角色包安装器或联网资源下载。

## 已实现架构

### 角色数据模型

`src/models/character.ts` 集中定义角色领域契约。职业类型固定为：

- `duelist`：决斗
- `initiator`：先锋
- `controller`：控场
- `sentinel`：哨卫

角色清单中的发布状态分为：

- `available`
- `in-development`
- `not-installed`

资源健康状态独立分为 `ready` 和 `resource-error`。界面最终展示的卡片状态由清单
状态、资源健康状态和当前角色共同派生，可显示：

- 当前使用
- 可使用
- 制作中
- 未安装
- 资源异常

“当前使用”没有写入角色清单，而是始终通过持久化的 `currentCharacterId` 计算，
避免多个静态清单同时残留“当前角色”状态。

每个 `CharacterManifest` 包含：

- schema 版本和稳定角色 ID
- 中英文名称、代号、职业和状态
- 状态说明和角色说明
- 主题强调色与光晕色
- 头像和大型预览资源路径
- 支持的模式、动作和专属动作
- 动画资源映射
- 角色内部默认缩放
- 阴影和强调光效能力

模型预留九类动作标识：

1. 待机
2. 敲键盘
3. 操作鼠标
4. 写作业
5. 玩游戏
6. 喝咖啡
7. 吃饭
8. 睡觉
9. 专属阴影动作

这些标识是角色页的稳定“预览分类”契约；阶段 3 只建立预览入口，不播放真实动画。
它们不是完整的运行态动画状态集合。阶段 4 接入动画控制器时，可以在不改变九类页面
语义的前提下，另建键盘左右手、点击、滚轮、三餐、午睡、唤醒、拖动和过渡等更细的
运行态动画/状态 ID。

### 独立角色清单

五个角色分别使用独立 TypeScript 清单：

| 角色 | 职业 | 当前状态 | 模式与动作 |
| --- | --- | --- | --- |
| Omen / 幽影 | 控场 | 可使用 | 支持同步、生活两种模式和九类动作；阴影动作为专属动作 |
| Jett / 捷风 | 决斗 | 制作中 | 当前未配置可运行动作 |
| Sova / 猎枭 | 先锋 | 制作中 | 当前未配置可运行动作 |
| Sage / 贤者 | 哨卫 | 制作中 | 当前未配置可运行动作 |
| Killjoy / 奇乐 | 哨卫 | 制作中 | 当前未配置可运行动作 |

Omen 的 `animationResources` 已包含九个动作键，但值保持为 `null`，明确表示接口已经
准备、正式资源尚未接入。其他角色只用于验证职业筛选、卡片状态和未来注册流程，不能
设为当前桌宠。

角色清单引用 `public/assets/characters/common` 中的中性头像和大型预览 SVG。占位图
不复制官方角色原画；阶段 4 可以替换资源文件和清单映射，而不需要重写角色选择业务
逻辑。

### 角色注册表

`src/characters/registry.ts` 将五个清单注册为稳定只读列表，并同时构建 ID 查询表。
注册时会检查：

- 角色清单 schema 是否为版本 1
- ID 是否符合安全格式且全局唯一
- 职业和发布状态是否属于支持枚举
- 主题色是否为六位十六进制颜色
- 头像、预览和动画路径是否位于本地 `/assets/characters/` 下
- 资源路径是否包含目录穿越、反斜杠或远程协议
- 默认缩放是否为有限正数
- 支持模式、支持动作和专属动作是否存在重复或非法值
- 专属动作是否属于该角色的支持动作
- 动画映射键和值是否合法
- 默认角色是否存在、可使用且资源状态正常

注册表固定使用 `omen` 作为安全默认角色。`resolveCurrent` 只接受已注册、状态为
`available` 且资源健康为 `ready` 的角色；未知 ID、制作中角色、未安装角色和资源
异常角色都会回退到 Omen。

`filter` 按职业返回角色，并保留注册顺序。当前注册顺序为 Omen、Jett、Sova、Sage、
Killjoy；“全部”筛选不会复制或修改注册表内部顺序。

新增角色的预期流程为：

1. 新增独立角色目录和清单
2. 添加头像、预览及后续动画资源
3. 在 `registry.ts` 注册清单
4. 通过注册表校验和测试
5. 不修改角色页面结构或配置存储；未来运行态动画接口可独立扩展

### 浏览与启用分离

`src/services/character-manager/characterManager.ts` 定义：

```text
CharacterBrowserState
  currentCharacterId
  previewCharacterId
```

`currentCharacterId` 来自统一配置，`previewCharacterId` 只属于角色页面的本地浏览
状态。卡片点击调用 `browseCharacter`，只改变 `previewCharacterId`，不会生成配置
patch，也不会修改桌宠窗口。

角色页面收到新的跨窗口配置快照时，`reconcileCurrentCharacter` 会更新真实当前角色，
同时保留仍然有效的本地预览目标。职业筛选使当前预览离开可见列表时，页面只把本地
预览移动到筛选结果中的第一个角色，仍然不会写配置。

`requestCharacterActivation` 是唯一确认启用入口。它会：

1. 从注册表重新解析当前预览角色
2. 派生该角色的启用状态
3. 对当前使用、制作中、未安装和资源异常状态执行拒绝或无操作
4. 只有可使用角色通过检查后，才提交 `{ currentCharacterId }`
5. 等待持久化 Promise 完成，不执行乐观的“当前角色”标记

`SettingsWindow` 为角色页提供独立的 `handleActivateCharacter`。写入失败时由设置窗口
显示“角色启用失败”，并重新抛出异常，使角色页能够正确结束忙碌状态，而不会把失败
操作误认为成功。

### 角色选择页面

角色页已经替换阶段 2 的 `ComingSoonPanel`，页面由以下组件组合：

```text
CharactersPage
  CharacterRoleFilter
  CharacterCard
  CharacterPreviewPanel
    ModeSupport
    ActionPreview
    ActivationAction
```

职业筛选使用原生 radio 控件，显示每个职业的注册角色数量。卡片使用原生 button，
通过 `aria-pressed` 表达当前浏览目标，并同时展示英文名、中文名、职业和状态，不只
依靠颜色区分状态。

大型预览区展示：

- 角色占位视觉
- 英文名、中文名、代号和职业
- 角色说明
- 同步模式和生活模式支持状态
- 九类动作入口
- 当前所选动作的文字说明
- 角色启用状态、禁用原因和确认按钮

动作按钮只更新本地 `selectedAction`。Omen 的九类入口可以选择，页面明确显示
“阶段 4 接入动画播放”；其他占位角色没有支持动作，按钮保持禁用。

页面还使用 `aria-live` 宣布新打开的角色预览；确认按钮在写入期间显示忙碌状态并
禁止重复提交。角色页样式单独放在 `characters-page.css`，默认使用卡片目录与大型
预览的双栏布局，在窄窗口下切换为单栏并调整操作区，避免横向溢出。

### 配置持久化与跨窗口同步

阶段 3 没有新增设置字段，配置 schema 继续使用 v2。`currentCharacterId` 原本只做
字符串格式校验，现在通过 `normalizeCurrentCharacterId` 交给注册表验证。默认设置
也从注册表的 `DEFAULT_CHARACTER_ID` 获取，不再复制 `"omen"` 字面量。

因此以下值不能成为持久化的当前角色：

- 未注册 ID
- 非法路径式 ID
- Jett、Sova、Sage、Killjoy 等制作中角色
- 任意未来标记为未安装的角色
- 资源状态异常的角色

这些值在配置规范化时统一回退为 Omen，并继续复用阶段 2 已有的 CAS 修复机制写回
规范化结果。

确认启用仍通过既有 `useAppSettings.update` 和 Rust `patch_app_settings` 流程：

```text
角色确认按钮
  -> update({ currentCharacterId })
  -> Rust Mutex 串行化 patch
  -> settings.json 保存
  -> revision 增加
  -> app-settings://changed 广播
  -> 设置窗口与桌宠窗口应用同一快照
```

本阶段不需要新增 Rust 命令，也没有给前端开放 Tauri Store 直接访问权限。

桌宠窗口通过 `resolveCurrentCharacter` 从注册表解析角色名称，标题和无障碍名称不再
直接硬编码 Omen。由于阶段 3 只有 Omen 可启用，当前桌宠视觉仍保持阶段 2 的 Omen
占位外形；正式按角色选择渲染资源属于后续动画与资源系统。

## 刻意延期项

- 阶段 4：Omen 正式 Q 版占位美术、桌子和道具、动画资源配置、动画控制器
- 阶段 4：待机、点击、拖动反馈，以及同步模式和生活模式的视觉切换
- 阶段 5：全局键盘与鼠标监听、输入节流和动作映射
- 阶段 6：现实作息、三餐记录、活动调度和时间线
- 阶段 7：九类预览入口对应的完整 Omen 动作
- 阶段 8：运行时资源缺失恢复、完整资源健康诊断和发布包
- 角色安装器、角色包下载和联网更新
- Jett、Sova、Sage、Killjoy 的正式桌宠美术与动画

## 歧义处理

### 独立配置文件形式

需求要求每个角色由独立配置文件描述，但不强制使用 JSON。本阶段采用带
`satisfies CharacterManifest` 的独立 TypeScript 清单，获得编译期字段检查，同时仍
保持“一角色一目录一清单”的扩展方式。

### 只有 Omen 可用时的确认切换测试

实际注册表中只有 Omen 可启用，而且默认当前角色也是 Omen，因此不能通过发布配置
自然演示“从另一个可用角色切回 Omen”。单元测试使用第二个可用角色的测试清单验证：

- 浏览不会修改真实当前角色
- 只有显式确认才提交 `currentCharacterId`
- 新增第二个可用角色不需要修改角色管理器核心逻辑

没有为了方便演示而把制作中角色临时标记为可用。

### 制作中与未安装状态

阶段 3 的五个内置清单中，Omen 可使用，Jett、Sova、Sage、Killjoy 均为制作中，
严格对应本阶段验收文本。角色模型与界面仍保留“未安装”状态；注册表和角色管理器
测试使用独立夹具验证该禁用分支。本阶段不提供安装按钮或伪安装流程。

### 资源异常状态

注册表和管理器已经支持 `resource-error` 并会阻止启用，但阶段 3 的内置清单均使用
受控的公共占位资源。运行时删除、损坏或加载失败后的完整错误恢复仍属于阶段 8。

### 角色默认缩放

清单中的 `defaultScale` 是未来角色画面规格的内部基准，不会在启用角色时覆盖用户
保存的 `petScale`。阶段 3 的启用 patch 只包含 `currentCharacterId`。

### 设置 schema

阶段 3 没有增加新的用户配置字段，只收紧 `currentCharacterId` 的合法值，因此不把
设置 schema 从 v2 人为提升到 v3。角色清单使用自己独立的 schema 版本 1。

## 主要文件

- `src/models/character.ts`
- `src/characters/registry.ts`
- `src/characters/omen/manifest.ts`
- `src/characters/jett/manifest.ts`
- `src/characters/sova/manifest.ts`
- `src/characters/sage/manifest.ts`
- `src/characters/killjoy/manifest.ts`
- `src/characters/registry.test.ts`
- `src/services/character-manager/characterManager.ts`
- `src/services/character-manager/characterManager.test.ts`
- `src/components/characters/CharacterRoleFilter.tsx`
- `src/components/characters/CharacterCard.tsx`
- `src/components/characters/CharacterPreviewPanel.tsx`
- `src/pages/characters/CharactersPage.tsx`
- `src/pages/characters/characters-page.css`
- `src/models/settings.ts`
- `src/models/settings.test.ts`
- `src/config/defaultSettings.ts`
- `src/windows/settings/SettingsWindow.tsx`
- `src/windows/settings/SettingsSidebar.tsx`
- `src/windows/settings/settingsNavigation.ts`
- `src/windows/pet/PetWindow.tsx`
- `public/assets/characters/common/portrait-placeholder.svg`
- `public/assets/characters/common/preview-placeholder.svg`
- `scripts/verify-phase3.mjs`
- `package.json`

## 当前自动化结果

| 验证项 | 状态 | 记录 |
| --- | --- | --- |
| Vitest | 通过 | 4 个测试文件、34 项测试全部通过 |
| 角色注册表测试 | 通过 | 覆盖唯一 ID、默认 Omen、四职业筛选、不可用角色回退、未来第二个可用角色，以及非法 ID、路径、颜色、动作和资源健康值拒绝 |
| 角色管理器测试 | 通过 | 覆盖浏览与当前角色分离、规范 ID、外部快照协调、状态派生、确认后写入、制作中、未安装、资源异常和写入失败 |
| 设置规范化测试 | 通过 | 覆盖未知、非法、制作中和未安装角色向 Omen 回退 |
| 阶段 3 结构检查 | 通过 | `npm run test:phase3`；检查五个独立清单、公共 SVG、职业与状态、九类动作、页面组件、确认接线和脚本集成 |
| TypeScript 与 Vite 构建 | 通过 | `npm run build` 已通过 |

## Windows 实机验收

最终 Debug EXE 已在 Windows WebView2 中启动。常规设置窗口外框为 `923 × 671`
（客户端 `920 × 640`），桌宠窗口为 `380 × 380`。

| 验证项 | 状态 | 记录 |
| --- | --- | --- |
| 五项职业筛选 | 通过 | 全部、决斗、先锋、控场、哨卫均可切换；数量分别为 5、1、1、1、2 |
| Omen 分类 | 通过 | 控场筛选只显示 Omen；决斗筛选只显示 Jett；哨卫筛选显示 Sage 与 Killjoy |
| 浏览不切换桌宠 | 通过 | 浏览 Jett 后大型预览切到 Jett，但桌宠无障碍文案、当前角色标签和磁盘配置仍为 Omen |
| 角色卡片状态 | 通过 | Omen 显示“当前使用”，其他四个内置角色均显示“制作中” |
| 大型预览 | 通过 | 卡片点击会更新角色信息、职业、说明、模式支持和动作区，不写配置 |
| 动作预览框架 | 通过 | Omen 九类动作按钮可用；“专属阴影动作”会更新本地说明，并明确提示阶段 4 才接入动画 |
| 禁止启用不可用角色 | 通过 | Jett 预览中的动作入口和“角色制作中”确认按钮均为禁用状态 |
| 当前角色与配置状态 | 通过 | `settings.json` 保持 `currentCharacterId: "omen"`；浏览和动作预览没有增加配置写入 |
| 桌宠注册表接线 | 通过 | 桌宠文案显示 `OMEN · 幽影 · 占位桌宠`，由当前角色清单解析 |
| 始终置顶回归 | 通过 | 验收期间临时关闭置顶以检查设置页，结束前通过原生菜单恢复；配置为 `alwaysOnTop: true`，桌宠再次覆盖设置窗口 |
| 正向确认切换 | 测试覆盖 | 生产注册表只有 Omen 可用且已经是当前角色；第二个可用角色的确认写入与失败回滚由角色管理器夹具测试覆盖 |
| 最小窗口布局 | 静态通过、实机未重复 | 容器查询在内容宽度不大于 560px 时切为单栏，UI 复审确认外框 `643 × 491` 下成立；本轮桌面控制检测到用户输入后主动停止，没有继续抢占窗口进行缩放 |
| 键盘和无障碍状态 | 结构通过 | Windows 无障碍树识别职业 radio、角色 toggle、动作 toggle、禁用确认按钮和 live 状态；未重复执行完整 Tab 顺序遍历 |

## 尚未解决的问题

- 当前只有 Omen 可用，真实生产清单无法演示两个可用角色之间的切换；该逻辑目前由
  测试清单覆盖。
- 专属动作目前仍属于全局闭合动作 ID 联合类型；阶段 4 建立动画契约前，需要决定未来
  新角色的专属动作是否下沉到角色 manifest。
- 内置 SVG 的文件存在性由结构脚本检查，运行时图片加载失败后的完整恢复尚未实现。
- 阶段 3 只展示动作入口，尚无真实动画画面。
- 正式 Omen 占位资源、资源替换说明和动画映射将在阶段 4 完成。
- 当前 DPI 已实测，100%、125%、150% Windows 显示缩放和多显示器负坐标未在本阶段
  重复执行；负坐标继续由既有配置测试覆盖。

## 下一阶段准备

阶段 4 将在当前角色清单和九类页面预览语义上继续：

- 制作可替换的 Omen Q 版原创占位资源
- 建立桌子、键盘、鼠标和基础道具资源
- 拆分页面预览分类与更细的运行态动画/状态 ID
- 将 Omen 清单中的 `animationResources` 从 `null` 替换为真实资源映射
- 建立独立于 React 页面组件的动画控制器
- 实现待机、点击和拖动反馈
- 实现同步模式和生活模式的手动切换与视觉差异
- 为模式切换增加安全过渡

阶段 4 不应修改角色浏览与确认启用语义，也不应把动画状态直接写进角色选择页面。
