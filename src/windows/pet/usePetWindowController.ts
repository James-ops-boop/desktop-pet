import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { UnlistenFn } from "@tauri-apps/api/event";
import {
  getCurrentWindow,
  LogicalSize,
  PhysicalPosition,
} from "@tauri-apps/api/window";
import type { AppSettings } from "../../models/settings";
import type { CompanionMode } from "../../models/settings";
import { centerPetWindowWithoutSaving } from "../../services/window/windowCommands";
import { useAppSettings } from "../../state/useAppSettings";

const POSITION_SAVE_DELAY_MS = 220;
const PET_DESIGN_SIZE = 380;
const petWindow = getCurrentWindow();

interface PetGestureCallbacks {
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

async function applyWindowAppearance(settings: AppSettings) {
  await petWindow.setSize(
    new LogicalSize(
      PET_DESIGN_SIZE * settings.petScale,
      PET_DESIGN_SIZE * settings.petScale,
    ),
  );
  await petWindow.setAlwaysOnTop(settings.alwaysOnTop);
}

export function usePetWindowController() {
  const { settings, error: settingsError, update } = useAppSettings();
  const [windowError, setWindowError] = useState<string>();
  const [positionStatus, setPositionStatus] = useState<
    "idle" | "dragging" | "pending" | "saved"
  >("idle");
  const latestSettingsRef = useRef(settings);
  const initializedRef = useRef(false);
  const saveTimerRef = useRef<number | undefined>(undefined);
  const lastPositionRef = useRef<PhysicalPosition | undefined>(
    undefined,
  );
  const positionGenerationRef = useRef(0);
  const appearanceQueueRef = useRef<Promise<void>>(Promise.resolve());
  const lastObservedSettingsRef = useRef<AppSettings | undefined>(
    undefined,
  );
  const lastAppearanceTargetRef = useRef<AppSettings | undefined>(
    undefined,
  );
  const ready = settings !== undefined;

  const cancelPendingPositionSave = useCallback(() => {
    positionGenerationRef.current += 1;
    lastPositionRef.current = undefined;

    if (saveTimerRef.current !== undefined) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = undefined;
      setPositionStatus("idle");
    }
  }, []);

