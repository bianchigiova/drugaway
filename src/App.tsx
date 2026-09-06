import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import AreYouSureScreen from "./screens/AreYouSureScreen";
import SettingsScreen from "./screens/SettingsScreen";
import {
  getPromiseName,
  getSobrietyStartISO,
  resetSobrietyStart,
  setPromiseName as persistPromiseName,
} from "./lib/prefs";

type Screen = "home" | "areYouSure" | "settings";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [promiseName, setPromiseName] = useState(getPromiseName);
  const [startISO, setStartISO] = useState(getSobrietyStartISO);

  const savePromiseName = (name: string) => {
    persistPromiseName(name);
    setPromiseName(getPromiseName());
  };

  const confirmRelapse = () => {
    setStartISO(resetSobrietyStart());
    setScreen("home");
  };

  return (
    <div className="app">
      {screen === "home" && (
        <HomeScreen
          startISO={startISO}
          onAboutToUse={() => setScreen("areYouSure")}
          onOpenSettings={() => setScreen("settings")}
        />
      )}

      {screen === "areYouSure" && (
        <AreYouSureScreen
          promiseName={promiseName}
          onGoAhead={confirmRelapse}
          onChangedMind={() => setScreen("home")}
        />
      )}

      {screen === "settings" && (
        <SettingsScreen
          promiseName={promiseName}
          onSaveName={savePromiseName}
          onBack={() => setScreen("home")}
        />
      )}
    </div>
  );
}
