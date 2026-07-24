import { useEffect, useState } from "react";
import type { AnimationSnapshot } from "../../models/animation";
import type { CharacterManifest } from "../../models/character";
import { getCharacterAnimationPack } from "../../characters/animationRegistry";
import "./animated-pet-stage.css";

interface AnimatedPetStageProps {
  character: CharacterManifest;
  animation: AnimationSnapshot;
  idleAnimationEnabled: boolean;
  startupAnimationEnabled: boolean;
}

export function AnimatedPetStage({
  character,
  animation,
  idleAnimationEnabled,
  startupAnimationEnabled,
}: AnimatedPetStageProps) {
  const pack = getCharacterAnimationPack(character.id);
  const [startupActive, setStartupActive] = useState(
    startupAnimationEnabled,
  );

  useEffect(() => {
    if (!startupAnimationEnabled) {
      setStartupActive(false);
      return;
    }

    setStartupActive(true);
    const timer = window.setTimeout(() => {
      setStartupActive(false);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [startupAnimationEnabled]);

  if (!pack) {
    return (
      <div className="animated-pet-stage animated-pet-stage--fallback">
        <img src={character.assets.preview} alt="" aria-hidden="true" />
      </div>
    );
  }

  const visibleLayers = pack.modes[animation.mode].visibleLayers;
  const className = [
    "animated-pet-stage",
    `animated-pet-stage--${animation.mode}`,
    `animated-pet-stage--${animation.stateId}`,
    `animated-pet-stage--${animation.transitionStage}`,
    animation.paused ? "animated-pet-stage--paused" : "",
    !idleAnimationEnabled ? "animated-pet-stage--idle-disabled" : "",
    startupActive ? "animated-pet-stage--startup" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      data-animation-state={animation.stateId}
      data-companion-mode={animation.mode}
    >
      <div className="animated-pet-stage__aura" aria-hidden="true" />
      <div className="animated-pet-stage__shadow" aria-hidden="true" />
      <div className="animated-pet-stage__motion">
        {visibleLayers.map((layerId) => {
          const layer = pack.layers[layerId];
          return (
            <img
              key={layer.id}
              className={`animated-pet-stage__layer animated-pet-stage__layer--${layer.id}`}
              src={layer.src}
              style={{ zIndex: layer.zIndex }}
              alt=""
              aria-hidden="true"
              draggable={false}
            />
          );
        })}
      </div>
      <span className="animated-pet-stage__mode-mark" aria-hidden="true">
        {animation.mode === "sync" ? "A" : "B"}
      </span>
    </div>
  );
}
