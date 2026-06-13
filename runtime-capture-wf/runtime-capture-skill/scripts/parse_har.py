#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
解析运行时业务流 HAR，提取 /api/ 请求，脱敏后输出【两段式】TXT：

  ① 摘要（头部明细，默认加载）  {stem}_api_requests.txt
       - 接口种子清单（去重，供 grep 后端定位）
       - 时序清单（idx. [status] METHOD path?query）
  ② 明细（按需加载）            {stem}_api_details.txt
       - 每条接口的 req/resp body（脱敏 + 截断），按序号(1..N)与摘要对齐

设计意图：消费方（人/AI）默认只读“摘要”就能掌握流程骨架与接口种子；
仅当需要看某接口的参数/返回结构时，再按序号去“明细”里查 —— 省 token、防淹没。

用法:
  python parse_har.py <har_file>
  python parse_har.py <har_file> --summary-only        # 只出摘要，不出明细
  python parse_har.py <har_file> --max-detail-len 2000 # 明细 body 截断阈值
"""

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import urlsplit

# ── 脱敏配置（落盘前必过，见 references/redaction-rules.md）────────────────
SENSITIVE_HEADERS = {
    "cookie", "set-cookie", "authorization", "token", "x-auth-token",
    "x-access-token", "x-imos-auth_token",
}
SENSITIVE_BODY_KEYS = {
    "token", "password", "passwd", "auth_token", "access_token",
    "refresh_token", "secret", "idcard", "id_card", "phone", "mobile",
}

API_MARKER = "/api/"          # 与录制 glob（**/api/**）保持一致
SUMMARY_QUERY_MAX = 120       # 摘要里 query 过长则截断


# ── 脱敏 ──────────────────────────────────────────────────────────────────
def redact_obj(obj):
    """递归脱敏：命中敏感 key 直接替换。"""
    if isinstance(obj, dict):
        return {
            k: ("[REDACTED]" if k.lower() in SENSITIVE_BODY_KEYS else redact_obj(v))
            for k, v in obj.items()
        }
    if isinstance(obj, list):
        return [redact_obj(x) for x in obj]
    return obj


def redact_body(text):
    """脱敏请求/响应体（JSON 优先，回退 form-urlencoded）。返回 (文本, 是否JSON)。"""
    if not text:
        return "", False
    try:
        obj = json.loads(text)
        return json.dumps(redact_obj(obj), ensure_ascii=False, indent=2), True
    except (json.JSONDecodeError, TypeError):
        pass

    def _kv(m):
        key = m.group(1)
        return f"{key}=[REDACTED]" if key.lower() in SENSITIVE_BODY_KEYS else m.group(0)

    return re.sub(r"([^&=\s]+)=([^&]*)", _kv, text), False


def truncate(text, max_len):
    if text and len(text) > max_len:
        return text[:max_len] + f"\n…[已截断，完整 body 见 HAR；原长 {len(text)} 字符]"
    return text


# ── 解析 ──────────────────────────────────────────────────────────────────
def parse_har(har_path, max_detail_len):
    har = json.loads(Path(har_path).read_text(encoding="utf-8"))
    entries = har.get("log", {}).get("entries", [])
    result = []

    for entry in entries:
        try:
            req = entry.get("request", {}) or {}
            url = req.get("url", "")
            if API_MARKER not in url:
                continue

            split = urlsplit(url)
            post = req.get("postData", {}) or {}
            req_body, _ = redact_body(post.get("text", ""))

            resp = entry.get("response", {}) or {}
            resp_text = (resp.get("content", {}) or {}).get("text", "") or ""
            resp_body, _ = redact_body(resp_text)

            result.append({
                "started": entry.get("startedDateTime", ""),
                "method": req.get("method", "GET"),
                "url": url,
                "path": split.path,
                "query": split.query,
                "status": resp.get("status", 0),
                "req_body": truncate(req_body, max_detail_len) if req_body else "无",
                "resp_body": truncate(resp_body, max_detail_len) if resp_body else "（空）",
            })
        except Exception as e:  # 单条异常不影响整体
            print(f"[WARN] 跳过异常条目: {e}", file=sys.stderr)

    def _sort_key(e):
        try:
            return datetime.fromisoformat(e["started"].replace("Z", "+00:00"))
        except Exception:
            return datetime.min

    result.sort(key=_sort_key)
    return result


# ── 输出格式 ──────────────────────────────────────────────────────────────
def build_summary(entries, har_name):
    seeds, seen = [], set()
    for e in entries:
        key = f"{e['method']:<6}{e['path']}"
        if key not in seen:
            seen.add(key)
            seeds.append(key)

    lines = [
        "# 运行时业务流 · 接口摘要（头部明细，默认加载）",
        f"# 来源 HAR: {har_name}",
        f"# 共 {len(entries)} 条 /api/ 请求 | 去重接口 {len(seeds)} 个",
        "# 接口参数/返回结构见同目录 *_api_details.txt（按序号查）",
        "",
        "## 接口种子（去重，供 grep 后端定位）",
        *seeds,
        "",
        "## 时序清单",
    ]
    for idx, e in enumerate(entries, 1):
        q = e["query"]
        if len(q) > SUMMARY_QUERY_MAX:
            q = q[:SUMMARY_QUERY_MAX] + "…"
        suffix = f"?{q}" if q else ""
        lines.append(f"{idx}. [{e['status']}] {e['method']:<6}{e['path']}{suffix}")
    lines.append("")
    return "\n".join(lines)


def build_details(entries, har_name):
    lines = [
        "# 运行时业务流 · 接口明细（按需加载）",
        f"# 来源 HAR: {har_name} | 序号与摘要(_api_requests.txt)对齐",
        "",
    ]
    for idx, e in enumerate(entries, 1):
        suffix = f"?{e['query']}" if e["query"] else ""
        lines += [
            f"==== {idx}. {e['method']} {e['path']}{suffix} ====",
            f"startedDateTime: {e['started']}",
            f"requestBody: {e['req_body']}",
            f"responseStatus: {e['status']}",
            "responseBody:",
            e["resp_body"],
            "",
        ]
    return "\n".join(lines)


def derive_paths(har_path):
    p = Path(har_path)
    base = p.name[:-4] if p.name.lower().endswith(".har") else p.name  # 去 .har
    summary = p.with_name(f"{base}.txt")
    if "_api_requests" in base:
        details = p.with_name(f"{base.replace('_api_requests', '_api_details')}.txt")
    else:
        details = p.with_name(f"{base}_details.txt")
    return summary, details


# ── 入口 ──────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(description="解析运行时业务流 HAR → 两段式接口 TXT")
    ap.add_argument("har_file", help="录制产出的 *_runtimeflow_api_requests.har")
    ap.add_argument("--summary-only", action="store_true", help="只出摘要，不出明细")
    ap.add_argument("--max-detail-len", type=int, default=2000, help="明细 body 截断阈值")
    args = ap.parse_args()

    har_path = Path(args.har_file)
    if not har_path.exists():
        print(f"[ERROR] HAR 文件不存在: {har_path}", file=sys.stderr)
        sys.exit(1)

    print(f"[INFO] 解析: {har_path}")
    try:
        entries = parse_har(har_path, args.max_detail_len)
    except json.JSONDecodeError as e:
        print(f"[ERROR] HAR JSON 解析失败: {e}", file=sys.stderr)
        sys.exit(1)

    if not entries:
        print("[WARN] 未提取到 /api/ 请求。确认录制 glob（**/api/**）是否匹配目标接口前缀。",
              file=sys.stderr)

    summary_path, details_path = derive_paths(har_path)
    summary_path.write_text(build_summary(entries, har_path.name), encoding="utf-8")
    print(f"[INFO] 摘要已写: {summary_path}  （共 {len(entries)} 条）")

    if not args.summary_only:
        details_path.write_text(build_details(entries, har_path.name), encoding="utf-8")
        print(f"[INFO] 明细已写: {details_path}")


if __name__ == "__main__":
    main()
