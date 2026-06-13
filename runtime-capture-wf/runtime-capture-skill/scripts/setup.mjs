#!/usr/bin/env node
// setup.mjs — 准备工作目录的 runtime_environment（幂等，先检查再执行）
//
// 用法: node setup.mjs <工作目录>
//
// 【自动】（仅基于工作目录，且先检查再执行，不重复）：
//   1. 工作目录下无 runtime_environment/ → 创建
//   2. 复制本 skill 需要的脚本（custom-recorder.js / package.json / parse_har.py）
//   3. 无 node_modules → 在该目录执行 npm install 初始化
//
// 【只检查·不代装】：chromium 内核——缺则打印安装命令告知用户，由用户手动安装。
//   （浏览器内核安装较重，人工执行更合适；本脚本不主动下载。）

import { existsSync, mkdirSync, copyFileSync, statSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const workdir = process.argv[2];
if (!workdir) {
  console.error('用法: node setup.mjs <工作目录>');
  process.exit(1);
}

const envDir = resolve(workdir, 'runtime_environment');
mkdirSync(envDir, { recursive: true });
console.log(`[setup] runtime_environment: ${envDir}`);

// 1. 复制执行脚本（源新于目标才覆盖，幂等）
for (const f of ['custom-recorder.js', 'package.json', 'parse_har.py']) {
  const src = join(here, f);
  const dst = join(envDir, f);
  if (!existsSync(src)) {
    console.error(`[ERROR] 缺源文件: ${src}`);
    process.exit(1);
  }
  if (!existsSync(dst) || statSync(src).mtimeMs > statSync(dst).mtimeMs) {
    copyFileSync(src, dst);
    console.log(`[copy] ${f}`);
  }
}

// 2. npm install 初始化（仅当 node_modules 缺失——先检查再执行，不重复）
if (!existsSync(join(envDir, 'node_modules'))) {
  console.log('[init] 未初始化，执行 npm install ...');
  const isWin = process.platform === 'win32';
  const r = spawnSync(isWin ? 'npm.cmd' : 'npm', ['install'], { cwd: envDir, stdio: 'inherit', shell: isWin });
  if (r.status !== 0) {
    console.error('[ERROR] npm install 失败，请检查网络/npm 源后重试');
    process.exit(1);
  }
} else {
  console.log('[skip] node_modules 已存在，跳过 npm install');
}

// 3. 只检查 chromium 内核（不代装；缺则告知用户命令）
if (chromiumInstalled()) {
  console.log('[check] chromium 内核已安装 ✓');
  console.log('\n[done] runtime_environment 就绪。');
} else {
  console.warn('\n[check] ⚠️ 未检测到 chromium 内核（本脚本不代装，请手动执行一次）：');
  console.warn(`    cd "${envDir}"`);
  console.warn('    npx playwright install chromium');
  console.warn('  安装后重新运行本脚本或直接开始录制。');
  process.exit(2);
}

function chromiumInstalled() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || defaultBrowsersPath();
  try {
    return readdirSync(base).some((d) => d.startsWith('chromium'));
  } catch {
    return false;
  }
}

function defaultBrowsersPath() {
  const home = homedir();
  if (process.platform === 'win32') {
    return join(process.env.LOCALAPPDATA || join(home, 'AppData', 'Local'), 'ms-playwright');
  }
  if (process.platform === 'darwin') {
    return join(home, 'Library', 'Caches', 'ms-playwright');
  }
  return join(home, '.cache', 'ms-playwright');
}
