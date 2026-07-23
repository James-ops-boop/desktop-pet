import { SettingsSection } from "../../components/settings/SettingsControls";

export function AboutPage() {
  return (
    <div className="settings-page">
      <section className="about-hero">
        <div className="about-hero__mark" aria-hidden="true">
          SC
        </div>
        <div>
          <span>WINDOWS DESKTOP COMPANION</span>
          <h2>Shadow Companion</h2>
          <p>版本 0.1.0 · 阶段 2</p>
        </div>
      </section>

      <SettingsSection title="项目说明">
        <div className="about-copy">
          <p>
            Shadow Companion 是一个从零开发的 Windows 桌宠软件。第一版以
            Omen 为唯一可用角色，但角色、资源与动作结构会保持可扩展。
          </p>
          <p>
            本项目为个人、非商业的《无畏契约 / VALORANT》同人项目，不包含或分发
            Riot Games 官方角色原画、模型或动画资源。
          </p>
        </div>
      </SettingsSection>

      <SettingsSection title="主要开源组件">
        <div className="component-list">
          <span>Tauri 2</span>
          <span>React 19</span>
          <span>TypeScript</span>
          <span>Vite</span>
          <span>Rust</span>
        </div>
      </SettingsSection>

      <SettingsSection title="项目仓库">
        <code className="repository-address">
          github.com/James-ops-boop/desktop-pet
        </code>
      </SettingsSection>
    </div>
  );
}
