// Local copy of the provider type union to avoid a circular import back into
// `stores/setting` (which imports this module for its preProcessSnapshot).
// Keep in sync with `TranslationProviderType` in `stores/setting.ts`.
type TranslationProviderType = "openai-compatible" | "anthropic" | "gemini";

const LLM_PROVIDER_KEYS: TranslationProviderType[] = [
  "openai-compatible",
  "anthropic",
  "gemini",
];

// Current schema version for the LLM settings block. Bump this whenever the
// persisted shape of `llmConfigs` / `llmTranslationProvider` changes; add a
// matching branch in `migrateLlmSettings` to upgrade older snapshots.
export const LLM_CONFIG_VERSION = 1;

/**
 * Versioned migration for the LLM settings snapshot.
 *
 * `llmConfigVersion` is persisted alongside the config (default 0 for any
 * snapshot that predates the field — i.e. a legacy snapshot). Each branch
 * upgrades from `version` to `version + 1` and stamps the new version. Once
 * a snapshot reaches `LLM_CONFIG_VERSION` it passes through unchanged.
 *
 * Used as a `preProcessSnapshot` hook on the Settings MST model.
 */
export const migrateLlmSettings = (snapshot: any): any => {
  if (!snapshot || typeof snapshot !== "object") return snapshot;
  const version =
    typeof snapshot.llmConfigVersion === "number"
      ? snapshot.llmConfigVersion
      : 0;

  if (version < LLM_CONFIG_VERSION) {
    // v0 -> v1: collapse the legacy 5-variant `llmTranslationProvider` enum
    // and the shared `llmModel` / `llmApiKey` / `llmApiEndpoint` singletons
    // into the per-provider `llmConfigs` layout.
    const legacyProvider = snapshot.llmTranslationProvider;
    const hasLegacyFields =
      typeof snapshot.llmModel === "string" ||
      typeof snapshot.llmApiKey === "string" ||
      typeof snapshot.llmApiEndpoint === "string";

    if (!snapshot.llmConfigs || typeof snapshot.llmConfigs !== "object") {
      snapshot.llmConfigs = {};
    }
    for (const key of LLM_PROVIDER_KEYS) {
      if (
        !snapshot.llmConfigs[key] ||
        typeof snapshot.llmConfigs[key] !== "object"
      ) {
        snapshot.llmConfigs[key] = { model: "", apiKey: "", endpoint: "" };
      }
    }

    let target: TranslationProviderType | undefined;
    let resolvedEndpoint = snapshot.llmApiEndpoint;

    console.log(
      `Migrating LLM settings from legacy provider "${legacyProvider}" to new config layout...`
    );
    switch (legacyProvider) {
      case "openai":
        target = "openai-compatible";
        break;
      case "openrouter":
        target = "openai-compatible";
        if (!resolvedEndpoint || !resolvedEndpoint.trim()) {
          resolvedEndpoint = "https://openrouter.ai/api/v1/chat/completions";
        }
        break;
      case "custom":
        target = "openai-compatible";
        break;
      case "google":
        target = "gemini";
        break;
      case "anthropic":
        target = "anthropic";
        break;
      default:
        target = undefined;
        break;
    }

    if (target && hasLegacyFields) {
      const cfg = snapshot.llmConfigs[target];
      if (cfg) {
        cfg.model = snapshot.llmModel;
        cfg.apiKey = snapshot.llmApiKey;
        cfg.endpoint = resolvedEndpoint;
      }
    }

    if (legacyProvider) {
      snapshot.llmTranslationProvider = target ?? legacyProvider;
    }
    delete snapshot.llmModel;
    delete snapshot.llmApiKey;
    delete snapshot.llmApiEndpoint;
    snapshot.llmConfigVersion = LLM_CONFIG_VERSION;
  }

  return snapshot;
};
