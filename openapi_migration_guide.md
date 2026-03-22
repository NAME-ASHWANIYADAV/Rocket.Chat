# Rocket.Chat OpenAPI Migration Guide (Advanced Deep Dive)

This guide documents the exact end-to-end process for migrating legacy `API.v1.addRoute` endpoints to the modern Rocket.Chat OpenAPI architecture. It incorporates all feedback, architecture decisions, and "gotchas" discovered during PR #39506 (Livechat configurations).

---

## 1. The Core Objective
The goal is to move from loosely-typed, manual REST API definitions to a strongly-typed, auto-validating OpenAPI model.
1. Use **chained methods** (`.get().post().put().delete()`) instead of `addRoute`.
2. Introduce strict **AJV runtime validation** for request parameters/body and API responses.
3. Use **Typia** to automatically generate OpenAPI schemas from TypeScript interfaces.
4. Eliminate manual typing in `rest-typings` by using `ExtractRoutesFromAPI`.

---

## 2. Step-by-Step Migration Process

### Step 2.1: Converting the Endpoint
Locate the target endpoint (e.g., in `apps/meteor/app/livechat/server/api/v1/name.ts`).

**Old Pattern (Legacy):**
```typescript
API.v1.addRoute(
	'livechat/endpoint.name',
	{ authRequired: true, permissionsRequired: ['view-permission'] },
	{
		async get() {
			return API.v1.success({ data: await getData() });
		}
	}
);
```

**New Pattern (OpenAPI):**
```typescript
const livechatEndpointName = API.v1.get(
	'livechat/endpoint.name',
	{
		authRequired: true,
		permissionsRequired: ['view-permission'],
		// Add input validation (query, body, params)
		query: isGETEndpointNameParams, // AJV compiled validator
		response: {
			// Add output validation
			401: validateUnauthorizedErrorResponse, // Standard error response
			200: ajv.compile<{ data: IDataType; success: boolean }>({
				type: 'object',
				properties: {
					data: { $ref: '#/components/schemas/IDataType' },
					success: { type: 'boolean', enum: [true] },
				},
				required: ['data', 'success'],
				additionalProperties: false, // CRITICAL: Always use additionalProperties: false
			}),
		},
	},
	async function action() {
		// Business logic remains exactly the same!
		return API.v1.success({ data: await getData() });
	}
);
```

### Step 2.2: Updating Typings (Module Augmentation)
At the bottom of your endpoint file, remove the need for manual `rest-typings` by using module augmentation to infer types natively from your route definition.

```typescript
import type { ExtractRoutesFromAPI } from '../../../../api/server/ApiClass';

type LivechatEndpointNameEndpoints = ExtractRoutesFromAPI<typeof livechatEndpointName>;

declare module '@rocket.chat/rest-typings' {
	// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-empty-interface
	interface Endpoints extends LivechatEndpointNameEndpoints {}
}
```

### Step 2.3: Cleaning up `rest-typings`
Go to `packages/rest-typings/src/v1/category.ts` (e.g., `omnichannel.ts`) and **delete** the old manual definition for the endpoint.

> ⚠️ **CRITICAL TRAP — The SDK Legacy Rule**: If the endpoint is consumed by external SDKs (like `@rocket.chat/ddp-client`), **do not delete the manual typing**. Keep it, but ensure it perfectly matches the new runtime return signature. 
> 
> *How to know?* Search for the endpoint string (e.g., `'/v1/livechat/config'`) globally. If it appears in `packages/ddp-client/src/`, you must keep the signature in `omnichannel.ts`. If the runtime object contains deep nested configurations that generic TS cannot infer, widen types safely (e.g., `Record<string, unknown>`) to avoid breaking the `ddp-client` compilation.

---

## 3. Handling Complex Errors (The `ISetting` / `$ref` Nightmare)

During the migration, you may encounter a `MissingRefError` when your server boots:
`Error: can't resolve reference #/components/schemas/ISetting from id #`

This happens for two interconnected reasons. Here is how to fix them both:

### Bug 1: Typia Union Unrolling
**The Problem:** If an interface is highly complex or made of Union types (like `ISetting = ISettingBase | ISettingColor | ...`), Typia will "unroll" the type into its individual components. It will NOT generate a root schema key named `ISetting`. If the key doesn't exist, AJV cannot reference it via `$ref`.

