import type { User } from '../types';

/**
 * Mock users representing actual plant positions.
 * In a real plant, these map to real people with badges.
 */
export const MOCK_USERS: User[] = [
  {
    id: 'u-001',
    username: 'rmorales',
    fullName: 'Roberto Morales',
    role: 'plant_manager',
    permissions: [
      'formula:read', 'formula:read_percentages', 'formula:create', 'formula:version', 'formula:archive',
      'production:request', 'production:authorize', 'production:execute', 'production:record_deviation', 'production:close',
      'qc:enter_results', 'qc:disposition', 'qc:manage_ncr',
      'inventory:receive', 'inventory:pick', 'inventory:adjust', 'inventory:cycle_count',
      'purchasing:create_po', 'purchasing:approve_po', 'purchasing:three_way_match',
      'sales:create_order', 'sales:approve_order', 'sales:ship', 'sales:issue_dte',
      'accounting:journal_entry', 'accounting:bank_recon', 'accounting:close_period',
      'admin:manage_users', 'admin:manage_roles', 'admin:view_audit',
    ],
    defaultMode: 'office',
    active: true,
    lastLogin: '2026-01-29T08:15:00Z',
    createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'u-002',
    username: 'acastro',
    fullName: 'Ana Castro',
    role: 'production_supervisor',
    permissions: [
      'formula:read', 'formula:read_percentages',
      'production:request', 'production:authorize', 'production:execute', 'production:record_deviation',
      'inventory:pick',
      'qc:enter_results',
    ],
    defaultMode: 'office',
    active: true,
    lastLogin: '2026-01-29T07:30:00Z',
    createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'u-003',
    username: 'jlopez',
    fullName: 'José López',
    role: 'operator',
    permissions: [
      'formula:read', // reads instructions, NOT percentages
      'production:execute',
      'production:record_deviation',
    ],
    defaultMode: 'plant',
    plantAreas: ['mixing', 'filling'],
    active: true,
    lastLogin: '2026-01-29T06:00:00Z',
    createdAt: '2024-06-15T00:00:00Z',
  },
  {
    id: 'u-004',
    username: 'mreyes',
    fullName: 'María Reyes',
    role: 'qc_technician',
    permissions: [
      'qc:enter_results',
      'formula:read',
    ],
    defaultMode: 'office',
    active: true,
    lastLogin: '2026-01-29T07:45:00Z',
    createdAt: '2024-04-01T00:00:00Z',
  },
  {
    id: 'u-005',
    username: 'cflores',
    fullName: 'Carlos Flores',
    role: 'warehouse',
    permissions: [
      'inventory:receive', 'inventory:pick', 'inventory:cycle_count',
    ],
    defaultMode: 'plant',
    plantAreas: ['warehouse', 'receiving'],
    active: true,
    lastLogin: '2026-01-29T06:15:00Z',
    createdAt: '2024-05-01T00:00:00Z',
  },
  {
    id: 'u-006',
    username: 'lmartinez',
    fullName: 'Laura Martínez',
    role: 'sales',
    permissions: [
      'sales:create_order', 'sales:approve_order', 'sales:ship', 'sales:issue_dte',
      'inventory:pick',
    ],
    defaultMode: 'office',
    active: true,
    lastLogin: '2026-01-28T16:30:00Z',
    createdAt: '2024-03-15T00:00:00Z',
  },
  {
    id: 'u-007',
    username: 'phernandez',
    fullName: 'Pedro Hernández',
    role: 'accounting',
    permissions: [
      'accounting:journal_entry', 'accounting:bank_recon', 'accounting:close_period',
    ],
    defaultMode: 'office',
    active: true,
    lastLogin: '2026-01-28T17:00:00Z',
    createdAt: '2024-03-01T00:00:00Z',
  },
];
