import type { CSSProperties } from "react";
import {
  CHARACTER_ROLE_LABELS,
  CHARACTER_STATUS_LABELS,
} from "../../characters/registry";
import type {
  CharacterCardStatus,
  CharacterManifest,
} from "../../models/character";

type CharacterCardStyle = CSSProperties & {
  "--character-accent": string;
  "--character-aura": string;
};

interface CharacterCardProps {
  character: CharacterManifest;
  status: CharacterCardStatus;
  selected: boolean;
  onSelect: () => void;
}

export function CharacterCard({
  character,
  status,
  selected,
  onSelect,
}: CharacterCardProps) {
  const style: CharacterCardStyle = {
    "--character-accent": character.theme.accent,
    "--character-aura": character.theme.aura,
  };

  return (
    <button
      type="button"
      className={`character-card character-card--${status} ${
        selected ? "is-selected" : ""
      }`}
      style={style}
      aria-pressed={selected}
      aria-label={`${character.names.en}，${character.names.zhCN}，${
        CHARACTER_ROLE_LABELS[character.role]
      }，${CHARACTER_STATUS_LABELS[status]}`}
      onClick={onSelect}
    >
      <span className="character-card__portrait" aria-hidden="true">
        <img src={character.assets.portrait} alt="" />
        <span>{character.names.en.slice(0, 2)}</span>
      </span>
      <span className="character-card__copy">
        <strong>{character.names.en}</strong>
        <span>
          {character.names.zhCN} · {CHARACTER_ROLE_LABELS[character.role]}
        </span>
      </span>
      <span
        className={`character-status character-status--${status}`}
      >
        {CHARACTER_STATUS_LABELS[status]}
      </span>
    </button>
  );
}
