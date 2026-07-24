import { ComingSoonPanel } from "../../components/settings/SettingsControls";

const SYNC_ITEMS = [
  "键盘响应",
  "鼠标移动响应",
  "鼠标点击响应",
  "滚轮响应",
  "键盘动画灵敏度",
  "鼠标动画灵敏度",
  "高频输入强化动作",
  "待机动画",
] as const;

export function SyncModePage() {
  return (
    <div className="settings-page">
      <ComingSoonPanel
        phase="PHASE 5"
        title="同步模式输入系统"
        description="本页结构已经就位，但当前阶段不会监听键盘或鼠标。阶段 5 将只映射输入类别，不记录实际输入内容。"
        items={SYNC_ITEMS}
      />
    </div>
  );
}
