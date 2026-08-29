/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — Salary Management Entry View
 */

import React from 'react';
import { User } from '../../types';
import { SalaryManagementView as SalaryManagementViewInner } from './payroll/SalaryManagementView';

interface SalaryManagementViewProps {
  user?: User;
}

export const SalaryManagementView: React.FC<SalaryManagementViewProps> = ({ user }) => {
  const currentUserId = user?.id || 'emp-02';
  const userRole = (user?.role || 'MANAGER').toUpperCase();

  return <SalaryManagementViewInner currentUserId={currentUserId} userRole={userRole} />;
};
