import type { CharacterAnimationPack } from "../models/animation";
import { OMEN_ANIMATION_PACK } from "./omen/animation";

const ANIMATION_PACKS = new Map<string, CharacterAnimationPack>([
  [OMEN_ANIMATION_PACK.characterId, OMEN_ANIMATION_PACK],
]);

export function getCharacterAnimationPack(
  characterId: string,
): CharacterAnimationPack | undefined {
  return ANIMATION_PACKS.get(characterId);
}
