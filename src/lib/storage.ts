export type CalculatorType = 'sip' | 'emi' | 'goal' | 'retirement' | 'affordability' | 'home_purchase' | 'staggered_fd' | 'basic_fd' | 'buy_vs_rent';

export interface SavedScenario {
  id: string;
  type: CalculatorType;
  name: string;
  timestamp: number;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

const STORAGE_KEY = 'whatiff_saved_scenarios';

export const storage = {
  saveScenario: (scenario: Omit<SavedScenario, 'id' | 'timestamp'>) => {
    const scenarios = storage.getScenarios();
    const newScenario: SavedScenario = {
      ...scenario,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newScenario, ...scenarios]));
    return newScenario;
  },

  getScenarios: (): SavedScenario[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  deleteScenario: (id: string) => {
    const scenarios = storage.getScenarios();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios.filter(s => s.id !== id)));
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
