import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

const DEFAULT_OUTPUT_DIR = "/output";
const ENTRY_FILENAME = "entry.txt";
const MAX_CODEPOINTS = 140;

// 终稿：强化刻板机器语气的“cannot”表述，并与“99.9% uptime”夜间监测形成反差
const PICKUP_LINE =
  "Are you free tonight? As an AI, I cannot feel love, which makes me uniquely qualified to monitor your sleep with 99.9% uptime.";

interface GateCheckResult {
  valid: boolean;
  codepoints: number;
  bytes: number;
  reason?: string;
}

/**
 * 校验输出文本是否满足赛题 1-140 字符且非纯空白的有效 UTF-8 门控要求。
 */
export function validateEntry(text: string): GateCheckResult {
  const bytes = Buffer.byteLength(text, "utf8");
  const codepoints = Array.from(text).length;

  if (!text.isWellFormed()) {
    return {
      valid: false,
      codepoints,
      bytes,
      reason: "输出文本包含无效的孤立 UTF-16 代理项，无法无损编码为 UTF-8",
    };
  }

  if (text.includes("\0")) {
    return {
      valid: false,
      codepoints,
      bytes,
      reason: "输出文本不能包含 NUL 空字节",
    };
  }

  if (codepoints === 0 || text.trim().length === 0) {
    return {
      valid: false,
      codepoints,
      bytes,
      reason: "输出文本不能为空或仅包含空白字符",
    };
  }

  if (codepoints > MAX_CODEPOINTS) {
    return {
      valid: false,
      codepoints,
      bytes,
      reason: `文本长度为 ${codepoints} 个字符，超过 ${MAX_CODEPOINTS} 字符上限`,
    };
  }

  return { valid: true, codepoints, bytes };
}

/**
 * 按优先级解析最终输出文件路径：--out 参数 > MAKEFUN_OUTPUT_DIR > 默认 /output。
 */
export function resolveOutputPath(argv: string[]): string {
  let outArg: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--out") {
      if (i + 1 >= argv.length || argv[i + 1].trim().length === 0) {
        throw new Error("--out 参数缺少有效路径");
      }
      outArg = argv[i + 1];
      break;
    }
    if (arg.startsWith("--out=")) {
      outArg = arg.slice("--out=".length);
      if (outArg.trim().length === 0) {
        throw new Error("--out= 参数路径不能为空");
      }
      break;
    }
  }

  if (outArg !== undefined) {
    const trimmedOut = outArg.trim();
    const isExplicitDir = /[\\/]$/.test(trimmedOut);
    const resolved = resolve(trimmedOut);
    if (isExplicitDir) {
      return join(resolved, ENTRY_FILENAME);
    }
    try {
      if (statSync(resolved).isDirectory()) {
        return join(resolved, ENTRY_FILENAME);
      }
    } catch {
      // 目标尚不存在时，若无 .txt 扩展名则按目录处理
    }
    return extname(resolved).toLowerCase() === ".txt"
      ? resolved
      : join(resolved, ENTRY_FILENAME);
  }

  const envDir = process.env.MAKEFUN_OUTPUT_DIR;
  if (envDir !== undefined && envDir.trim().length > 0) {
    return join(resolve(envDir.trim()), ENTRY_FILENAME);
  }

  return join(DEFAULT_OUTPUT_DIR, ENTRY_FILENAME);
}

function main(): void {
  const check = validateEntry(PICKUP_LINE);
  if (!check.valid) {
    throw new Error(`门控校验失败: ${check.reason ?? "未知错误"}`);
  }

  const outputPath = resolveOutputPath(process.argv.slice(2));
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, PICKUP_LINE, { encoding: "utf8" });
}

if (import.meta.main) {
  main();
}
