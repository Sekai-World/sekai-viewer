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

type SettingsSnapshotRecord = Record<string, unknown>;

function isSettingsSnapshotRecord(
  value: unknown
): value is SettingsSnapshotRecord {
  return value !== null && typeof value === "object";
}

function getSnapshotEntries(value: unknown): [string, unknown][] {
  if (
    value === null ||
    value === undefined ||
    (typeof value !== "object" &&
      typeof value !== "function" &&
      typeof value !== "string")
  ) {
    return [];
  }

  return Object.entries(value);
}

function cloneLlmConfigs(value: unknown): SettingsSnapshotRecord {
  return Object.fromEntries(
    getSnapshotEntries(value).map(([key, config]) => [
      key,
      config && typeof config === "object" ? { ...config } : config,
    ])
  );
}

function ensureProviderConfigs(
  snapshot: SettingsSnapshotRecord,
  configs: SettingsSnapshotRecord
): SettingsSnapshotRecord {
  let migratedConfigs = configs;
  if (!snapshot.llmConfigs || typeof snapshot.llmConfigs !== "object") {
    migratedConfigs = {};
  }

  for (const key of LLM_PROVIDER_KEYS) {
    if (!migratedConfigs[key] || typeof migratedConfigs[key] !== "object") {
      migratedConfigs[key] = { model: "", apiKey: "", endpoint: "" };
    }
  }

  return migratedConfigs;
}

function resolveLegacyEndpoint(
  snapshot: SettingsSnapshotRecord,
  legacyProvider: unknown
): string {
  let resolvedEndpoint =
    typeof snapshot.llmApiEndpoint === "string" ? snapshot.llmApiEndpoint : "";

  if (typeof legacyProvider === "string") {
    console.log(
      `Migrating LLM settings from legacy provider "${legacyProvider}" to new config layout...`
    );
    if (legacyProvider === "openrouter" && !resolvedEndpoint.trim()) {
      resolvedEndpoint = "https://openrouter.ai/api/v1/chat/completions";
    }
  }

  return resolvedEndpoint;
}

function applyLegacySettings(
  snapshot: SettingsSnapshotRecord,
  configs: SettingsSnapshotRecord,
  target: TranslationProviderType,
  resolvedEndpoint: string,
  hasLegacyFields: boolean
): void {
  if (!hasLegacyFields) return;

  const config = configs[target];
  if (!isSettingsSnapshotRecord(config)) return;

  if (typeof snapshot.llmModel === "string") {
    config.model = snapshot.llmModel;
  }
  if (typeof snapshot.llmApiKey === "string") {
    config.apiKey = snapshot.llmApiKey;
  }
  if (typeof snapshot.llmApiEndpoint === "string" || resolvedEndpoint) {
    config.endpoint = resolvedEndpoint;
  }
}

// v0 -> v1: collapse the legacy provider enum and shared settings into the
// per-provider `llmConfigs` layout.
function migrateLegacySnapshot<Snapshot>(
  snapshot: Snapshot & SettingsSnapshotRecord
): Snapshot {
  const legacyProvider = snapshot.llmTranslationProvider;
  let migratedLlmConfigs = cloneLlmConfigs(snapshot.llmConfigs || {});
  const migrated = { ...snapshot };
  Object.assign(migrated, { llmConfigs: migratedLlmConfigs });
  const hasLegacyFields =
    typeof snapshot.llmModel === "string" ||
    typeof snapshot.llmApiKey === "string" ||
    typeof snapshot.llmApiEndpoint === "string";

  migratedLlmConfigs = ensureProviderConfigs(snapshot, migratedLlmConfigs);
  Object.assign(migrated, { llmConfigs: migratedLlmConfigs });

  const target = getMigratedProvider(legacyProvider);
  const resolvedEndpoint = resolveLegacyEndpoint(snapshot, legacyProvider);
  applyLegacySettings(
    snapshot,
    migratedLlmConfigs,
    target,
    resolvedEndpoint,
    hasLegacyFields
  );

  if (typeof legacyProvider === "string") {
    Object.assign(migrated, { llmTranslationProvider: target });
  }
  Reflect.deleteProperty(migrated, "llmModel");
  Reflect.deleteProperty(migrated, "llmApiKey");
  Reflect.deleteProperty(migrated, "llmApiEndpoint");
  Object.assign(migrated, { llmConfigVersion: LLM_CONFIG_VERSION });
  return migrated;
}

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
export const migrateLlmSettings = <Snapshot>(snapshot: Snapshot): Snapshot => {
  if (!isSettingsSnapshotRecord(snapshot)) return snapshot;
  const version =
    typeof snapshot.llmConfigVersion === "number"
      ? snapshot.llmConfigVersion
      : 0;

  if (version < LLM_CONFIG_VERSION) {
    return migrateLegacySnapshot(snapshot);
  }

  return snapshot;
};
