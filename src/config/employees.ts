import { Employee } from '../types/employee';
import { INITIAL_EMPLOYEES } from '../data/employees';

/**
 * MASTER PERSONNEL OF TROPICAL GARDEN RESTO
 * Single Source of Truth
 */
export const MASTER_EMPLOYEES: Employee[] = INITIAL_EMPLOYEES;

/** Default logged in persona: Super Admin (Owner / Executive) */
export const DEFAULT_EMPLOYEE_ID = 'emp-superadmin';
