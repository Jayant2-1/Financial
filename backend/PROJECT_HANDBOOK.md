# Finance Backend Project Handbook

## 1) Purpose

- **Goal** Provide a secure, role-based finance backend API.
- **Primary Actors** `admin`, `analyst`, `viewer`.
- **Primary Resources** Users, Records, Dashboard analytics, Auth sessions.

---

## 2) End-to-End Request Workflow (How a request reaches endpoints)

### 2.1 Global request path

1. **Server bootstrap**: `src/server.js`
   - Starts HTTP server.
   - Connects database (`src/config/db.js`).
   - Registers graceful shutdown.

2. **Express app wiring**: `src/app.js`
   - Loads global middleware in order.
   - Mounts API router at `/api/v1`.

3. **Context + security middleware**
   - Correlation context: `src/utils/requestContext.js`
   - Security stack: Helmet, CORS, rate limit, sanitize, xss-clean, cookie parser.

4. **Response/timing middleware**
   - Response shaping: `src/middlewares/response.middleware.js`
   - Request timing logs: `src/middlewares/timing.middleware.js`

5. **Route selection**
   - Root router: `src/routes/api.routes.js`
   - Feature routers: `auth.routes.js`, `user.routes.js`, `record.routes.js`, `dashboard.routes.js`

6. **Route-level middleware**
   - Auth token verification: `src/middlewares/auth.middleware.js`
   - RBAC role checks: `src/middlewares/role.middleware.js`
   - Input validation: `src/middlewares/validate.middleware.js`

7. **Controller execution**
   - HTTP handlers in `src/controllers/*.controller.js`

8. **Service execution**
   - Business rules in `src/services/*.service.js`

9. **Repository execution**
   - Data access in `src/repositories/*.repository.js`

10. **Model/query execution**
   - Mongoose models in `src/models/*.model.js`

11. **DTO shaping**
   - Output transformation in `src/dtos/*.dto.js`

12. **Response / error output**
   - Normalized response wrapper.
   - Error handling via `src/middlewares/error.middleware.js`.
   - 404 fallback via `src/middlewares/notFound.middleware.js`.

---

## 3) Endpoint-to-File Correlation (exact request mapping)

## 3.1 Auth endpoints

- **POST `/api/v1/auth/register`**
  - Route: `src/routes/auth.routes.js`
  - Validation: `src/validators/auth.validator.js` (`registerSchema`)
  - Controller: `src/controllers/auth.controller.js` (`register`)
  - Service: `src/services/auth.service.js` (`registerBootstrapAdmin`)
  - Repository: `src/repositories/user.repository.js`
  - Model: `src/models/user.model.js`
  - **RBAC** Public endpoint, but gated by setup key and first-admin-only logic.

- **POST `/api/v1/auth/login`**
  - Route: `src/routes/auth.routes.js`
  - Validation: `src/validators/auth.validator.js` (`loginSchema`)
  - Controller: `src/controllers/auth.controller.js` (`login`)
  - Service: `src/services/auth.service.js` (`login`)
  - Token service: `src/services/token.service.js`
  - Repositories: `user.repository.js`, `refreshToken.repository.js`
  - Models: `user.model.js`, `refreshToken.model.js`
  - **RBAC** Public endpoint.

- **POST `/api/v1/auth/refresh`**
  - Route: `src/routes/auth.routes.js`
  - Controller: `src/controllers/auth.controller.js` (`refresh`)
  - Service: `src/services/auth.service.js` (`refresh`)
  - Token service + refresh repository for rotation and validation
  - **RBAC** Public endpoint, token-protected (refresh token required).

- **POST `/api/v1/auth/logout`**
  - Route: `src/routes/auth.routes.js`
  - Middleware: `verifyToken`
  - Controller: `src/controllers/auth.controller.js` (`logout`)
  - Service: `src/services/auth.service.js` (`logout`)
  - Repository: `src/repositories/refreshToken.repository.js`
  - **RBAC** Any authenticated user.

## 3.2 User endpoints

- **GET `/api/v1/users`**
  - Route: `src/routes/user.routes.js`
  - Middleware: `verifyToken`, `requireRoles('admin')`
  - Validation: `src/validators/user.validator.js` (`listUsersQuerySchema`)
  - Controller: `src/controllers/user.controller.js` (`listUsers`)
  - Service: `src/services/user.service.js` (`listUsers`)
  - Repository: `src/repositories/user.repository.js` (`listUsers`)
  - DTO: `src/dtos/user.dto.js`

