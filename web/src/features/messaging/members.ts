/**
 * Messaging no longer owns member identity. This file re-exports the platform
 * identity accessor (@/lib/identity) so Messaging-internal imports ("../members")
 * stay stable. Other bounded contexts must import from "@/lib/identity" directly
 * (enforced by scripts/check-boundaries.mjs).
 */
export { memberById, memberName, presenceOf } from "@/lib/identity";