  useEffect(() => {
    latestSettingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (!ready || initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    let active = true;
    let unlistenMoved: UnlistenFn | undefined;

    async function initializeWindow() {
      const initialSettings = latestSettingsRef.current;
      if (!initialSettings) {
        return;
      }

      lastObservedSettingsRef.current = initialSettings;
      lastAppearanceTargetRef.current = initialSettings;
      try {
        await applyWindowAppearance(initialSettings);
      } catch (caught) {
        lastAppearanceTargetRef.current = undefined;
        throw caught;
      }

      if (
        initialSettings.rememberPosition &&
        initialSettings.petPositionX !== null &&
        initialSettings.petPositionY !== null
      ) {
        await petWindow.setPosition(
          new PhysicalPosition(
            initialSettings.petPositionX,
            initialSettings.petPositionY,
          ),
        );
      } else {
        await centerPetWindowWithoutSaving();
      }

      const listener = await petWindow.onMoved(({ payload }) => {
        const currentSettings = latestSettingsRef.current;
        if (!currentSettings?.rememberPosition) {
          return;
        }

        const generation = positionGenerationRef.current + 1;
        positionGenerationRef.current = generation;
        lastPositionRef.current = payload;
        setPositionStatus("pending");

        if (saveTimerRef.current !== undefined) {
          window.clearTimeout(saveTimerRef.current);
        }

        saveTimerRef.current = window.setTimeout(() => {
          saveTimerRef.current = undefined;
          const position = lastPositionRef.current;
          const latestSettings = latestSettingsRef.current;
          if (
            !position ||
            !latestSettings?.rememberPosition ||
            generation !== positionGenerationRef.current
          ) {
            return;
          }

          void update({
            petPositionX: position.x,
            petPositionY: position.y,
          })
            .then(() => {
              if (active) {
                setPositionStatus("saved");
              }
            })
            .catch((caught) => {
              if (active) {
                setWindowError(String(caught));
              }
            });
        }, POSITION_SAVE_DELAY_MS);
      });

      if (!active) {
        listener();
        return;
      }

      unlistenMoved = listener;
    }

    const initialization = initializeWindow();
    appearanceQueueRef.current = initialization.catch(() => undefined);
    void initialization.catch((caught) => {
      if (active) {
        setWindowError(String(caught));
      }
    });

    return () => {
      active = false;
      unlistenMoved?.();
      cancelPendingPositionSave();
    };
  }, [cancelPendingPositionSave, ready, update]);

  useEffect(() => {
    if (!settings || !initializedRef.current) {
      return;
    }

    const nextSettings = settings;
    const previous = lastObservedSettingsRef.current;
    lastObservedSettingsRef.current = nextSettings;

    if (
      !nextSettings.rememberPosition ||
      (previous &&
        (previous.petPositionX !== nextSettings.petPositionX ||
          previous.petPositionY !== nextSettings.petPositionY))
    ) {
      cancelPendingPositionSave();
    }

    const appearanceTarget = lastAppearanceTargetRef.current;
    if (
      !appearanceTarget ||
      appearanceTarget.petScale !== nextSettings.petScale ||
      appearanceTarget.alwaysOnTop !== nextSettings.alwaysOnTop
    ) {
      const appearanceSettings = nextSettings;
      lastAppearanceTargetRef.current = appearanceSettings;
      appearanceQueueRef.current = appearanceQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          await applyWindowAppearance(appearanceSettings);
          setWindowError(undefined);
        })
        .catch((caught) => {
          if (
            lastAppearanceTargetRef.current === appearanceSettings
          ) {
            lastAppearanceTargetRef.current = undefined;
          }
          setWindowError(String(caught));
        });
    }

    if (
      previous &&
      !previous.rememberPosition &&
      nextSettings.rememberPosition
    ) {
      void petWindow
        .outerPosition()
        .then((position) =>
          update({
            petPositionX: position.x,
            petPositionY: position.y,
          }),
        )
        .catch((caught) => setWindowError(String(caught)));
    }
  }, [cancelPendingPositionSave, settings, update]);

  const startDrag = useCallback(
    async (
      event: ReactMouseEvent<HTMLElement>,
      callbacks: PetGestureCallbacks,
    ) => {
      if (
        event.button !== 0 ||
        latestSettingsRef.current?.positionLocked
      ) {
        return;
      }

      let feedbackTimer: number | undefined;
      let dragFeedbackStarted = false;
      try {
        const startedAt = performance.now();
        const startPosition = await petWindow.outerPosition();
        feedbackTimer = window.setTimeout(() => {
          dragFeedbackStarted = true;
          callbacks.onDragStart();
        }, 120);

        setPositionStatus("dragging");
        await petWindow.startDragging();
        window.clearTimeout(feedbackTimer);
        const endPosition = await petWindow.outerPosition();
        const moved =
          Math.abs(endPosition.x - startPosition.x) > 3 ||
          Math.abs(endPosition.y - startPosition.y) > 3;

        if (!moved && performance.now() - startedAt < 650) {
          callbacks.onClick();
          setPositionStatus((current) =>
            current === "dragging" ? "idle" : current,
          );
        }

        setWindowError(undefined);
        window.setTimeout(() => {
          setPositionStatus((current) =>
            current === "dragging" ? "idle" : current,
          );
        }, 900);
      } catch (caught) {
        setPositionStatus("idle");
        setWindowError(String(caught));
      } finally {
        if (feedbackTimer !== undefined) {
          window.clearTimeout(feedbackTimer);
        }
        if (dragFeedbackStarted) {
          callbacks.onDragEnd();
        }
      }
    },
    [],
  );

  const togglePositionLock = useCallback(async () => {
    const current = latestSettingsRef.current;
    if (!current) {
      return;
    }

    await update({ positionLocked: !current.positionLocked });
  }, [update]);

  const toggleAlwaysOnTop = useCallback(async () => {
    const current = latestSettingsRef.current;
    if (!current) {
      return;
    }

    await update({ alwaysOnTop: !current.alwaysOnTop });
  }, [update]);

  const setPetScale = useCallback(
    async (petScale: number) => {
      await update({ petScale });
    },
    [update],
  );

  const setMode = useCallback(
    async (currentMode: CompanionMode) => {
      await update({ currentMode });
    },
    [update],
  );

  return {
    settings,
    error: windowError ?? settingsError,
    positionStatus,
    startDrag,
    togglePositionLock,
    toggleAlwaysOnTop,
    setPetScale,
    setMode,
  };
}
