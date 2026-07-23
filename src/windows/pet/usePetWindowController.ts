import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { UnlistenFn } from "@tauri-apps/api/event";
import {
  getCurrentWindow,
  PhysicalPosition,
} from "@tauri-apps/api/window";
import { useAppSettings } from "../../state/useAppSettings";

const POSITION_SAVE_DELAY_MS = 220;
const petWindow = getCurrentWindow();

export function usePetWindowController() {
  const { settings, error: settingsError, update } = useAppSettings();
  const [windowError, setWindowError] = useState<string>();
  const [positionStatus, setPositionStatus] = useState<
    "idle" | "dragging" | "pending" | "saved"
  >("idle");
  const latestSettingsRef = useRef(settings);
  const initializedRef = useRef(false);
  const ready = settings !== undefined;

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
    let saveTimer: number | undefined;
    let lastPosition: PhysicalPosition | undefined;

    async function initializeWindow() {
      const initialSettings = latestSettingsRef.current;
      if (!initialSettings) {
        return;
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
      }

      if (!active) {
        return;
      }

      unlistenMoved = await petWindow.onMoved(({ payload }) => {
        const currentSettings = latestSettingsRef.current;
        if (!currentSettings?.rememberPosition) {
          return;
        }

        lastPosition = payload;
        setPositionStatus("pending");

        if (saveTimer !== undefined) {
          window.clearTimeout(saveTimer);
        }

        saveTimer = window.setTimeout(() => {
          const position = lastPosition;
          if (!position) {
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
    }

    void initializeWindow().catch((caught) => {
      if (active) {
        setWindowError(String(caught));
      }
    });

    return () => {
      active = false;
      unlistenMoved?.();
      if (saveTimer !== undefined) {
        window.clearTimeout(saveTimer);
      }
    };
  }, [ready, update]);

  const startDrag = useCallback(
    async (event: ReactMouseEvent<HTMLElement>) => {
      if (
        event.button !== 0 ||
        latestSettingsRef.current?.positionLocked
      ) {
        return;
      }

      try {
        setPositionStatus("dragging");
        await petWindow.startDragging();
        setWindowError(undefined);
        window.setTimeout(() => {
          setPositionStatus((current) =>
            current === "dragging" ? "idle" : current,
          );
        }, 900);
      } catch (caught) {
        setPositionStatus("idle");
        setWindowError(String(caught));
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

  return {
    settings,
    error: windowError ?? settingsError,
    positionStatus,
    startDrag,
    togglePositionLock,
  };
}