- **POST `/api/v1/users`**
  - Route: `src/routes/user.routes.js`
  - Middleware: `verifyToken`, `requireRoles('admin')`
  - Validation: `createUserSchema`
  - Controller: `createUser`
  - Service: `createUser`
  - Repository: `createUser`
  - DTO: `toUserDTO`

- **PUT `/api/v1/users/:id`**
  - Route + middleware same admin protections
  - Validation: `updateUserSchema`
  - Controller/Service/Repository: update chain

- **DELETE `/api/v1/users/:id`**
  - Route + middleware same admin protections
  - Controller/Service/Repository: soft-delete chain

## 3.3 Record endpoints

- **GET `/api/v1/records`**
  - Route: `src/routes/record.routes.js`
  - Middleware: `verifyToken`, `requireRoles('analyst','admin')`
  - Validation: `src/validators/record.validator.js` (`listRecordsQuerySchema`)
  - Controller: `listRecords`
  - Service: `listRecords`
  - Repository: `listRecords` + filter/sort/pagination logic
  - DTO: `src/dtos/record.dto.js`

- **POST `/api/v1/records`**
  - Route middleware: `verifyToken`, `requireRoles('admin')`
  - Validation: `createRecordSchema`
  - Controller: `createRecord`
  - Service: `createRecord`
  - Repository: `createRecord`

- **GET `/api/v1/records/:id`**
  - Route middleware: `requireRoles('analyst','admin')`
  - Controller/service/repository get by id path

- **PUT `/api/v1/records/:id`**
  - Route middleware: admin only
  - Validation: `updateRecordSchema`
  - Controller/service/repository update path

- **DELETE `/api/v1/records/:id`**
  - Route middleware: admin only
  - Controller/service/repository soft delete path

## 3.4 Dashboard endpoints

- **GET `/api/v1/dashboard/summary`**
  - Route: `src/routes/dashboard.routes.js`
  - Middleware: `verifyToken`, read-role check, query validation
  - Controller: `summary`
  - Service: `getSummary`
  - Repository: `summary` aggregation
  - DTO: `src/dtos/dashboard.dto.js` (`toSummaryDTO`)

- **GET `/api/v1/dashboard/trends`**
  - Route: dashboard router
  - Middleware: same as summary
  - Controller: `trends`
  - Service: `getTrends`
  - Repository: `monthlyTrends` aggregation
  - DTO: `toTrendDTO`

---

## 4) RBAC in Detail

## 4.1 Roles

- **viewer**
  - Dashboard-only access.
  - No records endpoint access.
- **analyst**
  - Can read records.
  - Can access dashboard insights.
- **admin**
  - Can create, update, and manage records and users.
  - Can access dashboard insights.

## 4.2 Middleware enforcement

- **Authentication check**: `src/middlewares/auth.middleware.js`
  - Validates access token.
  - Loads active user context.
- **Role check**: `src/middlewares/role.middleware.js`
  - `requireRoles(...roles)` controls endpoint access.
  - `checkPermission(permission)` exists for fine-grained future policy.

## 4.3 RBAC Matrix

| Endpoint Group | viewer | analyst | admin |
|---|---:|---:|---:|
| Auth login/refresh/logout | Yes | Yes | Yes |
| User management | No | No | Yes |
| Record read | No | Yes | Yes |
| Record create/update/delete | No | No | Yes |
| Dashboard read | Yes | Yes | Yes |

---

## 5) Detailed API Purpose (why each API exists)

- **Auth APIs**
  - Bootstrap first admin, issue/rotate/revoke tokens.
  - Protect account lifecycle and session integrity.

- **User APIs**
  - Internal admin control plane for identity and role lifecycle.

- **Record APIs**
  - Core business domain: create and manage financial events.
  - Support filters/pagination for real list usage.

- **Dashboard APIs**
  - Aggregated decision views for reporting and trends.

---

## 6) File-by-File Handbook (what + why)

## 6.1 Root files

- **`.env.example`**
  - **What** Template for required environment variables.
  - **Why** Standardize local/dev/prod config.

- **`.github/workflows/test.yml`**
  - **What** GitHub Actions CI pipeline.
  - **Why** Run automated tests on push/PR for quality gate.

