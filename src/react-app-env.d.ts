/// <reference types="react-scripts" />

import "@types/modernizr";

declare global {
  interface Window {
    IPCallBack: (ipJson: {
      region: string;
      addr: string;
      regionNames: string;
      err: string;
    }) => void;

    isChinaMainland: Boolean;
  }
}
