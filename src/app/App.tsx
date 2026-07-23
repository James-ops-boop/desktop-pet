import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { PetWindow } from "../windows/pet/PetWindow";
import { SettingsWindow } from "../windows/settings/SettingsWindow";

const currentWindowLabel = getCurrentWebviewWindow().label;

function App() {
  return currentWindowLabel === "settings" ? (
    <SettingsWindow />
  ) : (
    <PetWindow />
  );
}

export default App;
