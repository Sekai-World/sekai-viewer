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

const getMigratedProvider = (
  legacyProvider: unknown
): TranslationProviderType => {
  switch (legacyProvider) {
    case "anthropic":
      return "anthropic";
    case "gemini":
      return "gemini";
    case "google":
      return "gemini";
    default:
      return "openai-compatible";
  }
};

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
    const migrated = {
      ...snapshot,
      llmConfigs: Object.fromEntries(
        Object.entries(snapshot.llmConfigs || {}).map(([key, value]) => [
          key,
          value && typeof value === "object" ? { ...(value as object) } : value,
        ])
      ),
    };
    const hasLegacyFields =
      typeof snapshot.llmModel === "string" ||
      typeof snapshot.llmApiKey === "string" ||
      typeof snapshot.llmApiEndpoint === "string";

    if (!snapshot.llmConfigs || typeof snapshot.llmConfigs !== "object") {
      migrated.llmConfigs = {};
    }
    for (const key of LLM_PROVIDER_KEYS) {
      if (
        !migrated.llmConfigs[key] ||
        typeof migrated.llmConfigs[key] !== "object"
      ) {
        migrated.llmConfigs[key] = { model: "", apiKey: "", endpoint: "" };
      }
    }

    const target = getMigratedProvider(legacyProvider);
    let resolvedEndpoint =
      typeof snapshot.llmApiEndpoint === "string"
        ? snapshot.llmApiEndpoint
        : "";

    if (typeof legacyProvider === "string") {
      console.log(
        `Migrating LLM settings from legacy provider "${legacyProvider}" to new config layout...`
      );
      if (legacyProvider === "openrouter" && !resolvedEndpoint.trim()) {
        resolvedEndpoint = "https://openrouter.ai/api/v1/chat/completions";
      }
    }

    if (hasLegacyFields) {
      const cfg = migrated.llmConfigs[target];
      if (cfg) {
        if (typeof snapshot.llmModel === "string")
          cfg.model = snapshot.llmModel;
        if (typeof snapshot.llmApiKey === "string")
          cfg.apiKey = snapshot.llmApiKey;
        if (typeof snapshot.llmApiEndpoint === "string" || resolvedEndpoint)
          cfg.endpoint = resolvedEndpoint;
      }
    }

    if (typeof legacyProvider === "string") {
      migrated.llmTranslationProvider = target;
    }
    delete migrated.llmModel;
    delete migrated.llmApiKey;
    delete migrated.llmApiEndpoint;
    migrated.llmConfigVersion = LLM_CONFIG_VERSION;
    return migrated;
  }

  return snapshot;
};
