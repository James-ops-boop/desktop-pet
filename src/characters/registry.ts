import { JETT_MANIFEST } from "./jett/manifest";
import { KILLJOY_MANIFEST } from "./killjoy/manifest";
import { OMEN_MANIFEST } from "./omen/manifest";
import { SAGE_MANIFEST } from "./sage/manifest";
import { SOVA_MANIFEST } from "./sova/manifest";
import {
  CHARACTER_ACTION_IDS,
  CHARACTER_AVAILABILITIES,
  CHARACTER_ROLES,
  type CharacterActionId,
  type CharacterManifest,
  type CharacterRoleFilter,
} from "../models/character";

const CHARACTER_ID_PATTERN = /^[a-z0-9-]{1,64}$/;
const THEME_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

export const DEFAULT_CHARACTER_ID = "omen";

export const CHARACTER_ROLE_OPTIONS = [
  { id: "all", label: "全部" },
  { id: "duelist", label: "决斗" },
  { id: "initiator", label: "先锋" },
  { id: "controller", label: "控场" },
  { id: "sentinel", label: "哨卫" },
] as const satisfies ReadonlyArray<{
  id: CharacterRoleFilter;
  label: string;
}>;

export const CHARACTER_ROLE_LABELS = {
  duelist: "决斗",
  initiator: "先锋",
  controller: "控场",
  sentinel: "哨卫",
} as const;

export const CHARACTER_ROLE_DISPLAY_LABELS = {
  duelist: "决斗者",
  initiator: "先锋",
  controller: "控场者",
  sentinel: "哨卫",
} as const;

export const CHARACTER_STATUS_LABELS = {
  current: "当前使用",
  available: "可使用",
  "in-development": "制作中",
  "not-installed": "未安装",
  "resource-error": "资源异常",
} as const;

export interface CharacterRegistry {
  readonly all: readonly CharacterManifest[];
  readonly defaultCharacterId: string;
  getById(id: string): CharacterManifest | undefined;
  resolveCurrent(id: unknown): CharacterManifest;
  isAvailable(id: unknown): boolean;
  filter(role: CharacterRoleFilter): readonly CharacterManifest[];
}

function isSafeAssetPath(path: string): boolean {
  return (
    (path.startsWith("/assets/characters/") ||
      path.startsWith("/assets/props/")) &&
    !path.includes("..") &&
    !path.includes("\\") &&
    !path.includes("://")
  );
}

function isSafeCharacterAssetPath(path: string): boolean {
  return (
    path.startsWith("/assets/characters/") && isSafeAssetPath(path)
  );
}

function hasDuplicates<T>(items: readonly T[]): boolean {
  return new Set(items).size !== items.length;
}

function assertManifest(manifest: CharacterManifest): void {
  if (manifest.schemaVersion !== 1) {
    throw new Error(`character ${manifest.id} has an unsupported schema`);
  }
  if (!CHARACTER_ID_PATTERN.test(manifest.id)) {
    throw new Error(`character id is invalid: ${manifest.id}`);
  }
  if (!CHARACTER_ROLES.includes(manifest.role)) {
    throw new Error(`character ${manifest.id} has an invalid role`);
  }
  if (!CHARACTER_AVAILABILITIES.includes(manifest.availability)) {
    throw new Error(`character ${manifest.id} has an invalid availability`);
  }
  if (
    manifest.assetHealth !== "ready" &&
    manifest.assetHealth !== "resource-error"
  ) {
    throw new Error(`character ${manifest.id} has invalid asset health`);
  }
  if (!THEME_COLOR_PATTERN.test(manifest.theme.accent)) {
    throw new Error(`character ${manifest.id} has an invalid accent color`);
  }
  if (!THEME_COLOR_PATTERN.test(manifest.theme.aura)) {
    throw new Error(`character ${manifest.id} has an invalid aura color`);
  }
  if (
    !isSafeCharacterAssetPath(manifest.assets.portrait) ||
    !isSafeCharacterAssetPath(manifest.assets.preview)
  ) {
    throw new Error(`character ${manifest.id} has an unsafe asset path`);
  }
  if (
    !Number.isFinite(manifest.defaultScale) ||
    manifest.defaultScale <= 0
  ) {
    throw new Error(`character ${manifest.id} has an invalid default scale`);
  }
  if (
    hasDuplicates(manifest.supportedModes) ||
    manifest.supportedModes.some(
      (mode) => mode !== "sync" && mode !== "life",
    )
  ) {
    throw new Error(`character ${manifest.id} has invalid mode support`);
  }
  if (
    hasDuplicates(manifest.supportedActions) ||
    manifest.supportedActions.some(
      (action) =>
        !CHARACTER_ACTION_IDS.includes(action as CharacterActionId),
    )
  ) {
    throw new Error(`character ${manifest.id} has invalid actions`);
  }
  if (
    hasDuplicates(manifest.exclusiveActions) ||
    manifest.exclusiveActions.some(
      (action) => !manifest.supportedActions.includes(action),
    )
  ) {
    throw new Error(`character ${manifest.id} has invalid exclusive actions`);
  }

  for (const [action, path] of Object.entries(
    manifest.animationResources,
  )) {
    if (
      !CHARACTER_ACTION_IDS.includes(action as CharacterActionId) ||
      (path !== null &&
        path !== undefined &&
        !isSafeAssetPath(path))
    ) {
      throw new Error(`character ${manifest.id} has an invalid animation map`);
    }
  }
}