- **`.gitignore`**
  - **What** Ignore node_modules/env/log/coverage artifacts.
  - **Why** Keep repo clean and secure.

- **`package.json`**
  - **What** Scripts + dependency manifest.
  - **Why** Source of truth for runtime and toolchain.

- **`package-lock.json`**
  - **What** Locked dependency graph.
  - **Why** Reproducible builds.

- **`jest.config.js`**
  - **What** Jest test runtime configuration.
  - **Why** Stable test behavior in CI/local.

- **`README.md`**
  - **What** Quick-start technical documentation.
  - **Why** Fast onboarding.

- **`HANDBOOK.md`**
  - **What** Prior long-form architecture handbook.
  - **Why** Historical reference.

- **`CHANGELOG.md`**
  - **What** Change history.
  - **Why** Track release-level evolution.

- **`ENHANCEMENT_SUMMARY.md`**
  - **What** Executive enhancement summary.
  - **Why** Stakeholder context.

- **`DOCUMENTATION_INDEX.md`**
  - **What** Documentation navigation index.
  - **Why** Fast cross-doc lookup.

## 6.2 `src/` core bootstrap

- **`src/server.js`**
  - **What** Creates HTTP server, connects DB, handles shutdown.
  - **Why** Keep startup/lifecycle concerns outside app wiring.

- **`src/app.js`**
  - **What** Assembles middleware stack and mounts routes.
  - **Why** Central request pipeline orchestration.

## 6.3 `src/config/`

- **`src/config/env.js`**
  - **What** Reads and validates environment variables.
  - **Why** Fail fast for missing required config.

- **`src/config/db.js`**
  - **What** MongoDB connect/disconnect helpers.
  - **Why** Isolate persistence lifecycle.

- **`src/config/logger.js`**
  - **What** Winston logger + request/error logging helpers.
  - **Why** Structured observability across environments.

- **`src/config/swagger.js`**
  - **What** OpenAPI spec generation config.
  - **Why** Centralized API docs setup.

## 6.4 `src/constants/`

- **`src/constants/app.constants.js`**
  - **What** Error codes, roles, permissions, status, pagination/token constants.
  - **Why** Remove magic strings and centralize policy constants.

## 6.5 `src/routes/`

- **`src/routes/api.routes.js`**
  - **What** Aggregates feature routers.
  - **Why** Keep route composition clean.

- **`src/routes/auth.routes.js`**
  - **What** Auth endpoint definitions and middleware binding.
  - **Why** Isolate auth API contracts.

- **`src/routes/user.routes.js`**
  - **What** User management endpoint definitions.
  - **Why** Isolate admin user operations.

- **`src/routes/record.routes.js`**
  - **What** Record CRUD endpoint definitions.
  - **Why** Isolate core domain resource operations.

- **`src/routes/dashboard.routes.js`**
  - **What** Summary/trends endpoint definitions.
  - **Why** Isolate analytic endpoints.

## 6.6 `src/controllers/`

- **`auth.controller.js`**
  - **What** Login/register/refresh/logout handlers + cookie writing.
  - **Why** Keep HTTP concerns separate from auth rules.

- **`user.controller.js`**
  - **What** User CRUD HTTP handlers.
  - **Why** Thin request/response layer.

- **`record.controller.js`**
  - **What** Record CRUD HTTP handlers.
  - **Why** Thin request/response layer.

- **`dashboard.controller.js`**
  - **What** Dashboard summary/trends HTTP handlers.
  - **Why** Thin analytics delivery layer.

## 6.7 `src/services/`

- **`auth.service.js`**
  - **What** Auth business logic, bootstrap constraints, token rotation checks.
  - **Why** Centralize security rules.

- **`token.service.js`**
  - **What** JWT sign/hash/refresh rotation helpers.
  - **Why** Single token policy implementation point.

- **`user.service.js`**
  - **What** User create/list/update/delete business rules.
  - **Why** Keep controller and repository clean.

- **`record.service.js`**
  - **What** Record create/read/update/delete business rules.
  - **Why** Domain logic separation.

- **`dashboard.service.js`**
  - **What** Summary/trends orchestration.
  - **Why** Keep controller minimal.

## 6.8 `src/repositories/`

- **`user.repository.js`**
  - **What** User data queries and soft-delete operations.
  - **Why** Isolate Mongoose query details.

- **`record.repository.js`**
  - **What** Record filters/pagination/sorting/aggregations.
  - **Why** Keep complex query logic in one place.

