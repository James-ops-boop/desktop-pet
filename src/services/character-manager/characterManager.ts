import {
  CHARACTER_REGISTRY,
  CHARACTER_STATUS_LABELS,
  type CharacterRegistry,
} from "../../characters/registry";
import type {
  CharacterCardStatus,
  CharacterManifest,
} from "../../models/character";

export interface CharacterBrowserState {
  currentCharacterId: string;
  previewCharacterId: string;
}

export interface CharacterActivationState {
  status: CharacterCardStatus;
  label: string;
  disabled: boolean;
  reason: string;
}

export type PersistCharacterSelection = (
  patch: Readonly<{ currentCharacterId: string }>,
) => Promise<void>;

export function createCharacterBrowserState(
  currentCharacterId: unknown,
  registry: CharacterRegistry = CHARACTER_REGISTRY,
): CharacterBrowserState {
  const current = registry.resolveCurrent(currentCharacterId).id;
  return {
    currentCharacterId: current,
    previewCharacterId: current,
  };
}

export function browseCharacter(
  state: CharacterBrowserState,
  previewCharacterId: string,
  registry: CharacterRegistry = CHARACTER_REGISTRY,
): CharacterBrowserState {
  const character = registry.getById(previewCharacterId);
  if (!character) {
    return state;
  }

  return {
    ...state,
    previewCharacterId: character.id,
  };
}

export function reconcileCurrentCharacter(
  state: CharacterBrowserState,
  currentCharacterId: unknown,
  registry: CharacterRegistry = CHARACTER_REGISTRY,
): CharacterBrowserState {
  const current = registry.resolveCurrent(currentCharacterId).id;
  const preview = registry.getById(state.previewCharacterId)
    ? state.previewCharacterId
    : current;

  return {
    currentCharacterId: current,
    previewCharacterId: preview,
  };
}

export function getCharacterCardStatus(
  character: CharacterManifest,
  currentCharacterId: string,
): CharacterCardStatus {
  if (character.assetHealth === "resource-error") {
    return "resource-error";
  }
  if (character.id === currentCharacterId) {
    return "current";
  }
  return character.availability;
}

export function getCharacterActivationState(
  character: CharacterManifest,
  currentCharacterId: string,
): CharacterActivationState {
  const status = getCharacterCardStatus(character, currentCharacterId);

  switch (status) {
    case "current":
      return {
        status,
        label: "当前正在使用",
        disabled: true,
        reason: "这个角色已经是当前桌宠。",
      };
    case "available":
      return {
        status,
        label: "设为当前桌宠",
        disabled: false,
        reason: "确认后才会更新当前桌宠配置。",
      };
    case "in-development":
      return {
        status,
        label: "角色制作中",
        disabled: true,
        reason: character.availabilityNote,
      };
    case "not-installed":
      return {
        status,
        label: "角色尚未安装",
        disabled: true,
        reason: character.availabilityNote,
      };
    case "resource-error":
      return {
        status,
        label: "角色资源异常",
        disabled: true,
        reason: "角色资源校验失败，无法启用。",
      };
  }
}

export async function requestCharacterActivation(
  state: CharacterBrowserState,
  persist: PersistCharacterSelection,
  registry: CharacterRegistry = CHARACTER_REGISTRY,
): Promise<void> {
  const character = registry.getById(state.previewCharacterId);

  if (!character) {
    throw new Error("preview character is not registered");
  }

  const activation = getCharacterActivationState(
    character,
    state.currentCharacterId,
  );

  if (activation.status === "current") {
    return;
  }
  if (activation.disabled) {
    throw new Error(activation.reason);
  }

  await persist({ currentCharacterId: character.id });
}

export { CHARACTER_STATUS_LABELS };
