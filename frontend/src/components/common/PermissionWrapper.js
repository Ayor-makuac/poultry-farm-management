import React from 'react';
import { canCreate, canUpdate, canDelete } from '../../utils/permissions';
import { useAuth } from '../../context/AuthContext';

const PermissionWrapper = ({ children, module, action = 'view' }) => {
  const { user } = useAuth();

  if (!user) return null;

  let hasPermission = false;

  switch (action) {
    case 'create':
      hasPermission = canCreate(user, module);
      break;
    case 'update':
      hasPermission = canUpdate(user, module);
      break;
    case 'delete':
      hasPermission = canDelete(user, module);
      break;
    default:
      hasPermission = true; // View is default, all authenticated users can view
  }

  if (!hasPermission) return null;

  return <>{children}</>;
};

export default PermissionWrapper;