export function createCharacterRegistry(
  manifests: readonly CharacterManifest[],
  defaultCharacterId: string,
): CharacterRegistry {
  const stableManifests = Object.freeze([...manifests]);
  const ids = stableManifests.map((manifest) => manifest.id);

  if (hasDuplicates(ids)) {
    throw new Error("character registry contains duplicate ids");
  }

  stableManifests.forEach(assertManifest);
  const byId = new Map(
    stableManifests.map((manifest) => [manifest.id, manifest]),
  );
  const defaultCharacter = byId.get(defaultCharacterId);

  if (
    !defaultCharacter ||
    defaultCharacter.availability !== "available" ||
    defaultCharacter.assetHealth !== "ready"
  ) {
    throw new Error("default character must exist and be available");
  }

  function normalizeId(id: unknown): string | undefined {
    if (typeof id !== "string") {
      return undefined;
    }

    const normalized = id.trim().toLowerCase();
    return CHARACTER_ID_PATTERN.test(normalized) ? normalized : undefined;
  }

  function getAvailable(id: unknown): CharacterManifest | undefined {
    const normalized = normalizeId(id);
    const character = normalized ? byId.get(normalized) : undefined;

    return character?.availability === "available" &&
      character.assetHealth === "ready"
      ? character
      : undefined;
  }

  return Object.freeze({
    all: stableManifests,
    defaultCharacterId,
    getById(id: string) {
      const normalized = normalizeId(id);
      return normalized ? byId.get(normalized) : undefined;
    },
    resolveCurrent(id: unknown) {
      return getAvailable(id) ?? defaultCharacter;
    },
    isAvailable(id: unknown) {
      return getAvailable(id) !== undefined;
    },
    filter(role: CharacterRoleFilter) {
      return role === "all"
        ? stableManifests
        : stableManifests.filter((character) => character.role === role);
    },
  });
}

export const CHARACTER_REGISTRY = createCharacterRegistry(
  [
    OMEN_MANIFEST,
    JETT_MANIFEST,
    SOVA_MANIFEST,
    SAGE_MANIFEST,
    KILLJOY_MANIFEST,
  ],
  DEFAULT_CHARACTER_ID,
);

export function getCharacterById(
  id: string,
): CharacterManifest | undefined {
  return CHARACTER_REGISTRY.getById(id);
}

export function resolveCurrentCharacter(id: unknown): CharacterManifest {
  return CHARACTER_REGISTRY.resolveCurrent(id);
}

export function normalizeCurrentCharacterId(id: unknown): string {
  return CHARACTER_REGISTRY.resolveCurrent(id).id;
}

export function filterCharacters(
  role: CharacterRoleFilter,
): readonly CharacterManifest[] {
  return CHARACTER_REGISTRY.filter(role);
}
