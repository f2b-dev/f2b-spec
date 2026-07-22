/**
 * 校验 errors/codes.json 与 src/errors.ts 的 ErrorCode / statusForCode 一致。
 * 用法：node scripts/check-error-codes.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const codes = JSON.parse(
  readFileSync(join(root, "errors/codes.json"), "utf8"),
);

// 通过 tsx/ts-node 不可用时：用动态 import 源文件（package exports 指向 .ts）
// 本仓 dev 依赖 typescript 但不编译；改为解析 errors.ts 中的字面量。
const errorsSrc = readFileSync(join(root, "src/errors.ts"), "utf8");

const codeBlock = errorsSrc.match(
  /export const ErrorCode = \{([\s\S]*?)\} as const/,
);
if (!codeBlock) {
  console.error("cannot parse ErrorCode object from src/errors.ts");
  process.exit(1);
}
const tsCodes = [
  ...codeBlock[1].matchAll(/^\s*([A-Z0-9_]+):\s*"([A-Z0-9_]+)"/gm),
].map((m) => m[2]);
const tsSet = new Set(tsCodes);
const jsonKeys = Object.keys(codes);

const missingInJson = tsCodes.filter((c) => !(c in codes));
const extraInJson = jsonKeys.filter((c) => !tsSet.has(c));
const keyMismatch = tsCodes.filter((c) => c in codes === false);

// statusForCode 分支中的 http 应与 json 一致
const statusMap = {};
const switchBody = errorsSrc.match(
  /export function statusForCode[\s\S]*?switch \(code\) \{([\s\S]*?)\n  \}/,
);
if (!switchBody) {
  console.error("cannot parse statusForCode");
  process.exit(1);
}
// 粗解析 case ErrorCode.X: return N
const cases = [
  ...switchBody[1].matchAll(
    /case ErrorCode\.([A-Z0-9_]+):\s*(?:case ErrorCode\.([A-Z0-9_]+):\s*)*(?:case ErrorCode\.([A-Z0-9_]+):\s*)*return (\d+)/g,
  ),
];
// 更稳：逐 case 收集直到 return
let httpMismatch = [];
{
  const lines = switchBody[1].split("\n");
  let pending = [];
  for (const line of lines) {
    const cm = line.match(/case ErrorCode\.([A-Z0-9_]+):/);
    if (cm) pending.push(cm[1]);
    const rm = line.match(/return (\d+)/);
    if (rm && pending.length) {
      const http = Number(rm[1]);
      for (const name of pending) {
        if (codes[name] && codes[name].http !== http) {
          httpMismatch.push({ name, json: codes[name].http, ts: http });
        }
        if (!codes[name] && name !== undefined) {
          // already covered by missingInJson
        }
      }
      pending = [];
    }
    if (line.includes("default:")) pending = [];
  }
}

let failed = false;
if (missingInJson.length) {
  console.error("codes.json missing:", missingInJson.join(", "));
  failed = true;
}
if (extraInJson.length) {
  console.error("codes.json extra:", extraInJson.join(", "));
  failed = true;
}
if (httpMismatch.length) {
  console.error("http status mismatch:", JSON.stringify(httpMismatch));
  failed = true;
}

// 禁止文档里常见的错误别名出现在 codes.json
for (const bad of ["VALIDATION", "CONFLICT", "CAPACITY_FULL"]) {
  if (bad in codes || tsSet.has(bad)) {
    console.error("forbidden alias present:", bad);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log(
  `CHECK_ERROR_CODES_OK count=${tsCodes.length} codes=${tsCodes.join(",")}`,
);
