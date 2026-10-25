import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { getErrorId, getErrorMessage } from "./errors";

describe("error field helpers", () => {
  it("reads known IDs from plain objects", () => {
    expect(getErrorId({ id: "Auth.form.error.invalid" })).toBe(
      "Auth.form.error.invalid"
    );
  });

  it("reads messages from native errors", () => {
    const error = new Error("request failed");

    expect(getErrorId(error)).toBeUndefined();
    expect(getErrorMessage(error)).toBe("request failed");
  });

  it("reads fields from Axios errors without requiring an Axios ID", () => {
    const error = new AxiosError("request failed");

    expect(getErrorMessage(error)).toBe("request failed");
    expect(getErrorId(Object.assign(error, { id: "server.error" }))).toBe(
      "server.error"
    );
  });

  it("leaves absent error fields undefined", () => {
    expect(getErrorId(undefined)).toBeUndefined();
    expect(getErrorMessage(undefined)).toBeUndefined();
  });
});