**The Fix:**
Open `packages/core-typings/src/Ajv.ts`.
You must instruct Typia to treat `ISetting` as a distinct entity by adding it as a separate tuple element in the schema generator.

```typescript
// Before:
export const schemas = typia.json.schemas<[ (ISubscription | IMessage ... ) ], '3.0'>();

// After: Move the problematic type outside the massive union into its own tuple spot
export const schemas = typia.json.schemas<
	[
		(ISubscription | IMessage ... ),
		ISetting // <--- Added here
	],
	'3.0'
>();
```
**After changing this, you MUST run:** `yarn build` inside the `Rocket.Chat` root to re-generate the Typia schemas.

### Bug 2: Meteor Load Order Execution (The Universal `livechat/` Trap)
**The Problem:** Meteor eagerly loads the `apps/meteor/app/livechat/` directory *before* it loads `apps/meteor/app/api/server/ajv.ts` (the global schema registry). When your `config.ts` or `integrations.ts` file calls `ajv.compile({ $ref: '...' })`, the global AJV registry is empty, causing a crash. **This affects ANY complex type** (`IOmnichannelRoom`, `ILivechatAgent`, `ISetting`, etc.), not just Unions.

**The Fix:**
You must manually register the specific Typia schemas you need at the very top of your endpoint file, *before* defining the endpoint. (We created a helper array for this in our PR).

```typescript
import { schemas } from '@rocket.chat/core-typings';
import { ajv } from '@rocket.chat/rest-typings';

// Register ALL complex schemas used in this file for $ref resolution
const schemaComponents = schemas.components?.schemas;
(['IOmnichannelRoom', 'ILivechatAgent', 'ILivechatVisitor', 'ISetting'] as const).forEach((key) => {
	const schema = schemaComponents?.[key];
	if (schema && !ajv.getSchema(`#/components/schemas/${key}`)) {
		ajv.addSchema(schema, `#/components/schemas/${key}`);
	}
});

// Now you can safely use $ref in ajv.compile() below
```

---

## 4. The Golden Rules of Review & Testing (Ahmed's Rubric)

If you submit a PR without meticulously verifying these, Ahmed or the Code Owners will reject it:

1. **Strict Contract Matching (The "Guest" Trap)**: Your new response schema MUST exactly match the old REST typing. If the old typing returned `guest?: ILivechatVisitor`, your new schema, generic typing `ajv.compile<T>`, and runtime logic MUST include `guest`. Do not arbitrarily drop properties, even if they seem unused.
2. **Schema Strictness**: Always include `additionalProperties: false` on the root of your response schemas. This guarantees the API only returns exactly what it promises, preventing data overflow and AJV warnings in the CI logs.
3. **Double Check HTTP Status Codes**: The new chained pattern returns `401 Unauthorized` automatically if `authRequired: true` fails. The old `addRoute` sometimes returned `400 Bad Request`. **Check the `testapi` assertions.** If a test explicitly expects `Got 400`, but your new migration returns `401`, you may need to update the test or align the permissions strictly.
4. **No Local Server Crashes**: Boot the server locally (`yarn dev`). If there's a `MissingRefError` or schema compilation error, the terminal will crash immediately on boot. Test this before pushing.
5. **Swagger Verification**: Navigate to `http://localhost:3000/api-docs`. Find your migrated endpoint. Verify that the 200, 400, and 401 schemas render perfectly.
6. **The Final Boss (`testapi`)**: **Swagger is a byproduct of success, not proof of it.** You MUST run the backend integration tests. 
    ```bash
    cd apps/meteor
    yarn testapi:livechat # Or the relevant module
    ```
    If any non-EE test fails, your migration broke an API contract. Investigate the `400 Bad Request` or `500 Internal Server Error` and fix your AJV schema or action logic.

---

## Summary Checklist for your next PR:
- [ ] Chained `.get()/.post()` used?
- [ ] `$ref` used for complex core-typings instead of inline objects?
- [ ] Typia issues identified and schemas rebuilt (`yarn build`)?
- [ ] Local schema registration workaround used if in a fast-loading module like `livechat/`?
- [ ] Type inferred via `ExtractRoutesFromAPI`?
- [ ] Manual typings deleted from `rest-typings` (unless SDK requires it)?
- [ ] Server boots without `MissingRefError`?
- [ ] Test HTTP status codes verify against new auth guards?
- [ ] Swagger UI generates perfectly?
- [ ] `yarn testapi` passes successfully?
