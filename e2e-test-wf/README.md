# e2e-test-wf — 端到端测试与运行时认知 workflow 域

围绕"真实浏览器驱动"的 skill 集合。各 skill 产物级解耦，可独立使用。

## 包含的 skill

| skill | 定位 | 产物 |
|-------|------|------|
| [`runtime-flow-extractor-skill`](runtime-flow-extractor-skill/SKILL.md) | **运行时业务流认知**：录制真实操作 + 抓真实流量 → 反推业务流程图 + 接口契约 | `flow.mmd` + `flow.flow` + `events.json` |

> 静态代码认知（CodeGraph/GitNexus）见 `../architecture-extractor-wf`；
> 本域从**真实运行时流量**补足"系统在真实业务操作下怎么跑"这一维。

## runtime-flow-extractor 一句话

让人用 Playwright codegen 走一遍真实业务主线，回放时把"每步操作↔触发的接口/参数/响应"
零歧义对应起来，产出与真实操作完全一致的业务流程图与简洁流程语言(.flow)。

详见 [runtime-flow-extractor-skill/README.md](runtime-flow-extractor-skill/README.md)。
