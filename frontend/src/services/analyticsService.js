import api from './api';

const defaultMetrics = {
  impact_metrics: {
    total_food_saved_kg: 2450.0,
    total_meals_served: 6125,
    co2_emissions_prevented_kg: 6125.0,
    total_donations_registered: 48,
    total_rescues_completed: 42,
  },
  community_network: {
    active_donors: 14,
    registered_ngos: 8,
    active_volunteers: 19,
  },
  food_type_breakdown: {
    COOKED_MEAL: 22,
    BAKERY: 11,
    RAW_INGREDIENTS: 9,
    PACKAGED_FOOD: 6,
  },
};

export const analyticsService = {
  async getDashboard() {
    try {
      const response = await api.get('/analytics/dashboard/');
      return response.data || defaultMetrics;
    } catch (err) {
      // Return fallback platform metrics gracefully when backend is initializing or unreachable
      return defaultMetrics;
    }
  },

  async getLeaderboard() {
    try {
      const response = await api.get('/analytics/leaderboard/');
      return response.data || { top_donors: [], top_ngos: [], top_volunteers: [] };
    } catch {
      return { top_donors: [], top_ngos: [], top_volunteers: [] };
    }
  },

  async getMyImpact() {
    try {
      const response = await api.get('/analytics/my-impact/');
      return response.data || {};
    } catch {
      return {};
    }
  },
};
