/**
 * Global translation cache shared across all translation service instances
 */
const globalTranslationCache: Map<string, string> = new Map();

/**
 * Translation cache management service
 * Handles storing, retrieving, and clearing cached translations by key
 */
export class TranslationCache {
  /**
   * Store translation in cache by string key
   */
  static storeTranslationByKey(cacheKey: string, translation: string): void {
    globalTranslationCache.set(cacheKey, translation);
  }

  /**
   * Retrieve translation from cache by string key
   */
  static getTranslationByKey(cacheKey: string): string | null {
    return globalTranslationCache.get(cacheKey) || null;
  }

  /**
   * Clear the entire translation cache
   */
  static clearCache(): void {
    globalTranslationCache.clear();
  }
}
