// frontend/src/hooks/useWeekInfo.ts

// DEPRECATED: This hook is deprecated in favor of WeekInfoContext
// Use useWeekInfoContext from @/contexts/WeekInfoContext instead
// CHANGE: Marked as deprecated - use WeekInfoContext for server-side data consistency

import { useWeekInfoContext } from '@/contexts/WeekInfoContext';

/**
 * @deprecated Use useWeekInfoContext from @/contexts/WeekInfoContext instead
 * This hook is kept for backward compatibility but should not be used in new code
 */
const useWeekInfo = () => {
  console.warn('useWeekInfo hook is deprecated. Use useWeekInfoContext from @/contexts/WeekInfoContext instead.');
  return useWeekInfoContext();
};

export default useWeekInfo;

