#!/usr/bin/env node
/**
 * spec-wf 唯一对外校验器。
 *
 * 用法:
 *   node scripts/validate.mjs <path>...
 *   node scripts/validate.mjs path/to/change/dir          # 自动识别 proposal/specs/design/tasks/critic
 *   node scripts/validate.mjs path/to/file.md             # 单文件 frontmatter 校验
 *
 * 校验覆盖(三层):
 *
 *   单文件 schema(frontmatter.schema.json):
 *     - 枚举 / 必填 / change_mode 联动
 *
 *   跨文件 invariant (I-A ~ I-F):
 *     I-A change_mode 在 proposal/specs/design 之间一致
 *     I-B design.reused_modules.path ⊇ 各 spec.impacted_modules 并集
 *     I-C design.bc_relations[].bc ⊆ design.bounded_contexts
 *     I-D tasks 不写 shipped_us(仅 workflow writeback 注入)
 *     I-E AUTH 单一所有权(D4):一条 AUTH 只能在一个 spec.related_req 中
 *     I-F change_name 跨四类文件完全一致
 *
 *   Audit 钩子 (C1 ~ C7,原 critic-checks 已合并入本脚本):
 *     C1 design.frontmatter.domain_modeling_level == L3 ⇒ design.md 必须含
 *        `<!-- l3-confirmation -->` 块,且 verdict ∈ {1, 2}
 *     C2 design.frontmatter.domain_modeling_level == L2 但 design.md 含
 *        l3-confirmation 块 ⇒ verdict 必须 == 3(rejection)
 *     C3 domain_model_mode == extended ⇒ 必同时 L3 + verdict == 1
 *     C4 tasks.exc_status == writeback_failed ⇒ tasks.md 必须含
 *        `<!-- writeback-failure: ... -->` 注释
 *     C5 critic.md(若存在)必须含 §1~§5 五段 + frontmatter 必填 4 字段
 *     C6 任一文件 status == needs_revision 持续 > 14 天 → soft 警告
 *     C7 proposal.md 必须含 `<!-- clarification-gate -->` 块(CG 闸门留痕);
 *        块内 verdict ∈ {PASS, ABORTED};ABORTED 必须含 skip_reason
 *
 * 退出码:
 *   0  全部通过
 *   1  存在 hard 违例(schema / invariant / C1~C5 / C7)
 *   2  仅 soft 警告(C6)或用法错误
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { resolve, join, basename, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

let Ajv, addFormats, yaml;
try {
  Ajv = (await import("ajv/dist/2020.js")).default;
  addFormats = (await import("ajv-formats")).default;
  yaml = (await import("js-yaml")).default;
} catch (e) {
  console.error("✖ 依赖未安装。请先在 scripts/ 目录执行:");
  console.error("    cd " + dirname(fileURLToPath(import.meta.url)) + " && npm install");
  console.error("原始错误:" + e.message);
  process.exit(2);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(__dirname, "../shared/contracts/frontmatter.schema.json");
const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf-8"));

const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true });
addFormats(ajv);
const mkValidator = (kind) => ajv.compile({
  $id: `spec-wf:doc-${kind}`,
  $defs: schema.$defs,
  $ref: `#/$defs/${kind}`,
});
const validateProposal = mkValidator("proposal");
const validateSpec     = mkValidator("spec");
const validateDesign   = mkValidator("design");
const validateTasks    = mkValidator("tasks");

const VALIDATORS = {
  proposal: validateProposal,
  spec:     validateSpec,
  design:   validateDesign,
  tasks:    validateTasks,
};

// ---------- 通用解析 ----------

const FRONTMATTER_RE   = /^---\r?\n([\s\S]*?)\r?\n---/;
const L3_CONFIRM_RE    = /<!--\s*l3-confirmation([\s\S]*?)-->/;
const CG_BLOCK_RE      = /<!--\s*clarification-gate([\s\S]*?)-->/;
const WRITEBACK_FAIL_RE = /<!--\s*writeback-failure:\s*([\s\S]*?)-->/;
const CRITIC_SECTION_RE = /##\s+§([1-5])\s+/g;
const NEEDS_REVISION_SOFT_DAYS = 14;

function readDoc(filePath) {
  if (!existsSync(filePath)) return { fm: null, text: "" };
  const text = readFileSync(filePath, "utf-8");
  const m = text.match(FRONTMATTER_RE);
  if (!m) return { fm: null, text };
  try {
    return { fm: yaml.load(m[1]), text };
  } catch (e) {
    return { fm: null, text, error: e.message };
  }
}

function parseFrontmatter(filePath) {
  const r = readDoc(filePath);
  if (r.error) throw new Error(`YAML 解析失败 (${filePath}): ${r.error}`);
  return r.fm;
}

function parseL3ConfirmBlock(text) {
  const m = text.match(L3_CONFIRM_RE);
  if (!m) return null;
  const body = m[1];
  const fields = {};
  for (const line of body.split(/\r?\n/)) {
    const km = line.match(/^\s*(\w[\w_]*)\s*:\s*(.+?)\s*$/);
    if (km) fields[km[1]] = km[2].replace(/^["']|["']$/g, "");
  }
  return fields;
}

function parseCgBlock(text) {
  const m = text.match(CG_BLOCK_RE);
  if (!m) return null;
  const body = m[1];
  const fields = {};
  for (const line of body.split(/\r?\n/)) {
    // 顶层 key: value(忽略 qa 列表的 - q/- a 子项)
    const km = line.match(/^\s*(stage|ts|turn|budget_used|verdict|skip_reason)\s*:\s*(.+?)\s*$/);
    if (km) fields[km[1]] = km[2].replace(/^["']|["']$/g, "");
  }
  return fields;
}

function inferDocType(filePath) {
  const base = basename(filePath);
  if (base === "proposal.md") return "proposal";
  if (base === "design.md")   return "design";
  if (base === "tasks.md")    return "tasks";
  if (/^[a-z0-9-]+\.md$/.test(base) && filePath.includes("/specs/")) return "spec";
  return null;
}

// ---------- 收集 change 下的全部文档 ----------

function walkChangeDir(changeDir) {
  const docs = { proposal: null, specs: [], design: null, tasks: null, critic: null };
  for (const entry of readdirSync(changeDir)) {
    const full = join(changeDir, entry);
    const st = statSync(full);
    if (st.isDirectory() && entry === "specs") {
      for (const f of readdirSync(full)) {
        if (f.endsWith(".md")) docs.specs.push(join(full, f));
      }
    } else if (entry === "proposal.md") docs.proposal = full;
    else if (entry === "design.md")     docs.design   = full;
    else if (entry === "tasks.md")      docs.tasks    = full;
    else if (entry === "critic.md")     docs.critic   = full;
  }
  return docs;
}

function isChangeDir(dir) {
  try {
    return statSync(join(dir, "proposal.md")).isFile();
  } catch { return false; }
}

// ---------- 单文件 schema 校验 ----------

function validateOne(filePath, violations) {
  const docType = inferDocType(filePath);
  if (!docType) {
    violations.push({ severity: "hard", file: filePath, kind: "infer", msg: "无法识别文档类型(期待 proposal.md/specs/*.md/design.md/tasks.md)" });
    return null;
  }
  const fm = parseFrontmatter(filePath);
  if (fm === null) {
    violations.push({ severity: "hard", file: filePath, kind: "frontmatter", msg: "未找到 frontmatter (--- ... ---)" });
    return null;
  }
  const v = VALIDATORS[docType];
  if (!v(fm)) {
    for (const err of v.errors) {
      violations.push({ severity: "hard", file: filePath, kind: `schema/${docType}`, msg: `${err.instancePath || "/"} ${err.message}` });
    }
  }
  return { docType, fm };
}

// ---------- 跨阶段 invariant (I-A ~ I-F) ----------

function checkCrossStage(docs, parsed, violations) {
  const get = (k) => parsed[k]?.fm;
  const proposal = get("proposal");
  const design   = get("design");
  const tasks    = get("tasks");
  const specs    = (parsed.specs || []).map(x => x.fm).filter(Boolean);

  // I-A: change_mode 一致
  const modes = [
    proposal?.change_mode,
    ...specs.map(s => s?.change_mode),
    design?.change_mode,
  ].filter(Boolean);
  if (new Set(modes).size > 1) {
    violations.push({ severity: "hard", kind: "I-A/change_mode", msg: `change_mode 不一致: ${[...new Set(modes)].join(", ")}` });
  }

  // I-F: change_name 一致
  const names = [
    proposal?.change_name,
    ...specs.map(s => s?.change_name),
    design?.change_name,
    tasks?.change_name,
  ].filter(Boolean);
  if (new Set(names).size > 1) {
    violations.push({ severity: "hard", kind: "I-F/change_name", msg: `change_name 不一致: ${[...new Set(names)].join(", ")}` });
  }

  // I-B: design.reused_modules.path ⊇ ∪ spec.impacted_modules
  if (design && specs.length) {
    const impactedUnion = new Set(specs.flatMap(s => s?.impacted_modules || []));
    const reusedPaths = new Set((design.reused_modules || []).map(x => x.path));
    const missing = [...impactedUnion].filter(p => !reusedPaths.has(p));
    if (missing.length) {
      violations.push({ severity: "hard", kind: "I-B/reused⊇impacted", msg: `design.reused_modules 遗漏 spec.impacted_modules: ${missing.join(", ")}` });
    }
  }

  // I-C: bc_relations[].bc ⊆ bounded_contexts
  if (design) {
    const bcSet = new Set(design.bounded_contexts || []);
    const rels  = design.bc_relations || [];
    for (const r of rels) {
      if (!bcSet.has(r.bc)) {
        violations.push({ severity: "hard", kind: "I-C/bc_relations⊆bounded_contexts", msg: `bc_relations.bc=${r.bc} 不在 bounded_contexts` });
      }
    }
  }

  // I-D: tasks.shipped_us 必须由 workflow 注入;若 status=draft 时不应有
  if (tasks && tasks.status === "draft" && Array.isArray(tasks.shipped_us) && tasks.shipped_us.length > 0) {
    violations.push({ severity: "hard", kind: "I-D/shipped_us-by-workflow", msg: `tasks.shipped_us 非空但 status=draft;该字段仅 workflow writeback 时注入` });
  }

  // I-E: AUTH 单一所有权(D4):一 AUTH 一 spec
  if (specs.length) {
    const ownership = new Map();
    specs.forEach((s, idx) => {
      for (const auth of (s.related_req || [])) {
        if (!ownership.has(auth)) ownership.set(auth, []);
        ownership.get(auth).push(docs.specs[idx]);
      }
    });
    for (const [auth, files] of ownership) {
      if (files.length > 1) {
        violations.push({ severity: "hard", kind: "I-E/D4-auth-unique", msg: `AUTH ${auth} 被 ${files.length} 个 spec 持有: ${files.map(f => basename(f)).join(", ")}` });
      }
    }
  }
}

// ---------- Audit 钩子 (C1 ~ C6) ----------

function checkAuditHooks(docs, violations) {
  const designPath = docs.design;
  const tasksPath  = docs.tasks;
  const criticPath = docs.critic;

  // ---- C1-C3: L3 confirmation 留痕 ----
  if (designPath && existsSync(designPath)) {
    const design = readDoc(designPath);
    if (design.fm) {
      const lvl  = design.fm.domain_modeling_level;
      const mode = design.fm.domain_model_mode;
      const block = parseL3ConfirmBlock(design.text);

      if (lvl === "L3") {
        if (!block) {
          violations.push({
            severity: "hard", kind: "C1/l3-confirmation-missing",
            msg: "domain_modeling_level=L3 但 design.md 缺 <!-- l3-confirmation --> 块",
            file: designPath,
          });
        } else if (!["1", "2"].includes(String(block.verdict))) {
          violations.push({
            severity: "hard", kind: "C1/l3-confirmation-verdict",
            msg: `L3 时 verdict 必须 ∈ {1, 2},实际=${block.verdict}`,
            file: designPath,
          });
        }
      } else if (lvl === "L2" && block) {
        if (String(block.verdict) !== "3") {
          violations.push({
            severity: "hard", kind: "C2/l3-rejection-verdict",
            msg: `L2 时若存在 l3-confirmation 块,verdict 必须 == 3(rejection),实际=${block.verdict}`,
            file: designPath,
          });
        }
      }

      if (mode === "extended") {
        if (lvl !== "L3") {
          violations.push({
            severity: "hard", kind: "C3/extended-only-l3",
            msg: `domain_model_mode=extended 仅 L3 合法,实际 level=${lvl}`,
            file: designPath,
          });
        } else if (block && String(block.verdict) !== "1") {
          violations.push({
            severity: "hard", kind: "C3/extended-verdict",
            msg: `extended 模式要求 l3-confirmation verdict == 1,实际=${block.verdict}`,
            file: designPath,
          });
        }
      }
    }
  }

  // ---- C4: writeback-failure 注释 ----
  if (tasksPath && existsSync(tasksPath)) {
    const tasks = readDoc(tasksPath);
    if (tasks.fm && tasks.fm.exc_status === "writeback_failed") {
      if (!WRITEBACK_FAIL_RE.test(tasks.text)) {
        violations.push({
          severity: "hard", kind: "C4/writeback-failure-comment",
          msg: "exc_status=writeback_failed 但 tasks.md 缺 <!-- writeback-failure: ... --> 注释",
          file: tasksPath,
        });
      }
    }
  }

  // ---- C5: critic.md 格式 ----
  if (criticPath && existsSync(criticPath)) {
    const critic = readDoc(criticPath);
    if (!critic.fm) {
      violations.push({
        severity: "hard", kind: "C5/critic-frontmatter",
        msg: "critic.md 缺 frontmatter 或 YAML 解析失败",
        file: criticPath,
      });
    } else {
      for (const k of ["target", "critic_round", "verdict", "ts"]) {
        if (!(k in critic.fm)) {
          violations.push({
            severity: "hard", kind: "C5/critic-frontmatter-missing",
            msg: `critic.md frontmatter 缺字段: ${k}`,
            file: criticPath,
          });
        }
      }
      if (critic.fm.verdict && !["pass", "needs_revision", "escalated"].includes(critic.fm.verdict)) {
        violations.push({
          severity: "hard", kind: "C5/critic-verdict",
          msg: `critic.md verdict 非法: ${critic.fm.verdict}`,
          file: criticPath,
        });
      }
      const sectionMatches = [...critic.text.matchAll(CRITIC_SECTION_RE)].map(m => Number(m[1]));
      const seen = new Set(sectionMatches);
      for (let i = 1; i <= 5; i++) {
        if (!seen.has(i)) {
          violations.push({
            severity: "hard", kind: "C5/critic-section-missing",
            msg: `critic.md 缺 §${i} 段(协议要求 §1~§5 五段)`,
            file: criticPath,
          });
        }
      }
    }
  }

  // ---- C7: proposal CG 闸门留痕(P0 仅 proposal hard fail) ----
  if (docs.proposal && existsSync(docs.proposal)) {
    const proposal = readDoc(docs.proposal);
    const cg = parseCgBlock(proposal.text);
    if (!cg) {
      violations.push({
        severity: "hard", kind: "C7/clarification-gate-missing",
        msg: "proposal.md 缺 <!-- clarification-gate --> 块(违反 CG 闸门;参 shared/protocols/clarification-gate-protocol.md §10)",
        file: docs.proposal,
      });
    } else {
      for (const k of ["stage", "ts", "turn", "verdict"]) {
        if (!(k in cg)) {
          violations.push({
            severity: "hard", kind: "C7/clarification-gate-field-missing",
            msg: `clarification-gate 块缺字段: ${k}`,
            file: docs.proposal,
          });
        }
      }
      if (cg.verdict && !["PASS", "ABORTED"].includes(cg.verdict)) {
        violations.push({
          severity: "hard", kind: "C7/clarification-gate-verdict",
          msg: `clarification-gate verdict 非法: ${cg.verdict}(期望 PASS 或 ABORTED;NEEDS_MORE 仅中间态)`,
          file: docs.proposal,
        });
      }
      if (cg.verdict === "ABORTED" && !("skip_reason" in cg)) {
        violations.push({
          severity: "hard", kind: "C7/clarification-gate-skip-reason",
          msg: "clarification-gate verdict=ABORTED 但缺 skip_reason 字段",
          file: docs.proposal,
        });
      }
    }
  }

  // ---- C6: needs_revision soft 告警 ----
  for (const [name, path] of [["proposal", docs.proposal], ["design", docs.design], ["tasks", docs.tasks]]) {
    if (!path || !existsSync(path)) continue;
    const r = readDoc(path);
    if(r.fm && r.fm.status === "needs_revision" && r.fm.ts) {
      const days = (Date.now() - new Date(r.fm.ts).getTime()) / 86400e3;
      if (days > NEEDS_REVISION_SOFT_DAYS) {
        violations.push({
          severity: "soft", kind: "C6/needs-revision-stale",
          msg: `${name} status=needs_revision 持续 ${Math.floor(days)} 天 > ${NEEDS_REVISION_SOFT_DAYS} 天,疑似遗忘`,
          file: path,
        });
      }
    }
  }
}

// ---------- 入口 ----------

function processChangeDir(changeDir) {
  const violations = [];
  const docs = walkChangeDir(changeDir);
  const parsed = { proposal: null, specs: [], design: null, tasks: null };

  if (docs.proposal) parsed.proposal = validateOne(docs.proposal, violations);
  for (const sp of docs.specs)  parsed.specs.push(validateOne(sp, violations));
  if (docs.design)   parsed.design   = validateOne(docs.design, violations);
  if (docs.tasks)    parsed.tasks    = validateOne(docs.tasks, violations);

  checkCrossStage(docs, parsed, violations);
  checkAuditHooks(docs, violations);

  return { changeDir, violations };
}

function processSingleFile(file) {
  const violations = [];
  validateOne(file, violations);
  return { changeDir: file, violations };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("用法: validate.mjs <change-dir | file.md>...");
    process.exit(2);
  }

  const reports = [];
  for (const a of args) {
    const abs = resolve(a);
    const st = statSync(abs);
    if (st.isDirectory()) {
      if (isChangeDir(abs)) {
        reports.push(processChangeDir(abs));
      } else {
        for (const sub of readdirSync(abs)) {
          const subAbs = join(abs, sub);
          if (statSync(subAbs).isDirectory() && isChangeDir(subAbs)) {
            reports.push(processChangeDir(subAbs));
          }
        }
      }
    } else {
      reports.push(processSingleFile(abs));
    }
  }

  let hard = 0;
  let soft = 0;
  for (const r of reports) {
    const label = relative(process.cwd(), r.changeDir) || r.changeDir;
    const h = r.violations.filter(v => v.severity !== "soft").length;
    const s = r.violations.filter(v => v.severity === "soft").length;
    if (r.violations.length === 0) {
      console.log(`✓ ${label} — 通过`);
    } else {
      const sym = h > 0 ? "✖" : "⚠";
      console.log(`${sym} ${label} — ${h} hard / ${s} soft`);
      for (const v of r.violations) {
        const where = v.file ? `\n    @ ${relative(process.cwd(), v.file)}` : "";
        console.log(`    [${v.severity}] [${v.kind}] ${v.msg}${where}`);
      }
      hard += h;
      soft += s;
    }
  }
  if (hard > 0) process.exit(1);
  if (soft > 0) process.exit(2);
  process.exit(0);
}

main();