// frontend/src/components/layout/Navigation/index.ts

// Navigation komponentų eksportas
// Eksportuoja visus navigation komponentus viename faile
// CHANGE: Sukurtas index.ts failas navigation komponentų eksportui

export { default as BaseNavigation } from './BaseNavigation';
export { default as MobileNavigation } from './MobileNavigation';

// Role-specific navigation exports
export { default as ManagerNavigation } from './roles/ManagerNavigation';
export { default as CuratorNavigation } from './roles/CuratorNavigation';
export { default as MentorNavigation } from './roles/MentorNavigation';
export { default as StudentNavigation } from './roles/StudentNavigation';
export { default as ParentNavigation } from './roles/ParentNavigation';
