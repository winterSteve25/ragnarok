import "./styles.scss";
import App from "./App.svelte";
// import {Settings} from "./lib/ts/settings";
// import {Theming} from "./lib/ts/theme";
// import {invoke} from "@tauri-apps/api";

// await Theming.loadThemes();
// await Settings.load();
// await invoke("close_splashscreen");

const app = new App({
  // @ts-ignore
  target: document.getElementById("app"),
});

export default app;