/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.1 — MASTER OPERATIONS CONFIGURATION
 * Baseline operational parameters & checkpoints for Tropical Garden Resto
 */

import { OperationsConfiguration } from '../types/operations';

export const INITIAL_OPERATIONS_CONFIG: OperationsConfiguration = {
  id: 'ops-cfg-default',
  openingTime: '09:00',
  runningCheckTimes: ['11:30', '18:00'],
  closingTime: '22:00',
  defaultGraceMinutes: 15,
  autoAssignmentEnabled: false,
  requireSopAcknowledgmentForStation: true,
  strictStaffingAlerts: true,
  updatedBy: 'emp-02', // Heri Setiawan (Manager)
  updatedAt: '2026-08-01T00:00:00.000Z',
};
