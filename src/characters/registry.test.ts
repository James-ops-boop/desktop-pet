import { describe, expect, it } from "vitest";
import { OMEN_MANIFEST } from "./omen/manifest";
import {
  CHARACTER_REGISTRY,
  createCharacterRegistry,
} from "./registry";
import type {
  CharacterActionId,
  CharacterAvailability,
  CharacterManifest,
} from "../models/character";

function testManifest(
  id: string,
  availability: CharacterAvailability = "available",
): CharacterManifest {
  return {
    ...OMEN_MANIFEST,
    id,
    names: {
      zhCN: `测试角色 ${id}`,
      en: id.toUpperCase(),
    },
    availability,
    theme: {
      accent: "#8175f5",
      aura: "#4e68d8",
    },
    supportedModes: [...OMEN_MANIFEST.supportedModes],
    supportedActions: [...OMEN_MANIFEST.supportedActions],
    exclusiveActions: [...OMEN_MANIFEST.exclusiveActions],
    animationResources: {
      ...OMEN_MANIFEST.animationResources,
    },
    effects: {
      ...OMEN_MANIFEST.effects,
    },
  };
}

describe("CHARACTER_REGISTRY", () => {
  it("keeps unique stable ids and exposes only Omen as available", () => {
    const ids = CHARACTER_REGISTRY.all.map((character) => character.id);
    const available = CHARACTER_REGISTRY.all.filter(
      (character) => character.availability === "available",
    );

    expect(new Set(ids).size).toBe(ids.length);
    expect(available.map((character) => character.id)).toEqual(["omen"]);
    expect(
      CHARACTER_REGISTRY.all
        .filter((character) => character.id !== "omen")
        .every(
          (character) =>
            character.availability === "in-development",
        ),
    ).toBe(true);
    expect(CHARACTER_REGISTRY.defaultCharacterId).toBe("omen");
  });

  it("registers Omen as an available controller with both modes", () => {
    const omen = CHARACTER_REGISTRY.getById("omen");

    expect(omen).toMatchObject({
      id: "omen",
      role: "controller",
      availability: "available",
      assetHealth: "ready",
      supportedModes: ["sync", "life"],
    });
    expect(omen?.supportedActions).toHaveLength(9);
    expect(omen?.exclusiveActions).toEqual(["shadow"]);
  });

  it("filters every profession without mutating registry order", () => {
    const original = CHARACTER_REGISTRY.all.map(
      (character) => character.id,
    );

    expect(
      CHARACTER_REGISTRY.filter("duelist").map(
        (character) => character.id,
      ),
    ).toEqual(["jett"]);
    expect(
      CHARACTER_REGISTRY.filter("initiator").map(
        (character) => character.id,
      ),
    ).toEqual(["sova"]);
    expect(
      CHARACTER_REGISTRY.filter("controller").map(
        (character) => character.id,
      ),
    ).toEqual(["omen"]);
    expect(
      CHARACTER_REGISTRY.filter("sentinel").map(
        (character) => character.id,
      ),
    ).toEqual(["sage", "killjoy"]);
    expect(
      CHARACTER_REGISTRY.filter("all").map(
        (character) => character.id,
      ),
    ).toEqual(original);
    expect(
      CHARACTER_REGISTRY.all.map((character) => character.id),
    ).toEqual(original);
  });

  it("normalizes an available id and rejects unavailable or unknown ids", () => {
    expect(CHARACTER_REGISTRY.resolveCurrent(" OMEN ").id).toBe("omen");
    expect(CHARACTER_REGISTRY.resolveCurrent("jett").id).toBe("omen");
    expect(CHARACTER_REGISTRY.resolveCurrent("sage").id).toBe("omen");
    expect(
      CHARACTER_REGISTRY.resolveCurrent("unknown-agent").id,
    ).toBe("omen");
  });
});

describe("createCharacterRegistry", () => {
  it("supports a future second available character without core changes", () => {
    const registry = createCharacterRegistry(
      [testManifest("omen"), testManifest("future-agent")],
      "omen",
    );

    expect(registry.isAvailable("future-agent")).toBe(true);
    expect(registry.resolveCurrent("future-agent").id).toBe(
      "future-agent",
    );
  });

  it("rejects duplicate ids and an unavailable default", () => {
    expect(() =>
      createCharacterRegistry(
        [testManifest("omen"), testManifest("omen")],
        "omen",
      ),
    ).toThrow(/duplicate ids/);
    expect(() =>
      createCharacterRegistry(
        [testManifest("omen", "in-development")],
        "omen",
      ),
    ).toThrow(/default character/);
  });

  it("rejects unsafe assets, invalid colors and duplicate actions", () => {
    const unsafeAsset = {
      ...testManifest("omen"),
      assets: {
        portrait: "https://example.com/portrait.png",
        preview: "../preview.svg",
      },
    };
    const invalidColor = {
      ...testManifest("omen"),
      theme: {
        accent: "purple",
        aura: "#4e68d8",
      },
    };
    const duplicateActions = {
      ...testManifest("omen"),
      supportedActions: [
        "idle",
        "idle",
      ] as CharacterActionId[],
      exclusiveActions: [],
    };

    expect(() =>
      createCharacterRegistry([unsafeAsset], "omen"),
    ).toThrow(/unsafe asset/);
    expect(() =>
      createCharacterRegistry([invalidColor], "omen"),
    ).toThrow(/accent color/);
    expect(() =>
      createCharacterRegistry([duplicateActions], "omen"),
    ).toThrow(/invalid actions/);
  });

  it("rejects an unknown asset health value at runtime", () => {
    const invalidHealth = {
      ...testManifest("omen"),
      assetHealth: "garbage",
    } as unknown as CharacterManifest;

    expect(() =>
      createCharacterRegistry([invalidHealth], "omen"),
    ).toThrow(/asset health/);
  });
});
