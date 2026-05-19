---
change_name: user-signup
status: reviewed
change_mode: extend
produced_specs: [specs/user-signup.md]
architecture_refs:
  - { path: docs/ARCHITECTURE.md, usage: 约束 }
domain_modeling_level: L2
domain_model_mode: omit
bounded_contexts: [BC-user]
reused_modules:
  - { path: services/user-service, annotation: '[已有·扩展]' }
bc_relations:
  - { bc: BC-user, relation: 扩展, refers_to: BC-auth-base }
---

# Design — user-signup (extend, L2)
