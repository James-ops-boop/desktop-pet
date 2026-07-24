import { useEffect, useMemo, useState } from "react";
import { CharacterCard } from "../../components/characters/CharacterCard";
import { CharacterPreviewPanel } from "../../components/characters/CharacterPreviewPanel";
import { CharacterRoleFilter } from "../../components/characters/CharacterRoleFilter";
import {
  CHARACTER_REGISTRY,
  filterCharacters,
  getCharacterById,
} from "../../characters/registry";
import type {
  CharacterActionId,
  CharacterRoleFilter as CharacterRoleFilterId,
} from "../../models/character";
import {
  browseCharacter,
  createCharacterBrowserState,
  getCharacterCardStatus,
  reconcileCurrentCharacter,
  requestCharacterActivation,
} from "../../services/character-manager/characterManager";
import "./characters-page.css";

interface CharactersPageProps {
  currentCharacterId: string;
  onSetCurrentCharacter: (id: string) => Promise<void>;
}

export function CharactersPage({
  currentCharacterId,
  onSetCurrentCharacter,
}: CharactersPageProps) {
  const [activeRole, setActiveRole] =
    useState<CharacterRoleFilterId>("all");
  const [browserState, setBrowserState] = useState(() =>
    createCharacterBrowserState(currentCharacterId),
  );
  const [selectedAction, setSelectedAction] =
    useState<CharacterActionId | null>("idle");
  const [activationBusy, setActivationBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const filteredCharacters = useMemo(
    () => filterCharacters(activeRole),
    [activeRole],
  );
  const previewCharacter =
    getCharacterById(browserState.previewCharacterId) ??
    CHARACTER_REGISTRY.resolveCurrent(currentCharacterId);

  useEffect(() => {
    setBrowserState((current) =>
      reconcileCurrentCharacter(current, currentCharacterId),
    );
  }, [currentCharacterId]);

  useEffect(() => {
    if (
      filteredCharacters.length > 0 &&
      !filteredCharacters.some(
        (character) => character.id === browserState.previewCharacterId,
      )
    ) {
      const fallbackCharacter = filteredCharacters[0];
      setBrowserState((current) =>
        browseCharacter(current, fallbackCharacter.id),
      );
      setAnnouncement(
        `已打开 ${fallbackCharacter.names.en}（${fallbackCharacter.names.zhCN}）预览`,
      );
    }
  }, [browserState.previewCharacterId, filteredCharacters]);

  useEffect(() => {
    if (
      selectedAction === null ||
      !previewCharacter.supportedActions.includes(selectedAction)
    ) {
      setSelectedAction(previewCharacter.supportedActions[0] ?? null);
    }
  }, [previewCharacter, selectedAction]);

  function handleBrowse(characterId: string) {
    const character = getCharacterById(characterId);
    if (!character) {
      return;
    }

    setBrowserState((current) => browseCharacter(current, characterId));
    setAnnouncement(
      `已打开 ${character.names.en}（${character.names.zhCN}）预览`,
    );
  }

  async function handleActivate() {
    if (activationBusy) {
      return;
    }

    setActivationBusy(true);
    try {
      await requestCharacterActivation(browserState, async (patch) => {
        await onSetCurrentCharacter(patch.currentCharacterId);
      });
    } catch {
      // SettingsWindow owns the visible persistence error.
    } finally {
      setActivationBusy(false);
    }
  }

  return (
    <div className="settings-page character-page">
      <div className="character-browser-intro">
        <div>
          <span>
            CHARACTER REGISTRY · {CHARACTER_REGISTRY.all.length} ENTRIES
          </span>
          <h2>选择你的桌宠角色</h2>
          <p>
            浏览只改变本页预览。只有点击“设为当前桌宠”才会保存并同步到桌宠窗口。
          </p>
        </div>
        <div className="character-browser-intro__current">
          <span>当前角色</span>
          <strong>
            {
              CHARACTER_REGISTRY.resolveCurrent(currentCharacterId).names
                .en
            }
          </strong>
        </div>
      </div>

      <CharacterRoleFilter
        value={activeRole}
        characters={CHARACTER_REGISTRY.all}
        onChange={setActiveRole}
      />

      <div className="character-browser">
        <section
          className="character-catalog"
          aria-labelledby="character-catalog-title"
        >
          <header>
            <div>
              <span>CATALOG</span>
              <h3 id="character-catalog-title">角色卡片</h3>
            </div>
            <small>{filteredCharacters.length} 个角色</small>
          </header>

          {filteredCharacters.length > 0 ? (
            <ul className="character-grid">
              {filteredCharacters.map((character) => (
                <li key={character.id}>
                  <CharacterCard
                    character={character}
                    status={getCharacterCardStatus(
                      character,
                      currentCharacterId,
                    )}
                    selected={
                      character.id === browserState.previewCharacterId
                    }
                    onSelect={() => handleBrowse(character.id)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="character-catalog__empty">
              该职业暂时没有已注册角色。
            </div>
          )}
        </section>

        <CharacterPreviewPanel
          character={previewCharacter}
          currentCharacterId={currentCharacterId}
          selectedAction={selectedAction}
          activationBusy={activationBusy}
          onSelectAction={setSelectedAction}
          onActivate={() => {
            void handleActivate();
          }}
        />
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
