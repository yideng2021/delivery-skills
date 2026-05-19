---
change_name: l3-no-confirm
status: reviewed
change_mode: extend
produced_specs: [specs/order.md]
architecture_refs: []
domain_modeling_level: L3
domain_model_mode: extended
bounded_contexts: [BC-order]
reused_modules:
  - { path: services/order, annotation: '[已有·扩展]' }
bc_relations:
  - { bc: BC-order, relation: 扩展, refers_to: BC-order-base }
---

# Design — l3-no-confirm

(故意构造:AI 单方面把 domain_modeling_level 升级到 L3 但没走 ToolCall 协议,design.md 顶部缺 l3 确认留痕块。validate.mjs 应通过 C1 检测拒绝。)
