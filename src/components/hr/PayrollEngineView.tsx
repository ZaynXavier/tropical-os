/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TROPICALOS — Payroll Engine / Dashboard Entry View
 */

import React from 'react';
import { User } from '../../types';
import { PayrollDashboardView } from './payroll/PayrollDashboardView';

interface PayrollEngineViewProps {
  user?: User;
}

export const PayrollEngineView: React.FC<PayrollEngineViewProps> = ({ user }) => {
  const currentUserId = user?.id || 'emp-02';
  const userRole = (user?.role || 'MANAGER').toUpperCase();

  return <PayrollDashboardView currentUserId={currentUserId} userRole={userRole} />;
};
