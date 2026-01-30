/**
 * Authentication & Authorization Domain Types
 *
 * RBAC in a chemical plant is not about feature flags.
 * It's about who can see the formula, who can release a lot,
 * who can authorize a production order (and critically, who CANNOT
 * authorize one they themselves requested).
 *
 * Field-level visibility matters: an operator sees instructions
 * but never ingredient percentages. A QC tech sees test specs
 * but not production costs. This is IP protection, not UX preference.
 */

/** Operational roles — these map to real plant positions */
export type Role =
  | 'plant_manager'       // sees everything, authorizes production
  | 'production_supervisor' // manages orders, sees formulas (no edit)
  | 'operator'            // executes protocols, records weights — never sees %
  | 'qc_technician'       // runs tests, enters results, generates COAs
  | 'qc_manager'          // dispositions lots, manages NCRs
  | 'warehouse'           // receives materials, picks orders, cycle counts
  | 'purchasing'          // POs, supplier management, three-way match
  | 'sales'               // quotes, orders, shipping, DTE
  | 'accounting'          // GL, journals, bank recon — reads everything financial
  | 'credit_collector'    // aging, collections workflow
  | 'admin'               // user management, system config — no operational access
  | 'readonly';           // auditors, consultants — see, never touch

/** What a permission controls — granular, not just CRUD */
export type Permission =
  // Formula
  | 'formula:read'
  | 'formula:read_percentages'   // the sensitive one
  | 'formula:create'
  | 'formula:version'
  | 'formula:archive'
  // Production
  | 'production:request'
  | 'production:authorize'       // cannot be same person who requested
  | 'production:execute'
  | 'production:record_deviation'
  | 'production:close'
  // QC
  | 'qc:enter_results'
  | 'qc:disposition'             // release/reject/rework a lot
  | 'qc:manage_ncr'
  // Inventory
  | 'inventory:receive'
  | 'inventory:pick'
  | 'inventory:adjust'
  | 'inventory:cycle_count'
  // Purchasing
  | 'purchasing:create_po'
  | 'purchasing:approve_po'
  | 'purchasing:three_way_match'
  // Sales
  | 'sales:create_order'
  | 'sales:approve_order'
  | 'sales:ship'
  | 'sales:issue_dte'
  // Accounting
  | 'accounting:journal_entry'
  | 'accounting:bank_recon'
  | 'accounting:close_period'
  // Admin
  | 'admin:manage_users'
  | 'admin:manage_roles'
  | 'admin:view_audit';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  permissions: Permission[];
  /** Which UI mode this user defaults to */
  defaultMode: 'office' | 'plant';
  /** Plant floor operators may be restricted to specific areas */
  plantAreas?: string[];
  active: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
  mode: 'office' | 'plant';
}
