/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agencies from "../agencies.js";
import type * as ai__clients from "../ai/_clients.js";
import type * as ai__helpers from "../ai/_helpers.js";
import type * as ai__prompts from "../ai/_prompts.js";
import type * as ai_extractImageStyle from "../ai/extractImageStyle.js";
import type * as ai_generatePost from "../ai/generatePost.js";
import type * as ai_interpretTemplate from "../ai/interpretTemplate.js";
import type * as approvals from "../approvals.js";
import type * as auth from "../auth.js";
import type * as brandContentBuckets from "../brandContentBuckets.js";
import type * as brandImport from "../brandImport.js";
import type * as brandPersonas from "../brandPersonas.js";
import type * as brands from "../brands.js";
import type * as generatedPosts from "../generatedPosts.js";
import type * as http from "../http.js";
import type * as submissions from "../submissions.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agencies: typeof agencies;
  "ai/_clients": typeof ai__clients;
  "ai/_helpers": typeof ai__helpers;
  "ai/_prompts": typeof ai__prompts;
  "ai/extractImageStyle": typeof ai_extractImageStyle;
  "ai/generatePost": typeof ai_generatePost;
  "ai/interpretTemplate": typeof ai_interpretTemplate;
  approvals: typeof approvals;
  auth: typeof auth;
  brandContentBuckets: typeof brandContentBuckets;
  brandImport: typeof brandImport;
  brandPersonas: typeof brandPersonas;
  brands: typeof brands;
  generatedPosts: typeof generatedPosts;
  http: typeof http;
  submissions: typeof submissions;
  waitlist: typeof waitlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
