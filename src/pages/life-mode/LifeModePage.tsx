import { ComingSoonPanel } from "../../components/settings/SettingsControls";

const LIFE_ITEMS = [
  "起床与睡觉时间",
  "早餐 / 午餐 / 晚餐",
  "午睡开关",
  "写作业与游戏权重",
  "咖啡频率",
  "今日活动时间线",
  "重置今日作息记录",
] as const;

export function LifeModePage() {
  return (
    <div className="settings-page">
      <ComingSoonPanel
        phase="PHASE 6"
        title="生活模式作息系统"
        description="阶段 6 将实现现实时间判断、跨午夜睡眠、三餐记录和活动调度；本阶段不运行任何作息逻辑。"
        items={LIFE_ITEMS}
      />
    </div>
  );
}
