import { describe, expect, it, vi } from "vitest";
import { OMEN_MANIFEST } from "../../characters/omen/manifest";
import {
  CHARACTER_REGISTRY,
  createCharacterRegistry,
} from "../../characters/registry";
import type { CharacterManifest } from "../../models/character";
import {
  browseCharacter,
  createCharacterBrowserState,
  getCharacterActivationState,
  reconcileCurrentCharacter,
  requestCharacterActivation,
} from "./characterManager";

function secondAvailableCharacter(): CharacterManifest {
  return {
    ...OMEN_MANIFEST,
    id: "future-agent",
    names: {
      zhCN: "未来角色",
      en: "FUTURE",
    },
    role: "duelist",
    supportedModes: [...OMEN_MANIFEST.supportedModes],
    supportedActions: [...OMEN_MANIFEST.supportedActions],
    exclusiveActions: [],
    animationResources: {
      ...OMEN_MANIFEST.animationResources,
    },
    effects: {
      ...OMEN_MANIFEST.effects,
    },
  };
}

describe("character browser state", () => {
  it("starts at the persisted character and browsing never changes current", () => {
    const initial = createCharacterBrowserState("omen");
    const browsed = browseCharacter(initial, "jett");

    expect(initial).toEqual({
      currentCharacterId: "omen",
      previewCharacterId: "omen",
    });
    expect(browsed).toEqual({
      currentCharacterId: "omen",
      previewCharacterId: "jett",
    });
  });

  it("ignores unknown preview ids and follows an external current snapshot", () => {
    const initial = browseCharacter(
      createCharacterBrowserState("omen"),
      "jett",
    );
    const ignored = browseCharacter(initial, "unknown-agent");
    const reconciled = reconcileCurrentCharacter(ignored, " OMEN ");

    expect(ignored).toBe(initial);
    expect(reconciled).toEqual({
      currentCharacterId: "omen",
      previewCharacterId: "jett",
    });
  });

  it("stores the registry canonical id when browsing", () => {
    const browsed = browseCharacter(
      createCharacterBrowserState("omen"),
      " JETT ",
    );

    expect(browsed.previewCharacterId).toBe("jett");
  });

  it("derives non-color-only activation reasons for every production state", () => {
    const omen = CHARACTER_REGISTRY.getById("omen");
    const jett = CHARACTER_REGISTRY.getById("jett");

    expect(
      omen && getCharacterActivationState(omen, "omen"),
    ).toMatchObject({
      status: "current",
      label: "当前正在使用",
      disabled: true,
    });
    expect(
      jett && getCharacterActivationState(jett, "omen"),
    ).toMatchObject({
      status: "in-development",
      label: "角色制作中",
      disabled: true,
    });
  });

  it("blocks a registered character whose resources are unhealthy", () => {
    const broken = {
      ...secondAvailableCharacter(),
      assetHealth: "resource-error",
    } as const satisfies CharacterManifest;

    expect(getCharacterActivationState(broken, "omen")).toMatchObject({
      status: "resource-error",
      label: "角色资源异常",
      disabled: true,
    });
  });

  it("explains the reserved not-installed state", () => {
    const notInstalled = {
      ...secondAvailableCharacter(),
      availability: "not-installed",
    } as const satisfies CharacterManifest;

    expect(
      getCharacterActivationState(notInstalled, "omen"),
    ).toMatchObject({
      status: "not-installed",
      label: "角色尚未安装",
      disabled: true,
    });
  });
});

describe("requestCharacterActivation", () => {
  it("commits exactly one character patch only after explicit confirmation", async () => {
    const registry = createCharacterRegistry(
      [OMEN_MANIFEST, secondAvailableCharacter()],
      "omen",
    );
    const state = browseCharacter(
      createCharacterBrowserState("omen", registry),
      "future-agent",
      registry,
    );
    const persist = vi.fn(async () => undefined);

    expect(persist).not.toHaveBeenCalled();
    await requestCharacterActivation(state, persist, registry);

    expect(persist).toHaveBeenCalledTimes(1);
    expect(persist).toHaveBeenCalledWith({
      currentCharacterId: "future-agent",
    });
  });

  it("does not write the current or an unavailable character", async () => {
    const persist = vi.fn(async () => undefined);
    const current = createCharacterBrowserState("omen");
    const unavailable = browseCharacter(current, "jett");

    await requestCharacterActivation(current, persist);
    await expect(
      requestCharacterActivation(unavailable, persist),
    ).rejects.toThrow(/尚未制作|占位|制作/);
    expect(persist).not.toHaveBeenCalled();
  });

  it("propagates save failure without mutating the browser state", async () => {
    const registry = createCharacterRegistry(
      [OMEN_MANIFEST, secondAvailableCharacter()],
      "omen",
    );
    const state = browseCharacter(
      createCharacterBrowserState("omen", registry),
      "future-agent",
      registry,
    );
    const snapshot = { ...state };

    await expect(
      requestCharacterActivation(
        state,
        async () => {
          throw new Error("disk unavailable");
        },
        registry,
      ),
    ).rejects.toThrow("disk unavailable");
    expect(state).toEqual(snapshot);
  });
});
