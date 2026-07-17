import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { log } from "../Live2DPlayer/log";
import JSZip from "jszip";

export const enum FileType {
  WEBP = "webp",
  GIF = "gif",
  PNG_SEQ = "png_seq",
  MOV = "mov",
  WEBM = "webm",
  MP4 = "mp4",
}

export const FileTypeInfo = {
  [FileType.WEBP]: {
    ext: ".webp",
    mime: "image/webp",
  },
  [FileType.GIF]: {
    ext: ".gif",
    mime: "image/gif",
  },
  [FileType.PNG_SEQ]: {
    ext: ".zip",
    mime: "application/zip",
  },
  [FileType.MOV]: {
    ext: ".mov",
    mime: "video/quicktime",
  },
  [FileType.WEBM]: {
    ext: ".webm",
    mime: "video/VP8",
  },
  [FileType.MP4]: {
    ext: ".mp4",
    mime: "video/mp4",
  },
} as const;

export class SekaiFFmpeg {
  INPUT_DIR = "/sekai_in";
  OUTPUT_DIR = "/sekai_out";
  ffmpeg = new FFmpeg();

  loadFFmpeg = async () => {
    const baseURL =
      "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
    this.ffmpeg.on("log", ({ message }) => {
      log.log("SekaiFFmpeg", message);
    });
    this.ffmpeg.on("progress", ({ progress, time }) => {
      log.log("SekaiFFmpeg", `progress: ${progress}, time: ${time}`);
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    log.log("SekaiFFmpeg", "loading wasm lib...");
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    log.log("SekaiFFmpeg", "wasm lib loaded.");
  };

  initFS = async () => {
    log.log("SekaiFFmpeg", "init file system.");
    for (const path of [this.INPUT_DIR, this.OUTPUT_DIR]) {
      // create dir
      try {
        await this.ffmpeg.createDir(path); //raise error when dir exist
      } catch {} // ignore error
      // clear dir
      const fileList = await this.ffmpeg.listDir(path);
      for (const file of fileList) {
        if (file.name.startsWith(".")) continue;
        await this.ffmpeg.deleteFile(`${path}/${file.name}`);
      }
    }
    return;
  };

  saveImage = async (name: string, dataBlob: Blob) => {
    log.log("SekaiFFmpeg", `save file: ${name}`);
    const data = await fetchFile(dataBlob);
    await this.ffmpeg.writeFile(`${this.INPUT_DIR}/${name}`, data);
    return;
  };

  merge = async (targetType: FileType, framerate: number) => {
    switch (targetType) {
      case FileType.WEBP:
        return await this.toWebp(framerate);
      case FileType.PNG_SEQ:
        return await this.toPngSeq();
      case FileType.GIF:
        return await this.toGif(framerate);
      case FileType.WEBM:
        return await this.toWebm(framerate);
      case FileType.MP4:
        return await this.toMp4(framerate);
    }
  };

  toWebp = async (framerate: number) => {
    log.log("SekaiFFmpeg", `start merge to webp.`);
    const output = `${this.OUTPUT_DIR}/output.webp`;
    await this.ffmpeg.exec([
      "-framerate",
      framerate.toString(),
      "-i",
      `${this.INPUT_DIR}/%04d.png`,
      "-c:v",
      "libwebp_anim",
      "-lossless",
      "0",
      "-loop",
      "0",
      output,
    ]);
    const result = await this.ffmpeg.readFile(output);
    const blob = new Blob([result], { type: FileTypeInfo[FileType.WEBP].mime });
    log.log("SekaiFFmpeg", `finish merge to webp.`);
    return blob;
  };

  toGif = async (framerate: number) => {
    log.log("SekaiFFmpeg", `start merge to gif.`);
    const output = `${this.OUTPUT_DIR}/output.gif`;
    await this.ffmpeg.exec([
      "-framerate",
      framerate.toString(),
      "-i",
      `${this.INPUT_DIR}/%04d.png`,
      "-vf",
      "split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
      "-loop",
      "0",
      output,
    ]);
    const result = await this.ffmpeg.readFile(output);
    const blob = new Blob([result], { type: FileTypeInfo[FileType.GIF].mime });
    log.log("SekaiFFmpeg", `finish merge to gif.`);
    return blob;
  };

  toPngSeq = async () => {
    log.log("SekaiFFmpeg", `start merge to png sequence.`);
    const fileList = await this.ffmpeg.listDir(this.INPUT_DIR);

    // save to zip
    const zip = new JSZip();
    for (const file of fileList) {
      if (file.name.startsWith(".")) continue;
      const result = await this.ffmpeg.readFile(
        `${this.INPUT_DIR}/${file.name}`
      );
      const blob = new Blob([result], { type: "image/png" });
      zip.file(file.name, blob);
    }
    log.log("SekaiFFmpeg", `finish merge to png sequence.`);
    return await zip.generateAsync({ type: "blob" });
  };

  toWebm = async (framerate: number) => {
    log.log("SekaiFFmpeg", `start merge to webm.`);
    const output = `${this.OUTPUT_DIR}/output.webm`;
    await this.ffmpeg.exec([
      "-framerate",
      framerate.toString(),
      "-i",
      `${this.INPUT_DIR}/%04d.png`,
      "-c:v",
      "libvpx-vp9",
      "-pix_fmt",
      "yuva420p",
      output,
    ]);
    const result = await this.ffmpeg.readFile(output);
    const blob = new Blob([result], { type: FileTypeInfo[FileType.WEBM].mime });
    log.log("SekaiFFmpeg", `finish merge to webm.`);
    return blob;
  };

  toMp4 = async (framerate: number) => {
    log.log("SekaiFFmpeg", `start merge to mp4.`);
    const output = `${this.OUTPUT_DIR}/output.mp4`;
    await this.ffmpeg.exec([
      "-framerate",
      framerate.toString(),
      "-i",
      `${this.INPUT_DIR}/%04d.png`,
      "-c:v",
      "libx264",
      output,
    ]);
    const result = await this.ffmpeg.readFile(output);
    const blob = new Blob([result], { type: FileTypeInfo[FileType.MP4].mime });
    log.log("SekaiFFmpeg", `finish merge to mp4.`);
    return blob;
  };
}