- **`refreshToken.repository.js`**
  - **What** Refresh token upsert/find/revoke/delete operations.
  - **Why** Token persistence abstraction.

## 6.9 `src/models/`

- **`user.model.js`**
  - **What** User schema + constraints + virtuals.
  - **Why** Data integrity for identity domain.

- **`record.model.js`**
  - **What** Record schema + indexes + metadata fields.
  - **Why** Data integrity and query performance.

- **`refreshToken.model.js`**
  - **What** Refresh token schema + TTL/unique rules.
  - **Why** Session lifecycle control and automatic cleanup.

## 6.10 `src/validators/`

- **`auth.validator.js`**
  - **What** Register/login schemas.
  - **Why** Validate auth payloads early.

- **`user.validator.js`**
  - **What** Create/update/list user schemas.
  - **Why** Enforce user API contract.

- **`record.validator.js`**
  - **What** Create/update/list record schemas.
  - **Why** Enforce record API contract.

- **`dashboard.validator.js`**
  - **What** Date range query schema.
  - **Why** Safe analytics query bounds.

## 6.11 `src/middlewares/`

- **`auth.middleware.js`**
  - **What** Access token verification and user hydration.
  - **Why** Central auth gate.

- **`role.middleware.js`**
  - **What** Role and permission gate functions.
  - **Why** Central RBAC enforcement.

- **`validate.middleware.js`**
  - **What** Body/query/params Joi validation wrappers.
  - **Why** Uniform validation errors and sanitized input.

- **`response.middleware.js`**
  - **What** Response envelope standardization.
  - **Why** Consistent API output contract.

- **`timing.middleware.js`**
  - **What** Request duration capture + logging hook.
  - **Why** Performance visibility.

- **`error.middleware.js`**
  - **What** Global error formatter/logger.
  - **Why** Predictable error response shape.

- **`notFound.middleware.js`**
  - **What** Catch-all 404 handler.
  - **Why** Explicit unknown-route behavior.

## 6.12 `src/utils/`

- **`ApiError.js`**
  - **What** Base/custom error classes.
  - **Why** Typed error strategy.

- **`asyncHandler.js`**
  - **What** Async controller wrapper.
  - **Why** Avoid repeated try/catch boilerplate.

- **`pagination.js`**
  - **What** Pagination + sorting helpers.
  - **Why** Shared list endpoint behavior.

- **`filtering.js`**
  - **What** Generic filter DSL helper.
  - **Why** Reusable filter building logic.

- **`requestContext.js`**
  - **What** AsyncLocalStorage correlation context.
  - **Why** Cross-layer request tracing.

## 6.13 `src/dtos/`

- **`user.dto.js`**
  - **What** User response mapper.
  - **Why** Prevent leaking internal fields.

- **`record.dto.js`**
  - **What** Record response mapper.
  - **Why** Consistent record output shape.

- **`dashboard.dto.js`**
  - **What** Summary/trends response mappers.
  - **Why** Stable analytics response contract.

## 6.14 `tests/`

- **`tests/setup.js`**
  - **What** Test environment variable defaults.
  - **Why** Deterministic CI/local tests.

- **`tests/app.test.js`**
  - **What** Integration tests for auth, RBAC, record create, dashboard summary.
  - **Why** Validate core behavior end-to-end.

---

## 7) GitHub Actions Test Workflow

- **Workflow File** `.github/workflows/test.yml`
- **Trigger** Push + Pull Request
- **Job** Runs Jest tests on Ubuntu
- **Node Versions** Matrix: 18 and 20
- **Install** `npm ci`
- **Test Command** `npm test`
- **Outcome** PR quality gate with reproducible CI checks

---

## 8) User-centric View (which user reaches which endpoint)

- **viewer**
  - Can call: dashboard read, auth login/refresh/logout
  - Cannot call: user management, record writes

- **analyst**
  - Can call: records read, dashboard read, auth login/refresh/logout
  - Cannot call: user management, record writes

- **admin**
  - Can call: all endpoints
  - Owns user lifecycle and record writes

---

## 9) Why this structure is used

- **Separation of concerns** by layer (route/controller/service/repository/model).
- **Security first** via centralized auth and RBAC middleware.
- **Maintainability** with constants, validators, DTOs, and reusable utils.
- **Observability** via structured logs + correlation IDs.
- **CI reliability** via GitHub Actions automated test run.
