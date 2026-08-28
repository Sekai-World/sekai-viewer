import Axios from "axios";
import { masterUrl } from "./urls";
import {
  IMusicCategory,
  IMusicCategoryName,
  IMusicInfo,
  ServerRegion,
} from "../types";

/**
 * Build the `categories` field for a music entry from its associated
 * `musicCategories` records (the separate `musicCategories.json` file).
 *
 * - When a record has a `startAt`, it is represented as an object
 *   `{ musicCategoryName, startAt }`, matching the existing optional shape.
 *   Note: `startAt` may legitimately be `0`, so presence is checked with
 *   `!== undefined` rather than truthiness.
 * - Otherwise it is represented as the plain category name string.
 */
function deriveCategories(records: IMusicCategory[]): IMusicCategoryName[] {
  return records.map((record) => {
    if (record.startAt !== undefined) {
      return {
        musicCategoryName: record.musicCategoryName,
        startAt: record.startAt,
      };
    }
    return record.musicCategoryName;
  });
}

/**
 * Fetch the standalone `musicCategories.json` for a region.
 *
 * This request is best-effort: the file only exists for some regions (e.g.
 * jp). Any failure (404, network error, malformed body) is swallowed and
 * resolved to `undefined` so that callers fall back to inline `categories`
 * and never throw. The error is intentionally not propagated.
 */
export async function fetchMusicCategories(
  region: ServerRegion
): Promise<IMusicCategory[] | undefined> {
  try {
    const urlBase = masterUrl["ww"][region];
    const { data } = await Axios.get<IMusicCategory[]>(
      `${urlBase}/musicCategories.json`
    );
    return data;
  } catch {
    return undefined;
  }
}

/**
 * Merge the standalone `musicCategories` association records into a list of
 * musics.
 *
 * Rules (keep old-format data intact, support the new JP split dataset):
 * 1. If a music entry already has a `categories` field, keep it as-is
 *    (old-format compatibility).
 * 2. Otherwise (new JP format where `musics.json` no longer ships
 *    `categories`), derive the categories from the association records keyed
 *    by `musicId`.
 * 3. If there are no association records for a music, fall back to `[]`.
 *
 * When `categories` is `undefined` (e.g. a region without a
 * `musicCategories.json`), musics are returned unchanged except that any
 * entry missing the `categories` field is normalized to `[]` so downstream
 * consumers never crash on undefined data.
 */
export function mergeMusicCategories(
  musics: IMusicInfo[],
  categories?: IMusicCategory[]
): IMusicInfo[] {
  const byMusic = categories?.length
    ? categories.reduce((map, category) => {
        const list = map.get(category.musicId) ?? [];
        list.push(category);
        map.set(category.musicId, list);
        return map;
      }, new Map<number, IMusicCategory[]>())
    : undefined;

  return musics.map((music) => {
    // Old-format data already carries its own categories: keep untouched.
    if (music.categories !== undefined) {
      return music;
    }

    // New JP format: derive from association records, if any.
    const records = byMusic?.get(music.id);
    if (!records || !records.length) {
      return { ...music, categories: [] };
    }

    return { ...music, categories: deriveCategories(records) };
  });
}
