import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import AreYouSureScreen from "./screens/AreYouSureScreen";
import SettingsScreen from "./screens/SettingsScreen";
import StatsScreen from "./screens/StatsScreen";
import {
  getPromiseName,
  getSobrietyStartISO,
  recordChangedMind,
  recordRelapse,
  setPromiseName as persistPromiseName,
} from "./lib/prefs";

type Screen = "home" | "areYouSure" | "stats" | "settings";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [promiseName, setPromiseName] = useState(getPromiseName);
  const [startISO, setStartISO] = useState(getSobrietyStartISO);

  const savePromiseName = (name: string) => {
    persistPromiseName(name);
    setPromiseName(getPromiseName());
  };

  const confirmRelapse = () => {
    setStartISO(recordRelapse());
    setScreen("home");
  };

  const changedMind = () => {
    recordChangedMind();
    setScreen("home");
  };

  return (
    <div className="app">
      {screen === "home" && (
        <HomeScreen
          startISO={startISO}
          onAboutToUse={() => setScreen("areYouSure")}
          onOpenStats={() => setScreen("stats")}
          onOpenSettings={() => setScreen("settings")}
        />
      )}

      {screen === "areYouSure" && (
        <AreYouSureScreen
          promiseName={promiseName}
          onGoAhead={confirmRelapse}
          onChangedMind={changedMind}
        />
      )}

      {screen === "stats" && <StatsScreen onBack={() => setScreen("home")} />}

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
