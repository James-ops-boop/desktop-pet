import {
  ChoiceGroup,
  RangeField,
  SelectField,
  SettingRow,
  SettingsSection,
  ToggleField,
} from "../../components/settings/SettingsControls";
import { PET_SCALE_OPTIONS } from "../../config/defaultSettings";
import type {
  AppSettings,
  AppSettingsPatch,
  CompanionMode,
  DefaultStartMode,
} from "../../models/settings";

interface PetSettingsPageProps {
  settings: AppSettings;
  onUpdate: (patch: AppSettingsPatch) => Promise<unknown>;
  onCenterPet: () => Promise<void>;
}

const SCALE_CHOICES = PET_SCALE_OPTIONS.map((scale) => ({
  value: scale,
  label: `${Math.round(scale * 100)}%`,
}));

const START_MODE_OPTIONS = [
  { value: "sync", label: "同步模式" },
  { value: "life", label: "生活模式" },
  { value: "last-used", label: "沿用上次模式" },
] as const;

const CURRENT_MODE_CHOICES = [
  { value: "sync", label: "同步模式 A" },
  { value: "life", label: "生活模式 B" },
] as const;

export function PetSettingsPage({
  settings,
  onUpdate,
  onCenterPet,
}: PetSettingsPageProps) {
  const position =
    settings.petPositionX === null || settings.petPositionY === null
      ? "默认居中"
      : `${settings.petPositionX}, ${settings.petPositionY}`;

  return (
    <div className="settings-page">
      <SettingsSection
        title="模式"
        description="模式只由用户手动切换；程序不会根据输入状态自动改变形态。"
      >
        <SettingRow
          title="当前模式"
          description="切换时会安全淡出当前画面，再载入另一套分层资源。"
        >
          <ChoiceGroup
            label="当前模式"
            value={settings.currentMode}
            options={CURRENT_MODE_CHOICES}
            onChange={(value) => {
              void onUpdate({ currentMode: value as CompanionMode });
            }}
          />
        </SettingRow>

        <SettingRow
          title="默认启动模式"
          description="设置立即保存，用于后续启动时决定初始形态。"
        >
          <SelectField
            label="默认启动模式"
            value={settings.defaultStartMode}
            options={START_MODE_OPTIONS}
            onChange={(value) => {
              void onUpdate({
                defaultStartMode: value as DefaultStartMode,
              });
            }}
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        title="外观"
        description="尺寸、透明度和置顶状态会立即同步到桌宠窗口。"
      >
        <SettingRow
          title="桌宠大小"
          description="同步调整原生透明窗口和 380×380 设计画布。"
        >
          <ChoiceGroup
            label="桌宠大小"
            value={settings.petScale}
            options={SCALE_CHOICES}
            onChange={(value) => {
              void onUpdate({ petScale: value });
            }}
          />
        </SettingRow>

        <SettingRow
          title="桌宠透明度"
          description="最低保留 25% 可见度，拖动滑块后自动保存。"
        >
          <RangeField
            label="桌宠透明度"
            value={Math.round(settings.petOpacity * 100)}
            min={25}
            max={100}
            step={5}
            suffix="%"
            onCommit={(value) => {
              void onUpdate({ petOpacity: value / 100 });
            }}
          />
        </SettingRow>

        <SettingRow
          title="始终置顶"
          description="控制桌宠是否保持在普通窗口上方。"
        >
          <ToggleField
            label="始终置顶"
            checked={settings.alwaysOnTop}
            onChange={(checked) => {
              void onUpdate({ alwaysOnTop: checked });
            }}
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        title="位置"
        description={`当前保存的物理像素坐标：${position}`}
      >
        <SettingRow
          title="锁定位置"
          description="开启后桌宠不再响应左键拖动。"
        >
          <ToggleField
            label="锁定位置"
            checked={settings.positionLocked}
            onChange={(checked) => {
              void onUpdate({ positionLocked: checked });
            }}
          />
        </SettingRow>

        <SettingRow
          title="记住上次位置"
          description="关闭后停止保存坐标，下次启动回到默认位置。"
        >
          <ToggleField
            label="记住上次位置"
            checked={settings.rememberPosition}
            onChange={(checked) => {
              void onUpdate(
                checked
                  ? { rememberPosition: true }
                  : {
                      rememberPosition: false,
                      petPositionX: null,
                      petPositionY: null,
                    },
              );
            }}
          />
        </SettingRow>

        <div className="maintenance-actions">
          <div>
            <strong>恢复默认位置</strong>
            <p>立即把桌宠移动到系统计算的默认居中位置。</p>
          </div>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => {
              void onCenterPet();
            }}
          >
            移回中心
          </button>
        </div>
      </SettingsSection>
    </div>
  );
}
