import "@types/modernizr";

declare global {
  interface Window {
    isChinaMainland: boolean;
    webkitAudioContext: AudioContext;
  }
}
