import { readFile } from "node:fs/promises";
import { env } from "node:process";
import { fileURLToPath } from "node:url";
import * as ts from "typescript";
import { beforeAll, describe, expect, it } from "vitest";

const REGION_CONSTANT_NAMES = [
  "KR_EXCLUSIVE_IDS",
  "EN_EXCLUSIVE_IDS",
  "TW_EXCLUSIVE_IDS",
  "CN_EXCLUSIVE_IDS",
] as const;

type RegionConstantName = (typeof REGION_CONSTANT_NAMES)[number];

const EXPECTED_EXCLUSIVE_IDS: Record<RegionConstantName, readonly number[]> = {
  KR_EXCLUSIVE_IDS: [
    10001, 10002, 371, 387, 419, 420, 453, 459, 464, 10003, 10004, 10005, 10006,
    10007, 10008, 694, 10009, 10010, 11013,
  ],
  EN_EXCLUSIVE_IDS: [
    371, 387, 419, 420, 445, 453, 459, 464, 479, 502, 514, 528, 535, 552, 563,
    568, 598, 599, 602, 609, 640, 657, 673, 690, 694, 701, 725, 736, 762, 786,
    787, 807,
  ],
  TW_EXCLUSIVE_IDS: [371, 387, 419, 420, 453, 459, 464, 694, 11012],
  CN_EXCLUSIVE_IDS: [
    76,
    276,
    371,
    376,
    387,
    419,
    420,
    453,
    464,
    476,
    576,
    798,
    799,
    800,
    801,
    10001,
    10002,
    ...Array.from({ length: 19 }, (_, index) => 11001 + index),
  ],
};

function findRegionIds(
  sourceFile: ts.SourceFile,
  constantName: RegionConstantName
): number[] {
  const declarations = sourceFile.statements.flatMap((statement) => {
    if (
      !ts.isVariableStatement(statement) ||
      (statement.declarationList.flags & ts.NodeFlags.Const) === 0
    ) {
      return [];
    }

    return statement.declarationList.declarations.filter(
      (declaration) =>
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === constantName
    );
  });

  if (declarations.length !== 1) {
    throw new Error(
      `Expected exactly one top-level const named ${constantName}; found ${declarations.length}.`
    );
  }

  const initializer = declarations[0].initializer;
  if (!initializer || !ts.isArrayLiteralExpression(initializer)) {
    throw new Error(
      `Expected ${constantName} to be initialized by a numeric array literal.`
    );
  }

  return initializer.elements.map((element, index) => {
    if (!ts.isNumericLiteral(element)) {
      throw new Error(
        `Expected ${constantName}[${index}] to be a numeric literal; found ${element.getText(sourceFile)}.`
      );
    }

    const value = Number(element.text);
    if (!Number.isSafeInteger(value)) {
      throw new Error(
        `Expected ${constantName}[${index}] to be a safe integer; found ${element.getText(sourceFile)}.`
      );
    }
    return value;
  });
}

describe("music exclusive ID lists", () => {
  let regionIds: Record<RegionConstantName, number[]>;

  beforeAll(async () => {
    // CI reads the production module beside this test. The optional path is only
    // for running the same AST checks against an external diagnostic snapshot.
    const sourcePath =
      env.EXCLUSIVE_MUSIC_IDS_SOURCE ??
      fileURLToPath(new URL("./MusicDetail.tsx", import.meta.url));
    const sourceText = await readFile(sourcePath, "utf8");
    const sourceFile = ts.createSourceFile(
      sourcePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );

    const diagnostic = ts.transpileModule(sourceText, {
      fileName: sourcePath,
      compilerOptions: {
        target: ts.ScriptTarget.Latest,
        jsx: ts.JsxEmit.React,
      },
      reportDiagnostics: true,
    }).diagnostics?.[0];
    if (diagnostic) {
      throw new Error(
        `Could not parse ${sourcePath}: ${
          diagnostic.messageText &&
          ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")
        }`
      );
    }

    regionIds = {
      KR_EXCLUSIVE_IDS: findRegionIds(sourceFile, "KR_EXCLUSIVE_IDS"),
      EN_EXCLUSIVE_IDS: findRegionIds(sourceFile, "EN_EXCLUSIVE_IDS"),
      TW_EXCLUSIVE_IDS: findRegionIds(sourceFile, "TW_EXCLUSIVE_IDS"),
      CN_EXCLUSIVE_IDS: findRegionIds(sourceFile, "CN_EXCLUSIVE_IDS"),
    };
  });

  it.each(REGION_CONSTANT_NAMES)(
    "%s matches its complete expected ordered dataset and contains no duplicates",
    (constantName) => {
      const actualIds = regionIds[constantName];
      expect(actualIds).toEqual(EXPECTED_EXCLUSIVE_IDS[constantName]);
      expect(new Set(actualIds).size).toBe(actualIds.length);
    }
  );

  it("does not classify CN music 803 as exclusive", () => {
    expect(regionIds.CN_EXCLUSIVE_IDS).not.toContain(803);
  });
});
