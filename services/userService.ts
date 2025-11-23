
export type PlanId = 'free' | 'basic' | 'pro' | 'agency';

interface PlanConfig {
  limit: number;
  name: string;
  price: number;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: { limit: 5, name: 'Free Plan', price: 0 },
  basic: { limit: 150, name: 'Basic Plan', price: 9 },
  pro: { limit: 300, name: 'Pro Plan', price: 17 },
  agency: { limit: 600, name: 'Agency Plan', price: 30 },
};

const STORAGE_KEYS = {
  USAGE: 'clipgenius_usage',
  PLAN: 'clipgenius_plan',
  EMAIL: 'clipgenius_email'
};

export const userService = {
  getUsage: (): number => {
    return parseInt(localStorage.getItem(STORAGE_KEYS.USAGE) || '0', 10);
  },

  incrementUsage: (): number => {
    const current = userService.getUsage();
    const newCount = current + 1;
    localStorage.setItem(STORAGE_KEYS.USAGE, newCount.toString());
    return newCount;
  },

  getPlanId: (): PlanId => {
    return (localStorage.getItem(STORAGE_KEYS.PLAN) as PlanId) || 'free';
  },

  getPlanDetails: (): PlanConfig => {
    const planId = userService.getPlanId();
    return PLANS[planId];
  },

  upgradeToPlan: (planId: PlanId, email: string) => {
    localStorage.setItem(STORAGE_KEYS.PLAN, planId);
    localStorage.setItem(STORAGE_KEYS.EMAIL, email);
  },

  getLimit: (): number => {
    return userService.getPlanDetails().limit;
  },
  
  hasReachedLimit: (): boolean => {
    return userService.getUsage() >= userService.getLimit();
  },

  getRemaining: (): number => {
    return Math.max(0, userService.getLimit() - userService.getUsage());
  }
};
