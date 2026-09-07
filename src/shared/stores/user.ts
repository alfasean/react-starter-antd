import { atom } from 'jotai';
import type { AppUser } from '@/shared/types';

/**
 * Client-only copy of the signed-in user.
 *
 * This is legitimate client state: it is written once at sign-in and read
 * synchronously all over the shell. Server data must NOT be mirrored into
 * atoms like this — see .claude/rules/state-management.md.
 */
export const userAtom = atom<AppUser | undefined>(undefined);
