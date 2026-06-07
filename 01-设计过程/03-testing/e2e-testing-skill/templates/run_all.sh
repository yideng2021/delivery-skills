#!/bin/bash
# ============================================================
# 全量回归测试入口
# 被测系统: {系统名称}
# 前端技术栈: {技术栈}
# 生成日期: {日期}
# ============================================================
# 使用说明:
#   1. 确保 playwright-cli 已安装且在 PATH 中
#   2. 确保被测服务已启动
#   3. 修改 BASE_URL 为实际环境地址
#   4. 执行: chmod +x run_all.sh && ./run_all.sh
# ============================================================

# ---- 环境配置 ----
BASE_URL="{BASE_URL，如 http://localhost:8080}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCREENSHOT_DIR="test-reports/screenshots"
REPORT_DIR="test-reports"

# ---- 颜色定义 ----
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ---- 结果统计 ----
TOTAL=0
PASSED=0
FAILED=0
ERRORS=""

# ---- 前置准备 ----
echo "============================================"
echo "  全量回归测试"
echo "  系统: {系统名称}"
echo "  环境: ${BASE_URL}"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================"
echo ""

mkdir -p ${SCREENSHOT_DIR}

# ---- 启动浏览器 ----
echo "[INIT] 启动浏览器..."
playwright-cli open ${BASE_URL}
playwright-cli resize 1920 1080
sleep 2

# ============================================================
# 按模块依赖顺序执行
# 依赖链: {模块A} → {模块B} → {模块C}
# ============================================================

# ---- 模块 1: {模块A名称} ----
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  模块 1/{总数}: {模块A名称}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash "${SCRIPT_DIR}/run_01_{模块A}.sh"; then
    PASSED=$((PASSED + 1))
    echo -e "${GREEN}[PASS]${NC} {模块A名称}"
else
    FAILED=$((FAILED + 1))
    ERRORS="${ERRORS}\n  - {模块A名称}"
    echo -e "${RED}[FAIL]${NC} {模块A名称}"
fi
TOTAL=$((TOTAL + 1))

sleep 2   # 模块间等待，确保状态稳定

# ---- 模块 2: {模块B名称} ----
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  模块 2/{总数}: {模块B名称}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash "${SCRIPT_DIR}/run_02_{模块B}.sh"; then
    PASSED=$((PASSED + 1))
    echo -e "${GREEN}[PASS]${NC} {模块B名称}"
else
    FAILED=$((FAILED + 1))
    ERRORS="${ERRORS}\n  - {模块B名称}"
    echo -e "${RED}[FAIL]${NC} {模块B名称}"
fi
TOTAL=$((TOTAL + 1))

sleep 2

# ---- 模块 N: {模块N名称} ----
# （按上述模式，为每个模块添加一个段落）

# ============================================================
# 关闭浏览器
# ============================================================
echo ""
echo "[CLEANUP] 关闭浏览器..."
playwright-cli close

# ============================================================
# 汇总报告
# ============================================================
echo ""
echo "============================================"
echo "  全量回归测试完成"
echo "============================================"
echo "  总模块数: ${TOTAL}"
echo -e "  通过: ${GREEN}${PASSED}${NC}"
echo -e "  失败: ${RED}${FAILED}${NC}"

if [ ${TOTAL} -gt 0 ]; then
    RATE=$((PASSED * 100 / TOTAL))
    echo "  通过率: ${RATE}%"
fi

if [ -n "${ERRORS}" ]; then
    echo ""
    echo -e "${RED}失败模块:${NC}"
    echo -e "${ERRORS}"
fi

echo ""
echo "  截图目录: ${SCREENSHOT_DIR}/"
echo "  测试报告: ${REPORT_DIR}/test-report.html"
echo "  结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================"

# 返回退出码（0=全部通过，1=有失败）
if [ ${FAILED} -gt 0 ]; then
    exit 1
else
    exit 0
fi
