---
change_name: l3-extended-demo
status: reviewed
change_mode: extend
produced_specs: [specs/order.md, specs/payment.md]
architecture_refs:
  - { path: docs/ARCHITECTURE.md, usage: 约束 }
domain_modeling_level: L3
domain_model_mode: extended
bounded_contexts: [BC-order, BC-payment]
reused_modules:
  - { path: services/order,   annotation: '[已有·扩展]' }
  - { path: services/payment, annotation: '[已有·扩展]' }
bc_relations:
  - { bc: BC-order,   relation: 扩展, refers_to: BC-order-base }
  - { bc: BC-payment, relation: ACL隔离, refers_to: BC-payment-legacy }
---

<!-- l3-confirmation
ts: 2026-05-17T15:00
proposed_by: ai
verdict: 1
user_rationale: "确认 L3 升级,需要展开战术建模以覆盖订单/支付的跨 BC 一致性"
linked_adr: ADR-L3-Upgrade
-->

# Design — l3-extended-demo
