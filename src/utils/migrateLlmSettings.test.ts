import { describe, expect, it, vi } from "vitest";
import { LLM_CONFIG_VERSION, migrateLlmSettings } from "./migrateLlmSettings";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

describe("migrateLlmSettings", () => {
  it("migrates legacy OpenRouter values and preserves unrelated config data", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const snapshot = {
      enableLlmTranslation: true,
      llmTranslationProvider: "openrouter",
      llmModel: "legacy-model",
      llmApiKey: "legacy-key",
      llmApiEndpoint: "",
      llmConfigs: {
        anthropic: {
          model: "saved-model",
          apiKey: "saved-key",
          endpoint: "saved-endpoint",
          customOption: "preserved",
        },
      },
      unrelatedSetting: { enabled: true },
    };

    const migrated = migrateLlmSettings(snapshot);

    expect(migrated).toEqual({
      enableLlmTranslation: true,
      llmTranslationProvider: "openai-compatible",
      llmConfigVersion: LLM_CONFIG_VERSION,
      llmConfigs: {
        "openai-compatible": {
          model: "legacy-model",
          apiKey: "legacy-key",
          endpoint: "https://openrouter.ai/api/v1/chat/completions",
        },
        anthropic: {
          model: "saved-model",
          apiKey: "saved-key",
          endpoint: "saved-endpoint",
          customOption: "preserved",
        },
        gemini: { model: "", apiKey: "", endpoint: "" },
      },
      unrelatedSetting: { enabled: true },
    });
    expect(migrated).not.toBe(snapshot);
    expect(migrated.llmConfigs.anthropic).not.toBe(
      snapshot.llmConfigs.anthropic
    );
    expect(snapshot.llmConfigs.anthropic).toEqual({
      model: "saved-model",
      apiKey: "saved-key",
      endpoint: "saved-endpoint",
      customOption: "preserved",
    });
    expect(log).toHaveBeenCalledOnce();
    log.mockRestore();
  });

  it("maps the legacy Google provider and replaces malformed provider buckets", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    const migrated = migrateLlmSettings({
      llmTranslationProvider: "google",
      llmModel: "legacy-gemini-model",
      llmConfigs: {
        "openai-compatible": null,
        anthropic: "malformed",
      },
    });

    expect(migrated).toEqual({
      llmTranslationProvider: "gemini",
      llmConfigVersion: LLM_CONFIG_VERSION,
      llmConfigs: {
        "openai-compatible": { model: "", apiKey: "", endpoint: "" },
        anthropic: { model: "", apiKey: "", endpoint: "" },
        gemini: {
          model: "legacy-gemini-model",
          apiKey: "",
          endpoint: "",
        },
      },
    });
    expect(log).toHaveBeenCalledOnce();
    log.mockRestore();
  });

  it("preserves provider configs when no legacy shared values are present", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const savedConfig = {
      model: "saved-model",
      apiKey: "saved-key",
      endpoint: "saved-endpoint",
    };
    const snapshot = {
      llmTranslationProvider: "anthropic",
      llmConfigs: { anthropic: savedConfig },
    };

    const migrated = migrateLlmSettings(snapshot);

    expect(migrated.llmConfigs.anthropic).toEqual(savedConfig);
    expect(migrated.llmConfigs.anthropic).not.toBe(savedConfig);
    expect(snapshot.llmConfigs.anthropic).toBe(savedConfig);
    expect(migrated).toHaveProperty("llmConfigVersion", LLM_CONFIG_VERSION);
    expect(log).toHaveBeenCalledOnce();
    log.mockRestore();
  });

  it("returns current-version snapshots and non-object inputs unchanged", () => {
    const snapshot = { llmConfigVersion: LLM_CONFIG_VERSION };
    const invalidSnapshot: unknown = null;

    expect(migrateLlmSettings(snapshot)).toBe(snapshot);
    expect(migrateLlmSettings(invalidSnapshot)).toBeNull();
  });

  it("preserves an own __proto__ property while migrating legacy settings", () => {
    const serializedSnapshot =
      '{"__proto__":{"marker":"own-value"},"llmTranslationProvider":"google","llmModel":"legacy-gemini-model"}';
    const parsedSnapshot: unknown = JSON.parse(serializedSnapshot);
    if (!isRecord(parsedSnapshot)) {
      throw new Error("Expected a parsed settings snapshot object");
    }

    const snapshot = parsedSnapshot;
    const originalProtoValue = Object.getOwnPropertyDescriptor(
      snapshot,
      "__proto__"
    )?.value;
    const migrated = migrateLlmSettings(snapshot);

    expect(Object.getPrototypeOf(migrated)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(migrated, "__proto__")).toBe(
      true
    );
    expect(
      Object.getOwnPropertyDescriptor(migrated, "__proto__")?.value
    ).toEqual({ marker: "own-value" });
    expect("marker" in migrated).toBe(false);
    expect(migrated.llmTranslationProvider).toBe("gemini");
    expect(migrated.llmConfigs).toMatchObject({
      gemini: { model: "legacy-gemini-model" },
    });
    expect(Object.getOwnPropertyDescriptor(snapshot, "__proto__")?.value).toBe(
      originalProtoValue
    );
    expect(JSON.stringify(snapshot)).toBe(serializedSnapshot);
  });
});
