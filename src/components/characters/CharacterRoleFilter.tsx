import { CHARACTER_ROLE_OPTIONS } from "../../characters/registry";
import type {
  CharacterManifest,
  CharacterRoleFilter as CharacterRoleFilterId,
} from "../../models/character";

interface CharacterRoleFilterProps {
  value: CharacterRoleFilterId;
  characters: readonly CharacterManifest[];
  onChange: (role: CharacterRoleFilterId) => void;
}

export function CharacterRoleFilter({
  value,
  characters,
  onChange,
}: CharacterRoleFilterProps) {
  return (
    <fieldset className="character-role-filter">
      <legend>职业分类</legend>
      <div className="character-role-filter__options">
        {CHARACTER_ROLE_OPTIONS.map((option) => {
          const count =
            option.id === "all"
              ? characters.length
              : characters.filter(
                  (character) => character.role === option.id,
                ).length;

          return (
            <label
              key={option.id}
              className={option.id === value ? "is-selected" : ""}
            >
              <input
                type="radio"
                name="character-role"
                value={option.id}
                checked={option.id === value}
                onChange={() => onChange(option.id)}
              />
              <span>
                {option.label}
                <small>{count}</small>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
