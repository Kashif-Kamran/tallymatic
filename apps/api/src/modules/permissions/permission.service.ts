import { Role } from './permission.interface';
import permissions from './permissions.json';

/**
 * Check if user has permission to perform action on resource
 *
 * @param {Role[]} roles - Array of user roles e.g. ['admin', 'user'] etc.
 * @param {string} action - Action to perform e.g. 'create' or 'read' etc.
 * @param {string} resourceKind - Resource kind e.g. 'product' or 'category' etc.
 *
 * @returns {boolean}
 */
const checkPermissions = (roles: Role[], action: string, resourceKind: string): boolean => {
  const resourcePolicy = permissions.resourcePolicies.find((policy) => policy.resource === resourceKind);
  if (!resourcePolicy) {
    return false;
  }

  for (const rule of resourcePolicy.rules) {
    // Allow all actions for specific roles
    if (rule.actions.includes('*') && roles.some((role) => rule.roles.includes(role))) {
      return rule.effect === 'EFFECT_ALLOW';
    }

    if (rule.actions.includes(action) && roles.some((role) => rule.roles.includes(role))) {
      return rule.effect === 'EFFECT_ALLOW';
    }
  }

  return false;
};

export const permissionService = {
  checkPermissions,
};