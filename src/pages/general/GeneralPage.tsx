import {
  SettingRow,
  SettingsSection,
  ToggleField,
} from "../../components/settings/SettingsControls";
import type {
  AppSettings,
  AppSettingsPatch,
} from "../../models/settings";

interface GeneralPageProps {
  settings: AppSettings;
  autostartBusy: boolean;
  onUpdate: (patch: AppSettingsPatch) => Promise<unknown>;
  onToggleAutostart: (enabled: boolean) => Promise<void>;
  onRequestReset: () => void;
  onExit: () => void;
}

export function GeneralPage({
  settings,
  autostartBusy,
  onUpdate,
  onToggleAutostart,
  onRequestReset,
  onExit,
}: GeneralPageProps) {
  return (
    <div className="settings-page">
      <SettingsSection
        title="启动与后台"
        description="关键入口保持可恢复，避免应用在没有托盘时进入不可见状态。"
      >
        <SettingRow
          title="开机启动"
          description="登录 Windows 后自动启动 Shadow Companion。"
          badge="系统"
        >
          <ToggleField
            label="开机启动"
            checked={settings.launchAtStartup}
            disabled={autostartBusy}
            onChange={(checked) => {
              void onToggleAutostart(checked);
            }}
          />
        </SettingRow>

        <SettingRow
          title="启动时显示桌宠"
          description="当前没有备用托盘入口，因此此项固定开启。"
          badge="安全入口"
        >
          <ToggleField
            label="启动时显示桌宠"
            checked
            disabled
            onChange={() => undefined}
          />
        </SettingRow>

        <SettingRow
          title="启动动画"
          description="设置会立即保存，并在阶段 4 动画系统接入后生效。"
          badge="阶段 4"
        >
          <ToggleField
            label="启动动画"
            checked={settings.startupAnimationEnabled}
            onChange={(checked) => {
              void onUpdate({ startupAnimationEnabled: checked });
            }}
          />
        </SettingRow>

        <SettingRow
          title="关闭设置窗口后继续运行"
          description="关闭按钮仅隐藏设置窗口，桌宠和应用进程继续运行。"
          badge="核心行为"
        >
          <ToggleField
            label="关闭设置窗口后继续运行"
            checked
            disabled
            onChange={() => undefined}
          />
        </SettingRow>

        <SettingRow
          title="备用系统托盘"
          description="第一版允许不使用托盘；当前以桌宠右键菜单作为主要入口。"
          badge="暂未启用"
        >
          <ToggleField
            label="备用系统托盘"
            checked={false}
            disabled
            onChange={() => undefined}
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        title="应用维护"
        description="恢复操作会影响本地配置；退出会完整结束桌宠进程。"
      >
        <div className="maintenance-actions">
          <div>
            <strong>恢复默认设置</strong>
            <p>重置全部设置，并把桌宠移回默认位置。</p>
          </div>
          <button
            type="button"
            className="button button--secondary"
            onClick={onRequestReset}
          >
            恢复默认
          </button>
        </div>
        <div className="maintenance-actions maintenance-actions--danger">
          <div>
            <strong>退出应用</strong>
            <p>关闭设置窗口、桌宠窗口和后台进程。</p>
          </div>
          <button
            type="button"
            className="button button--danger"
            onClick={onExit}
          >
            退出应用
          </button>
        </div>
      </SettingsSection>
    </div>
  );
}
