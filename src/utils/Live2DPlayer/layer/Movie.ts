import { Texture, Sprite, BaseTexture } from "pixi.js";
import type { ILive2DLayerData } from "../types.d";
import BaseLayer from "./BaseLayer";
import { log } from "../log";

export default class Movie extends BaseLayer {
  structure: {
    movie?: Sprite;
  };
  private videoElement?: HTMLVideoElement;

  constructor(data: ILive2DLayerData) {
    super(data);
    this.structure = {};
  }

  async draw(videoElement: HTMLVideoElement) {
    // Clear any existing movie
    this.clear();

    // Ensure video is ready for playback
    if (videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        const onCanPlay = () => {
          videoElement.removeEventListener("canplay", onCanPlay);
          videoElement.removeEventListener("error", onError);
          resolve();
        };
        const onError = () => {
          videoElement.removeEventListener("canplay", onCanPlay);
          videoElement.removeEventListener("error", onError);
          reject(new Error("Video failed to load"));
        };
        videoElement.addEventListener("canplay", onCanPlay);
        videoElement.addEventListener("error", onError);
      });
    }

    // Create PIXI texture from video element
    const baseTexture = BaseTexture.from(videoElement);
    const texture = new Texture(baseTexture);
    const movieSprite = new Sprite(texture);

    // Store references
    this.structure.movie = movieSprite;
    this.videoElement = videoElement;

    // Add to container
    this.root.addChild(movieSprite);
    this.init = true;
    this.set_style();

    // Reset video to beginning and play
    videoElement.currentTime = 0;
    const playPromise = videoElement.play();

    if (playPromise !== undefined) {
      await playPromise;
    }
  }

  clear() {
    try {
      const container = this.root;

      // Pause video if playing
      if (this.videoElement) {
        this.videoElement.pause();
        this.videoElement = undefined;
      }

      // Destroy PIXI resources if they exist
      if (this.structure.movie) {
        // Safely destroy texture resources
        if (this.structure.movie.texture) {
          this.structure.movie.texture.destroy(true);
        }

        // Clear references
        this.structure.movie = undefined;
      }

      // Remove all children from container
      if (container && container.removeChildren) {
        container.removeChildren();
      }

      this.init = false;
    } catch (error) {
      log.warn("Live2DController", "Movie layer: Error during cleanup:", error);
      this.init = false;
    }
  }

  set_style(stage_size?: [number, number]): void {
    this.stage_size = stage_size ? stage_size : this.stage_size;
    if (this.init && this.structure.movie && this.videoElement) {
      const movieSprite = this.structure.movie;
      const videoElement = this.videoElement;

      // Calculate scale to fill screen while maintaining aspect ratio
      const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
      const stageAspect = this.stage_size[0] / this.stage_size[1];

      let scale: number;
      if (videoAspect > stageAspect) {
        // Video is wider than stage - scale to fit height
        scale = this.stage_size[1] / videoElement.videoHeight;
      } else {
        // Video is taller than stage - scale to fit width
        scale = this.stage_size[0] / videoElement.videoWidth;
      }

      movieSprite.scale.set(scale);
      movieSprite.anchor.set(0.5);
      movieSprite.x = this.stage_size[0] / 2;
      movieSprite.y = this.stage_size[1] / 2;
    }
  }

  async waitForCompletion(): Promise<void> {
    if (!this.videoElement) {
      return;
    }

    const videoElement = this.videoElement;

    // Wait for the video to finish playing
    await new Promise<void>((resolve) => {
      const onEnded = () => {
        // Only remove the listener if the video element hasn't been cleared
        if (this.videoElement === videoElement) {
          videoElement.removeEventListener("ended", onEnded);
        }
        resolve();
      };
      videoElement.addEventListener("ended", onEnded);
    });
  }

  destroy(): void {
    this.clear();
    super.destroy();
  }
}
