/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PHASE 3.4 — ISSUE SLA BADGE
 * Renders live SLA status badge ("Dalam SLA" vs "SLA Terlewati") with target response time
 */

import React from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { OperationalIssue } from '../../../types/operationalIssue';
import { isSlaBreached } from '../../../services/operationalIssueService';

interface IssueSlaBadgeProps {
  issue: OperationalIssue;
  showDetails?: boolean;
}

export const IssueSlaBadge: React.FC<IssueSlaBadgeProps> = ({ issue, showDetails = false }) => {
  const breached = isSlaBreached(issue);

  if (breached) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse`}
      >
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
        SLA Terlewati
        {showDetails && (
          <span className="text-[10px] text-rose-200/80 font-mono">
            ({issue.slaMinutes}m Target)
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30`}
    >
      <Clock className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
      Dalam SLA
      {showDetails && (
        <span className="text-[10px] text-emerald-200/80 font-mono">
          ({issue.slaMinutes}m Target)
        </span>
      )}
    </span>
  );
};
