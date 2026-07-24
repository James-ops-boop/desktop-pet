import {
  SelectField,
  SettingRow,
  SettingsSection,
  ToggleField,
} from "../../components/settings/SettingsControls";
import {
  EFFECTS_LEVELS,
  FRAME_RATE_OPTIONS,
} from "../../config/defaultSettings";
import type {
  AppSettings,
  AppSettingsPatch,
  EffectsLevel,
} from "../../models/settings";

interface PerformancePageProps {
  settings: AppSettings;
  onUpdate: (patch: AppSettingsPatch) => Promise<unknown>;
}

const FRAME_RATE_SELECT_OPTIONS = FRAME_RATE_OPTIONS.map((value) => ({
  value,
  label: `${value} FPS`,
}));

const EFFECTS_LEVEL_OPTIONS = EFFECTS_LEVELS.map((value) => ({
  value,
  label:
    value === "low" ? "低" : value === "medium" ? "平衡" : "高",
}));

export function PerformancePage({
  settings,
  onUpdate,
}: PerformancePageProps) {
  return (
    <div className="settings-page">
      <div className="phase-notice">
        <span>已保存偏好</span>
        <p>
          下列偏好会立即保存；真实帧率控制、全屏检测和低性能渲染策略将在阶段 8
          接入。
        </p>
      </div>

      <SettingsSection
        title="渲染预算"
        description="为后续动画控制器定义稳定、可校验的运行偏好。"
      >
        <SettingRow
          title="帧率上限"
          description="限制桌宠动画控制器未来使用的最大刷新率。"
          badge="阶段 8 生效"
        >
          <SelectField
            label="帧率上限"
            value={settings.frameRateLimit}
            options={FRAME_RATE_SELECT_OPTIONS}
            onChange={(value) => {
              void onUpdate({ frameRateLimit: Number(value) });
            }}
          />
        </SettingRow>

        <SettingRow
          title="空闲时降低帧率"
          description="无交互时使用更低的动画更新频率。"
          badge="阶段 8 生效"
        >
          <ToggleField
            label="空闲时降低帧率"
            checked={settings.reduceFrameRateWhenIdle}
            onChange={(checked) => {
              void onUpdate({ reduceFrameRateWhenIdle: checked });
            }}
          />
        </SettingRow>

        <SettingRow
          title="特效强度"
          description="控制阴影聚集、淡入淡出等视觉效果预算。"
          badge="阶段 8 生效"
        >
          <SelectField
            label="特效强度"
            value={settings.effectsLevel}
            options={EFFECTS_LEVEL_OPTIONS}
            onChange={(value) => {
              void onUpdate({ effectsLevel: value as EffectsLevel });
            }}
          />
        </SettingRow>

        <SettingRow
          title="阴影效果"
          description="允许角色资源使用低强度软阴影。"
          badge="阶段 8 生效"
        >
          <ToggleField
            label="阴影效果"
            checked={settings.shadowEffectsEnabled}
            onChange={(checked) => {
              void onUpdate({ shadowEffectsEnabled: checked });
            }}
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        title="性能保护"
        description="在资源紧张或全屏应用运行时降低桌宠开销。"
      >
        <SettingRow
          title="低性能模式"
          description="减少高频动画、粒子与过渡效果。"
          badge="阶段 8 生效"
        >
          <ToggleField
            label="低性能模式"
            checked={settings.lowPerformanceMode}
            onChange={(checked) => {
              void onUpdate({ lowPerformanceMode: checked });
            }}
          />
        </SettingRow>

        <SettingRow
          title="全屏应用运行时降低动画频率"
          description="检测到全屏程序后降低桌宠动画更新频率。"
          badge="阶段 8 生效"
        >
          <ToggleField
            label="全屏应用运行时降低动画频率"
            checked={settings.reduceAnimationInFullscreen}
            onChange={(checked) => {
              void onUpdate({ reduceAnimationInFullscreen: checked });
            }}
          />
        </SettingRow>
      </SettingsSection>
    </div>
  );
}
