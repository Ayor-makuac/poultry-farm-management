import { 
  ROLES, 
  hasRole, 
  canAccessRoute, 
  canCreate, 
  canUpdate, 
  canDelete,
  canViewFinancialReports 
} from '../permissions';

describe('Permissions Utilities', () => {
  const adminUser = { role: ROLES.ADMIN };
  const managerUser = { role: ROLES.MANAGER };
  const workerUser = { role: ROLES.WORKER };
  const vetUser = { role: ROLES.VETERINARIAN };

  describe('hasRole', () => {
    it('returns true if user has the required role', () => {
      expect(hasRole(adminUser, ROLES.ADMIN)).toBe(true);
      expect(hasRole(managerUser, ROLES.MANAGER)).toBe(true);
    });

    it('returns false if user does not have the required role', () => {
      expect(hasRole(workerUser, ROLES.ADMIN)).toBe(false);
      expect(hasRole(adminUser, ROLES.WORKER)).toBe(false);
    });

    it('returns false for null or undefined user', () => {
      expect(hasRole(null, ROLES.ADMIN)).toBe(false);
      expect(hasRole(undefined, ROLES.ADMIN)).toBe(false);
    });
  });

  describe('canAccessRoute', () => {
    it('allows Admin to access all routes', () => {
      expect(canAccessRoute(adminUser, '/dashboard')).toBe(true);
      expect(canAccessRoute(adminUser, '/users')).toBe(true);
      expect(canAccessRoute(adminUser, '/flocks')).toBe(true);
      expect(canAccessRoute(adminUser, '/sales')).toBe(true);
    });

    it('allows Manager to access management routes', () => {
      expect(canAccessRoute(managerUser, '/dashboard')).toBe(true);
      expect(canAccessRoute(managerUser, '/flocks')).toBe(true);
      expect(canAccessRoute(managerUser, '/sales')).toBe(true);
      expect(canAccessRoute(managerUser, '/users')).toBe(false);
    });

    it('restricts Worker to operational routes only', () => {
      expect(canAccessRoute(workerUser, '/dashboard')).toBe(true);
      expect(canAccessRoute(workerUser, '/production')).toBe(true);
      expect(canAccessRoute(workerUser, '/feeding')).toBe(true);
      expect(canAccessRoute(workerUser, '/sales')).toBe(false);
      expect(canAccessRoute(workerUser, '/expenses')).toBe(false);
      expect(canAccessRoute(workerUser, '/users')).toBe(false);
    });

    it('allows Veterinarian to access health-related routes', () => {
      expect(canAccessRoute(vetUser, '/dashboard')).toBe(true);
      expect(canAccessRoute(vetUser, '/health')).toBe(true);
      expect(canAccessRoute(vetUser, '/flocks')).toBe(true);
      expect(canAccessRoute(vetUser, '/sales')).toBe(false);
    });

    it('allows all authenticated users to access profile', () => {
      expect(canAccessRoute(adminUser, '/profile')).toBe(true);
      expect(canAccessRoute(managerUser, '/profile')).toBe(true);
      expect(canAccessRoute(workerUser, '/profile')).toBe(true);
      expect(canAccessRoute(vetUser, '/profile')).toBe(true);
    });
  });

  describe('canCreate', () => {
    it('allows Admin to create everything', () => {
      expect(canCreate(adminUser, 'flocks')).toBe(true);
      expect(canCreate(adminUser, 'production')).toBe(true);
      expect(canCreate(adminUser, 'sales')).toBe(true);
    });

    it('allows Manager to create most resources', () => {
      expect(canCreate(managerUser, 'flocks')).toBe(true);
      expect(canCreate(managerUser, 'production')).toBe(true);
      expect(canCreate(managerUser, 'sales')).toBe(true);
    });

    it('allows Worker to create production and feeding records', () => {
      expect(canCreate(workerUser, 'production')).toBe(true);
      expect(canCreate(workerUser, 'feeding')).toBe(true);
      expect(canCreate(workerUser, 'flocks')).toBe(false);
      expect(canCreate(workerUser, 'sales')).toBe(false);
    });
  });

  describe('canUpdate', () => {
    it('allows Admin to update everything', () => {
      expect(canUpdate(adminUser, 'flocks')).toBe(true);
      expect(canUpdate(adminUser, 'production')).toBe(true);
    });

    it('allows Manager to update most resources', () => {
      expect(canUpdate(managerUser, 'flocks')).toBe(true);
      expect(canUpdate(managerUser, 'production')).toBe(true);
    });

    it('restricts Worker from updating', () => {
      expect(canUpdate(workerUser, 'production')).toBe(false);
      expect(canUpdate(workerUser, 'feeding')).toBe(false);
    });
  });

  describe('canDelete', () => {
    it('allows Admin to delete everything', () => {
      expect(canDelete(adminUser, 'flocks')).toBe(true);
      expect(canDelete(adminUser, 'production')).toBe(true);
    });

    it('allows Manager to delete production and feeding', () => {
      expect(canDelete(managerUser, 'production')).toBe(true);
      expect(canDelete(managerUser, 'feeding')).toBe(true);
      expect(canDelete(managerUser, 'flocks')).toBe(false);
    });

    it('restricts Worker from deleting', () => {
      expect(canDelete(workerUser, 'production')).toBe(false);
    });
  });

  describe('canViewFinancialReports', () => {
    it('allows Admin and Manager to view financial reports', () => {
      expect(canViewFinancialReports(adminUser)).toBe(true);
      expect(canViewFinancialReports(managerUser)).toBe(true);
    });

    it('restricts Worker and Veterinarian from viewing financial reports', () => {
      expect(canViewFinancialReports(workerUser)).toBe(false);
      expect(canViewFinancialReports(vetUser)).toBe(false);
    });
  });
});

