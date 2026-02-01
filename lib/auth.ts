// Simple role-based auth helper (can be enhanced with proper OTP auth later)

export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN'

export function getUserRole(): UserRole {
  if (typeof window === 'undefined') return 'CUSTOMER'
  
  const role = localStorage.getItem('userRole')
  return (role as UserRole) || 'CUSTOMER'
}

export function setUserRole(role: UserRole) {
  if (typeof window === 'undefined') return
  localStorage.setItem('userRole', role)
}

export function clearUserRole() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('userRole')
}

export function hasAccess(requiredRole: UserRole, userRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    CUSTOMER: 1,
    STAFF: 2,
    ADMIN: 3,
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
