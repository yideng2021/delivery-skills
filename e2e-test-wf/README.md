# e2e-test-wf — 端到端测试与运行时认知 workflow 域

围绕"真实浏览器驱动"的 skill 集合。各 skill 产物级解耦，可独立使用。

## 包含的 skill

| skill | 定位 | 产物 |
|-------|------|------|
| [`runtime-flow-extractor-skill`](runtime-flow-extractor-skill/SKILL.md) | **运行时业务流认知**（record-only）：录制完整业务闭环 + 抓真实流量 → 解析接口 → 落锚代码 → 反推流程图 | `{name}.mmd` + `{name}.flow` + `flow-code-map.md` |

> 静态代码认知（CodeGraph/GitNexus）见 `../architecture-extractor-wf`；
> 本域从**真实运行时流量**补足"系统在真实业务操作下怎么跑"这一维。

## runtime-flow-extractor 一句话

让人用 Playwright codegen 走一遍**完整业务闭环**，录制时 `--save-har` 抓全接口；Python 解析出接口清单；
再以"真实接口 + 录制脚本"为种子、grep + CodeGraph/GitNexus 落锚到前后端代码，产出锚定代码的业务流程图与简洁流程语言(.flow)。

详见 [runtime-flow-extractor-skill/README.md](runtime-flow-extractor-skill/README.md)。
