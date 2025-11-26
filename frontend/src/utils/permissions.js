/**
 * Role-based permission utilities
 * Based on the proposal requirements:
 * - Admin: Full access to all endpoints
 * - Manager: Create, read, update flocks, feeding, production, health, inventory, sales, expenses
 * - Worker: Read and create feeding, production records
 * - Veterinarian: Full access to health records
 */

export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  WORKER: 'Worker',
  VETERINARIAN: 'Veterinarian'
};

/**
 * Check if user has required role(s)
 */
export const hasRole = (user, ...roles) => {
  if (!user || !user.role) return false;
  return roles.includes(user.role);
};

/**
 * Check if user can access a route
 * Realistic role-based page access:
 * - Admin: Full access to all pages
 * - Manager: Access to management pages (flocks, production, feeding, health, inventory, sales, expenses, reports)
 * - Worker: Only operational pages (production, feeding) - they record daily work
 * - Veterinarian: Health-focused access (health, flocks for context, production for context)
 */
export const canAccessRoute = (user, route) => {
  if (!user || !user.role) return false;

  const routePermissions = {
    '/dashboard': [ROLES.ADMIN, ROLES.MANAGER, ROLES.WORKER, ROLES.VETERINARIAN],
    // Flocks: Admin, Manager, Veterinarian (need to see flock info for health context)
    '/flocks': [ROLES.ADMIN, ROLES.MANAGER, ROLES.VETERINARIAN],
    // Production: Admin, Manager, Worker (workers record daily production)
    '/production': [ROLES.ADMIN, ROLES.MANAGER, ROLES.WORKER],
    // Feeding: Admin, Manager, Worker (workers record feeding)
    '/feeding': [ROLES.ADMIN, ROLES.MANAGER, ROLES.WORKER],
    // Health: Admin, Manager, Veterinarian (health professionals)
    '/health': [ROLES.ADMIN, ROLES.MANAGER, ROLES.VETERINARIAN],
    // Inventory: Admin, Manager only (management function)
    '/inventory': [ROLES.ADMIN, ROLES.MANAGER],
    // Sales: Admin, Manager only (financial management)
    '/sales': [ROLES.ADMIN, ROLES.MANAGER],
    // Expenses: Admin, Manager only (financial management)
    '/expenses': [ROLES.ADMIN, ROLES.MANAGER],
    // Reports: Admin, Manager only (management reporting)
    '/reports': [ROLES.ADMIN, ROLES.MANAGER],
    // Users: Admin only (user management)
    '/users': [ROLES.ADMIN],
    // Profile: All authenticated users can access their profile
    '/profile': [ROLES.ADMIN, ROLES.MANAGER, ROLES.WORKER, ROLES.VETERINARIAN]
  };

  const allowedRoles = routePermissions[route] || [];
  return allowedRoles.includes(user.role);
};

/**
 * Check if user can create records in a module
 * Note: Users can only create if they have access to the page
 */
export const canCreate = (user, module) => {
  if (!user || !user.role) return false;

  // Admin can create everything
  if (user.role === ROLES.ADMIN) return true;

  const createPermissions = {
    flocks: [ROLES.MANAGER], // Only Manager (Workers/Vets don't have access to flocks page)
    production: [ROLES.MANAGER, ROLES.WORKER], // Manager and Worker can create
    feeding: [ROLES.MANAGER, ROLES.WORKER], // Manager and Worker can create
    health: [ROLES.MANAGER, ROLES.VETERINARIAN], // Manager and Veterinarian can create
    inventory: [ROLES.MANAGER], // Only Manager (Workers don't have access to inventory page)
    sales: [ROLES.MANAGER], // Only Manager (Workers don't have access to sales page)
    expenses: [ROLES.MANAGER] // Only Manager (Workers don't have access to expenses page)
  };

  const allowedRoles = createPermissions[module] || [];
  return allowedRoles.includes(user.role);
};

/**
 * Check if user can update records in a module
 * Note: Users can only update if they have access to the page
 */
export const canUpdate = (user, module) => {
  if (!user || !user.role) return false;

  // Admin can update everything
  if (user.role === ROLES.ADMIN) return true;

  const updatePermissions = {
    flocks: [ROLES.MANAGER], // Only Manager
    production: [ROLES.MANAGER], // Only Manager (Workers can create but not update)
    feeding: [ROLES.MANAGER], // Only Manager (Workers can create but not update)
    health: [ROLES.MANAGER, ROLES.VETERINARIAN], // Manager and Veterinarian
    inventory: [ROLES.MANAGER], // Only Manager
    sales: [ROLES.MANAGER], // Only Manager
    expenses: [ROLES.MANAGER] // Only Manager
  };

  const allowedRoles = updatePermissions[module] || [];
  return allowedRoles.includes(user.role);
};

/**
 * Check if user can delete records in a module
 */
export const canDelete = (user, module) => {
  if (!user || !user.role) return false;

  // Only Admin can delete (except health where Manager/Vet can delete their own)
  if (user.role === ROLES.ADMIN) return true;

  // Manager can delete production and feeding records
  if (user.role === ROLES.MANAGER) {
    return ['production', 'feeding'].includes(module);
  }

  return false;
};

/**
 * Check if user can view financial reports
 */
export const canViewFinancialReports = (user) => {
  if (!user || !user.role) return false;
  return [ROLES.ADMIN, ROLES.MANAGER].includes(user.role);
};

/**
 * Check if user can manage users
 */
export const canManageUsers = (user) => {
  if (!user || !user.role) return false;
  return [ROLES.ADMIN, ROLES.MANAGER].includes(user.role);
};

/**
 * Check if user can delete users
 */
export const canDeleteUsers = (user) => {
  if (!user || !user.role) return false;
  return user.role === ROLES.ADMIN;
};

