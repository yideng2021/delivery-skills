#!/usr/bin/env bash
# spec_wf — golden case eval runner(维护者用)
#
# 跑 eval/cases/*/ 下每个 case:
#   - 调 ../scripts/validate.mjs <case-dir>
#   - 对照 expected.json:exit_code / must_match / must_not_match
#   - 汇总 PASS / FAIL 计数,任一不符即整体 FAIL(退出码 1)
#
# 注:Batch 3 起,critic-checks.mjs 已合并入 validate.mjs。
# expected.json 中的 critic_exit_code / critic_must_match 字段被忽略。

set -u
cd "$(dirname "$0")"

CASES_DIR="cases"
VALIDATOR="../scripts/validate.mjs"

pass=0
fail=0
total=0

bold()  { printf "\033[1m%s\033[0m" "$1"; }
green() { printf "\033[32m%s\033[0m" "$1"; }
red()   { printf "\033[31m%s\033[0m" "$1"; }
yellow(){ printf "\033[33m%s\033[0m" "$1"; }

for dir in "$CASES_DIR"/*/; do
  name="$(basename "$dir")"
  exp="$dir/expected.json"
  total=$((total + 1))

  if [[ ! -f "$exp" ]]; then
    printf "  %s %s — 缺少 expected.json,跳过\n" "$(yellow '⚠')" "$name"
    fail=$((fail + 1))
    continue
  fi

  expected_exit="$(node -e "console.log(JSON.parse(require('fs').readFileSync('$exp')).exit_code ?? 0)")"
  must_match_json="$(node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('$exp')).must_match || []))")"
  must_not_match_json="$(node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('$exp')).must_not_match || []))")"

  output="$(node "$VALIDATOR" "$dir" 2>&1 || true)"
  node "$VALIDATOR" "$dir" >/dev/null 2>&1
  actual_exit=$?

  errors=()

  if [[ "$actual_exit" != "$expected_exit" ]]; then
    errors+=("validator exit_code 期望=$expected_exit 实际=$actual_exit")
  fi

  while IFS= read -r needle; do
    [[ -z "$needle" ]] && continue
    if ! grep -q -- "$needle" <<<"$output"; then
      errors+=("must_match 缺失:\"$needle\"")
    fi
  done < <(node -e "JSON.parse(process.argv[1]).forEach(x=>console.log(x))" "$must_match_json")

  while IFS= read -r needle; do
    [[ -z "$needle" ]] && continue
    if grep -q -- "$needle" <<<"$output"; then
      errors+=("must_not_match 命中:\"$needle\"")
    fi
  done < <(node -e "JSON.parse(process.argv[1]).forEach(x=>console.log(x))" "$must_not_match_json")

  if [[ ${#errors[@]} -eq 0 ]]; then
    printf "  %s %s\n" "$(green '✓')" "$name"
    pass=$((pass + 1))
  else
    printf "  %s %s\n" "$(red '✗')" "$name"
    for e in "${errors[@]}"; do
      printf "      → %s\n" "$e"
    done
    printf "    --- validator 输出 ---\n"
    printf "%s\n" "$output" | sed 's/^/    /'
    printf "    --------------------------\n"
    fail=$((fail + 1))
  fi
done

echo
printf "%s %d 通过 / %d 失败 / %d 总数\n" "$(bold 'eval 结果:')" "$pass" "$fail" "$total"

if [[ "$fail" -gt 0 ]]; then
  exit 1
fi
exit 0