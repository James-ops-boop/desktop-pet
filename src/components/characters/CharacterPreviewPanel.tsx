import type { CSSProperties } from "react";
import {
  CHARACTER_ROLE_DISPLAY_LABELS,
  CHARACTER_STATUS_LABELS,
} from "../../characters/registry";
import {
  CHARACTER_ACTIONS,
  type CharacterActionId,
  type CharacterManifest,
} from "../../models/character";
import {
  getCharacterActivationState,
  getCharacterCardStatus,
} from "../../services/character-manager/characterManager";

type CharacterPreviewStyle = CSSProperties & {
  "--character-accent": string;
  "--character-aura": string;
};

interface CharacterPreviewPanelProps {
  character: CharacterManifest;
  currentCharacterId: string;
  selectedAction: CharacterActionId | null;
  activationBusy: boolean;
  onSelectAction: (action: CharacterActionId) => void;
  onActivate: () => void;
}

export function CharacterPreviewPanel({
  character,
  currentCharacterId,
  selectedAction,
  activationBusy,
  onSelectAction,
  onActivate,
}: CharacterPreviewPanelProps) {
  const style: CharacterPreviewStyle = {
    "--character-accent": character.theme.accent,
    "--character-aura": character.theme.aura,
  };
  const status = getCharacterCardStatus(character, currentCharacterId);
  const activation = getCharacterActivationState(
    character,
    currentCharacterId,
  );
  const selectedActionDefinition = CHARACTER_ACTIONS.find(
    (action) => action.id === selectedAction,
  );

  return (
    <article
      className="character-preview"
      style={style}
      aria-labelledby="character-preview-title"
    >
      <div className="character-preview__visual">
        <img src={character.assets.preview} alt="" aria-hidden="true" />
        <div className="character-preview__visual-copy">
          <span>PHASE 3 PREVIEW FRAME</span>
          <strong>{character.names.en}</strong>
          <small>阶段 4 接入正式 Q 版资源与动画</small>
        </div>
      </div>

      <header className="character-preview__header">
        <div>
          <span>{character.codename}</span>
          <h2 id="character-preview-title">{character.names.en}</h2>
          <p>
            {character.names.zhCN} ·{" "}
            {CHARACTER_ROLE_DISPLAY_LABELS[character.role]}
          </p>
        </div>
        <span
          className={`character-status character-status--${status}`}
        >
          {CHARACTER_STATUS_LABELS[status]}
        </span>
      </header>

      <p className="character-preview__description">
        {character.description}
      </p>

      <section
        className="character-preview__modes"
        aria-labelledby="character-mode-support-title"
      >
        <div className="character-preview__section-title">
          <div>
            <span>MODE SUPPORT</span>
            <h3 id="character-mode-support-title">形态预览</h3>
          </div>
        </div>
        <div className="character-mode-grid">
          <div
            className={
              character.supportedModes.includes("sync")
                ? "is-supported"
                : ""
            }
          >
            <span>A</span>
            <strong>同步模式</strong>
            <small>
              {character.supportedModes.includes("sync")
                ? "计划支持 · 键盘与鼠标"
                : "尚未制作"}
            </small>
          </div>
          <div
            className={
              character.supportedModes.includes("life")
                ? "is-supported"
                : ""
            }
          >
            <span>B</span>
            <strong>生活模式</strong>
            <small>
              {character.supportedModes.includes("life")
                ? "计划支持 · 作息与活动"
                : "尚未制作"}
            </small>
          </div>
        </div>
      </section>

      <section
        className="character-action-preview"
        aria-labelledby="character-action-preview-title"
      >
        <div className="character-preview__section-title">
          <div>
            <span>ACTION PREVIEW</span>
            <h3 id="character-action-preview-title">动作预览入口</h3>
          </div>
          <small>仅切换本地预览，不写入设置</small>
        </div>

        <div className="character-action-list">
          {CHARACTER_ACTIONS.map((action) => {
            const supported = character.supportedActions.includes(
              action.id,
            );

            return (
              <button
                type="button"
                key={action.id}
                className={
                  selectedAction === action.id ? "is-selected" : ""
                }
                disabled={!supported}
                aria-pressed={selectedAction === action.id}
                title={supported ? action.description : "该角色尚未支持"}
                onClick={() => onSelectAction(action.id)}
              >
                {action.label}
              </button>
            );
          })}
        </div>

        <div className="character-action-frame" aria-live="polite">
          <span aria-hidden="true">◇</span>
          <div>
            <strong>
              {selectedActionDefinition?.label ?? "暂无可预览动作"}
            </strong>
            <p>
              {selectedActionDefinition
                ? `${selectedActionDefinition.description} 阶段 4 接入动画播放。`
                : "该占位角色尚未配置动作资源。"}
            </p>
          </div>
        </div>
      </section>

      <footer className="character-preview__actions">
        <div>
          <strong>{activation.label}</strong>
          <p>{activation.reason}</p>
        </div>
        <button
          type="button"
          className="button button--primary"
          disabled={activation.disabled || activationBusy}
          aria-busy={activationBusy}
          onClick={onActivate}
        >
          {activationBusy ? "正在启用…" : activation.label}
        </button>
      </footer>
    </article>
  );
}
