/// <reference types="react-scripts" />

import "@types/modernizr";

declare global {
  interface Window {
    isChinaMainland: Boolean;
  }
}
