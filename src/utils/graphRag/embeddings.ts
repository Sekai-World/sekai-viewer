/**
 * Embedding utilities using Transformers.js
 */

import { pipeline, FeatureExtractionPipeline } from "@huggingface/transformers";

export type EmbeddingProvider = "transformers";

export interface EmbeddingConfig {
  provider: EmbeddingProvider;
  model: string;
}

// Popular embedding models for the selector
export const EMBEDDING_MODELS = {
  transformers: [
    {
      id: "Supabase/gte-small",
      name: "GTE-Small (Supabase)",
      dims: 384,
      speed: "fast",
    },
    {
      id: "Xenova/all-MiniLM-L6-v2",
      name: "MiniLM-L6 v2",
      dims: 384,
      speed: "fast",
    },
    {
      id: "Xenova/bge-small-en-v1.5",
      name: "BGE-Small EN v1.5",
      dims: 384,
      speed: "fast",
    },
    {
      id: "Xenova/bge-base-en-v1.5",
      name: "BGE-Base EN v1.5",
      dims: 768,
      speed: "medium",
    },
    {
      id: "Xenova/all-mpnet-base-v2",
      name: "MPNet Base v2",
      dims: 768,
      speed: "medium",
    },
    {
      id: "mixedbread-ai/mxbai-embed-large-v1",
      name: "Mixedbread Embed Large v1",
      dims: 1024,
      speed: "slow",
    },
    {
      id: "jinaai/jina-clip-v2",
      name: "Jina CLIP v2",
      dims: 1024,
      speed: "slow",
    },
  ],
};

class EmbeddingService {
  private extractor: FeatureExtractionPipeline | null = null;
  private initPromise: Promise<void> | null = null;
  private currentConfig: EmbeddingConfig = {
    provider: "transformers",
    model: "Supabase/gte-small",
  };

  /**
   * Initialize or reinitialize with new config
   * If model changes, clears the cache and reinitializes
   */
  async init(config?: EmbeddingConfig): Promise<void> {
    // If config provided and different from current, reset
    if (config) {
      const configChanged = config.model !== this.currentConfig.model;

      if (configChanged) {
        await this.clearCache();
        this.currentConfig = config;
      }
    }

    if (this.extractor) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        this.extractor = await pipeline(
          "feature-extraction",
          this.currentConfig.model,
          {
            device: "webgpu",
          }
        );
      } catch (webgpuError) {
        console.warn(
          "WebGPU not available, falling back to WASM:",
          webgpuError
        );
        this.extractor = await pipeline(
          "feature-extraction",
          this.currentConfig.model,
          {
            device: "wasm",
          }
        );
      }
    })();

    return this.initPromise;
  }

  /**
   * Clear the embedding cache when model changes
   */
  async clearCache(): Promise<void> {
    this.extractor = null;
    this.initPromise = null;
  }

  /**
   * Get current model configuration
   */
  getCurrentConfig(): EmbeddingConfig {
    return { ...this.currentConfig };
  }

  async embed(text: string): Promise<Float32Array> {
    await this.init();

    if (!this.extractor) {
      throw new Error("Embedding service not initialized");
    }

    const output = await this.extractor(text, {
      pooling: "mean",
      normalize: true,
    });

    return new Float32Array(output.data as unknown as ArrayLike<number>);
  }

  async embedBatch(texts: string[]): Promise<Float32Array[]> {
    await this.init();

    if (!this.extractor) {
      throw new Error("Embedding service not initialized");
    }

    const output = await this.extractor(texts, {
      pooling: "mean",
      normalize: true,
    });

    // Convert to array of Float32Array
    const embeddings: Float32Array[] = [];
    const dims = output.dims[1]; // embedding dimension

    const data = output.data as unknown as ArrayLike<number>;
    for (let i = 0; i < texts.length; i++) {
      const start = i * dims;
      const end = start + dims;
      embeddings.push(
        new Float32Array(Array.prototype.slice.call(data, start, end))
      );
    }

    return embeddings;
  }

  /**
   * Compute cosine similarity between two embeddings
   */
  cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) {
      throw new Error("Embeddings must have same dimension");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Find the most similar embedding from a list
   */
  findMostSimilar(
    query: Float32Array,
    candidates: Array<{ embedding: Float32Array; id: string }>
  ): { id: string; similarity: number } | null {
    if (candidates.length === 0) return null;

    let maxSimilarity = -1;
    let bestId = candidates[0].id;

    for (const candidate of candidates) {
      const similarity = this.cosineSimilarity(query, candidate.embedding);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestId = candidate.id;
      }
    }

    return { id: bestId, similarity: maxSimilarity };
  }

  /**
   * Rank candidates by similarity to query
   */
  rankBySimilarity(
    query: Float32Array,
    candidates: Array<{ embedding: Float32Array; id: string }>
  ): Array<{ id: string; similarity: number }> {
    return candidates
      .map((candidate) => ({
        id: candidate.id,
        similarity: this.cosineSimilarity(query, candidate.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity);
  }
}

// Singleton instance
export const embeddingService = new EmbeddingService();
