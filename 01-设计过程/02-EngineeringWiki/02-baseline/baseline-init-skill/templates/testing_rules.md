# 单元测试与 TDD 规范 (Testing & TDD Rules)

> 本文档定义了项目的自动化测试与测试驱动开发（TDD）标准。所有后续基于 AI 协作的（如 `spec-backend-dev-skill`）开发工作都必须严格遵循本指南，以确保代码质量、隔离性和可维护性。

## 1. 测试框架与选型
> 说明：项目使用哪些库作为主要测试支撑。

- **基础测试框架**: {扫描当前工程确认，如 JUnit 5}
- **Mock 框架**: {扫描当前工程确认，如 Mockito}
- **Web 层测试框架**: 统一采用 `@SpringBootTest` 搭配 `@ActiveProfiles("test")`，直接连通至特定测试数据库（配合 `@AutoConfigureMockMvc` 发起请求）。废弃 `@WebMvcTest` 或 `MockMvcBuilders.standaloneSetup` 隔离构建的方法。
- **集成测试支持**: 统一规定使用 `@SpringBootTest` 搭配 `@ActiveProfiles("test")` 结合特定的 `TestDataHelper` 进行真实数据库内嵌验证。

## 2. 目录结构与命名约定
- **文件位置**: 测试类必须与被测试类在同包路径下，位于 `src/test/java/` 内。
- **类名命名**:
  - 单元测试类：必须以 `Test` 结尾（如 `UserServiceTest`）。
  - 集成测试类：建议以 `IntegrationTest` 结尾（如 `ViolationLevelServiceIntegrationTest`）以作区分。
- **方法命名 (BDD 风格)**:
  采用清晰前缀表达“场景和预期”，可使用 `{方法名}_当{条件}_应返回{结果}` 或者 BDD 流 `should_{Do_{Something}}_when_{Condition_Is_Met}`：
  ```java
  @Test
  @DisplayName("当供应商无违规记录时应返回等级A")
  void analyzeBatch_noRecord_returnsLevelA() { ... }
  ```

## 3. TDD (Test-Driven Development) 闭环要求
任何业务代码的产出（特别是在 `AI 辅助` 实施期间）必须经历以下阶段：

### 3.1 🔴 RED 阶段 (先写测试，并令其失败)
- **要求**: 开发者（或 Agent）首先基于 Spec 的 `Given/When/Then` 验收标准构建对应的测试方法。
- **验证**: 必须观察到执行失败（因未实现或异常抛出），证明测试具备检测能力。

### 3.2 🟢 GREEN 阶段 (使其通过)
- **要求**: 以最小限度实现业务逻辑代码，使得刚刚编写的红色测试变绿。不提前预写未被测试案例覆盖的代码（YAGNI 原则）。

### 3.3 🔵 REFACTOR 阶段 (重构)
- **要求**: 保证测试通过的前提下，优化代码可读性，消除重复片段。

## 4. 隔离性与 Mock 策略
1. **纯单元测试（Unit Test）**:
   - **禁止**启动完整的 Spring 上下文 (`@SpringBootTest`)，以保持毫秒级别的响应。
   - 依赖项通过 `@Mock` 和 `@InjectMocks` (或手动 `new`) 进行隔离。
2. **集成测试（Integration Test）**:
   - 当需要验证 SQL 逻辑 (`Mapper`) 层级的真实表现或复杂的模块间组装时，允许使用集成测试。
   - 数据准备：不使用 `@MockBean` 强行篡改底层结果，而是使用辅助工具类（如 `TestDataHelper`）通过 JDBC 在嵌入式/测试库中插入真实场景数据。
   - 必须做好前置和后置的脏数据清理机制（`@BeforeEach` 和 `@AfterEach` 中执行清理脚本）。

## 5. 断言风格及最佳实践
- 断言：使用 `{测试框架原装 Assert，如 org.junit.jupiter.api.Assertions}` 验证核心字段与边界值。
- Given/When/Then 注释：复杂的测试要在方法内使用 `// Given`，`// When`，`// Then` 进行逻辑区块分割。
