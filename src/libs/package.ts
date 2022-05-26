import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Buffer } from "node:buffer";
import defaultsDeep from "lodash.defaultsdeep";

export const getChanges = () => {
  try {
    const file = readFileSync(join(__dirname, "..", "newData.json"), "utf-8");
    return JSON.parse(file);
  } catch (_) {
    throw new Error("Failed to read data file");
  }
};

export const updateFile = (file: Object, newValues: Object): Buffer =>
  // TODO: find a way to preserve attributes order
  Buffer.from(JSON.stringify(defaultsDeep(newValues, file), null, 2) + "\n");
