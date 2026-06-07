#!/bin/bash
# ============================================================
# 模块测试脚本: {模块名称}
# 文件编号: run_{序号}_{模块名}.sh
# 生成日期: {日期}
# 被测系统: {系统名称}
# 前端技术栈: {技术栈}
# ============================================================
# 使用说明:
#   1. 确保 playwright-cli 已安装且在 PATH 中
#   2. 确保被测服务已启动
#   3. 修改 BASE_URL 为实际环境地址
#   4. 标注 ★ 的 snapshot 在回归执行时需重新确认 ref
# ============================================================

# ---- 环境配置 ----
BASE_URL="{BASE_URL，如 http://localhost:8080}"
MODULE="{模块简称}"
SCREENSHOT_DIR="test-reports/screenshots"

# ---- 前置准备 ----
mkdir -p ${SCREENSHOT_DIR}

echo "========================================"
echo "  开始测试: {模块名称}"
echo "  环境: ${BASE_URL}"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# ============================================================
# P01: 页面加载验证
# ============================================================
echo "[P01] 页面加载验证..."

playwright-cli goto ${BASE_URL}/{路由路径}
playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）
playwright-cli screenshot --filename=${SCREENSHOT_DIR}/{NN}_${MODULE}_page_load.png

echo "[P01] ✅ 页面加载完成"

# ============================================================
# P02: 完整正向流程 — 新增
# ============================================================
echo "[P02] 新增流程..."

playwright-cli click {ref}                     # ref: "新增"按钮
playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）

playwright-cli fill {ref} "{测试数据}"          # ref: "名称"输入框
playwright-cli fill {ref} "{测试数据}"          # ref: "描述"输入框
playwright-cli select {ref} "{选项}"            # ref: "类型"下拉框
playwright-cli screenshot --filename=${SCREENSHOT_DIR}/{NN}_${MODULE}_add_form.png

playwright-cli click {ref}                     # ref: "保存"按钮
sleep 1
playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）
playwright-cli screenshot --filename=${SCREENSHOT_DIR}/{NN}_${MODULE}_add_success.png

echo "[P02] ✅ 新增完成"

# ============================================================
# P03: 编辑已有数据
# ============================================================
echo "[P03] 编辑流程..."

playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）
playwright-cli click {ref}                     # ref: 列表行"编辑"按钮
playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）

playwright-cli clear {ref}                     # ref: "名称"输入框
playwright-cli fill {ref} "{修改后数据}"        # ref: "名称"输入框
playwright-cli screenshot --filename=${SCREENSHOT_DIR}/{NN}_${MODULE}_edit_form.png

playwright-cli click {ref}                     # ref: "保存"按钮
sleep 1
playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）
playwright-cli screenshot --filename=${SCREENSHOT_DIR}/{NN}_${MODULE}_edit_success.png

echo "[P03] ✅ 编辑完成"

# ============================================================
# N01: 空表单提交拦截
# ============================================================
echo "[N01] 空表单拦截验证..."

playwright-cli click {ref}                     # ref: "新增"按钮
playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）

# 不填写任何内容，直接提交
playwright-cli click {ref}                     # ref: "保存"按钮
sleep 1
playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）
playwright-cli screenshot --filename=${SCREENSHOT_DIR}/{NN}_${MODULE}_empty_validation.png

# 关闭弹窗
playwright-cli click {ref}                     # ref: "取消"按钮
playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）

echo "[N01] ✅ 空表单拦截验证完成"

# ============================================================
# N02: 格式非法输入
# ============================================================
echo "[N02] 格式非法输入验证..."

playwright-cli click {ref}                     # ref: "新增"按钮
playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）

playwright-cli fill {ref} "!@#$%^&*()"         # ref: 输入非法字符
playwright-cli click {ref}                     # ref: "保存"按钮
sleep 1
playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）
playwright-cli screenshot --filename=${SCREENSHOT_DIR}/{NN}_${MODULE}_invalid_format.png

# 关闭弹窗
playwright-cli click {ref}                     # ref: "取消"按钮
playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）

echo "[N02] ✅ 格式非法输入验证完成"

# ============================================================
# N03: 边界值验证
# ============================================================
echo "[N03] 边界值验证..."

playwright-cli click {ref}                     # ref: "新增"按钮
playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）

# 填入超长字符串（100+字符）
playwright-cli fill {ref} "这是一段非常长的测试文本用于验证输入框的最大长度限制这是一段非常长的测试文本用于验证输入框的最大长度限制这是一段非常长的测试文本"
playwright-cli click {ref}                     # ref: "保存"按钮
sleep 1
playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）
playwright-cli screenshot --filename=${SCREENSHOT_DIR}/{NN}_${MODULE}_boundary_value.png

# 关闭弹窗
playwright-cli click {ref}                     # ref: "取消"按钮
playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）

echo "[N03] ✅ 边界值验证完成"

# ============================================================
# P04: 删除数据（最后执行，清理测试数据）
# ============================================================
echo "[P04] 删除流程..."

playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）
playwright-cli click {ref}                     # ref: 列表行"删除"按钮
playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）
playwright-cli screenshot --filename=${SCREENSHOT_DIR}/{NN}_${MODULE}_delete_confirm.png

playwright-cli click {ref}                     # ref: 确认弹窗"确定"按钮
sleep 1
playwright-cli snapshot                        # ★ 此处刷新ref（回归时需重新确认）
playwright-cli screenshot --filename=${SCREENSHOT_DIR}/{NN}_${MODULE}_delete_success.png

echo "[P04] ✅ 删除完成"

# ============================================================
echo "========================================"
echo "  模块测试完成: {模块名称}"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
