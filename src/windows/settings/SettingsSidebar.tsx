import {
  SETTINGS_NAVIGATION,
  type SettingsPageId,
} from "./settingsNavigation";

interface SettingsSidebarProps {
  activePage: SettingsPageId;
  onNavigate: (page: SettingsPageId) => void;
}

export function SettingsSidebar({
  activePage,
  onNavigate,
}: SettingsSidebarProps) {
  return (
    <aside className="settings-sidebar">
      <div className="settings-brand">
        <div className="settings-brand__mark" aria-hidden="true">
          SC
        </div>
        <div className="settings-brand__copy">
          <strong>Shadow Companion</strong>
          <span>DESKTOP PET</span>
        </div>
      </div>

      <nav className="settings-navigation" aria-label="设置页面">
        {SETTINGS_NAVIGATION.map((item) => (
          <button
            type="button"
            key={item.id}
            className={item.id === activePage ? "is-active" : ""}
            aria-current={item.id === activePage ? "page" : undefined}
            aria-label={item.label}
            title={item.label}
            onClick={() => onNavigate(item.id)}
          >
            <span className="settings-navigation__index" aria-hidden="true">
              {item.index}
            </span>
            <span className="settings-navigation__label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="settings-sidebar__footer">
        <span>PHASE 2</span>
        <strong>v0.1.0</strong>
      </div>
    </aside>
  );
}
