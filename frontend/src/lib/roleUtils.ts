// frontend/src/lib/roleUtils.ts
// Rolės prioriteto logikos utility funkcijos
// CHANGE: Atnaujinta rolės sistema - 'admin' pakeista į 'manager' ir tvarkyta prioritetų hierarchija

export type UserRole = 'manager' | 'curator' | 'mentor' | 'parent' | 'student';

// Rolės prioritetai (1 = aukščiausias, 5 = žemiausias)
// CHANGE: Atnaujinta prioritetų tvarka pagal reikalavimus: manager > curator > mentor > parent > student
const ROLE_PRIORITIES: Record<UserRole, number> = {
  manager: 1,
  curator: 2,
  mentor: 3,
  parent: 4,
  student: 5,
};

/**
 * Grąžina aukščiausią vartotojo rolę pagal prioritetą
 * @param roles - vartotojo rolių masyvas
 * @returns aukščiausia rolė arba 'student' jei rolių nėra
 */
export function getHighestRole(roles: UserRole[]): UserRole {
  if (!roles || roles.length === 0) {
    return 'student';
  }

  let highestRole: UserRole = 'student';
  let highestPriority = ROLE_PRIORITIES.student;

  for (const role of roles) {
    if (ROLE_PRIORITIES[role] < highestPriority) {
      highestRole = role;
      highestPriority = ROLE_PRIORITIES[role];
    }
  }

  return highestRole;
}

/**
 * Grąžina dashboard URL pagal rolę
 * @param role - vartotojo rolė
 * @returns dashboard URL
 */
export function getDashboardUrl(role: UserRole): string {
  const roleToPath: Record<UserRole, string> = {
    manager: 'managers',
    curator: 'curators',
    mentor: 'mentors',
    parent: 'parents',
    student: 'students',
  };
  return `/dashboard/${roleToPath[role]}`;
}

/**
 * Grąžina dashboard URL pagal aukščiausią rolę
 * @param roles - vartotojo rolių masyvas
 * @returns dashboard URL
 */
export function getDashboardUrlByRoles(roles: UserRole[]): string {
  const highestRole = getHighestRole(roles);
  return getDashboardUrl(highestRole);
}

/**
 * Patikrina ar vartotojas turi nurodytą rolę
 * @param userRoles - vartotojo rolių masyvas
 * @param requiredRole - reikalinga rolė
 * @returns true jei vartotojas turi reikalingą rolę
 */
export function hasRole(userRoles: UserRole[], requiredRole: UserRole): boolean {
  return userRoles.includes(requiredRole);
}

/**
 * Patikrina ar vartotojas turi bent vieną iš nurodytų rolių
 * @param userRoles - vartotojo rolių masyvas
 * @param requiredRoles - reikalingų rolių masyvas
 * @returns true jei vartotojas turi bent vieną reikalingą rolę
 */
export function hasAnyRole(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Grąžina rolių pavadinimus lietuvių kalba
 * @param role - rolė
 * @returns rolių pavadinimas lietuvių kalba
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    manager: 'Sistemos valdytojas',
    curator: 'Kuratorius',
    mentor: 'Mentorius',
    parent: 'Tėvas',
    student: 'Studentas',
  };

  return roleNames[role] || role;
}
