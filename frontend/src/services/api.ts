// Baghewala WellTwin AI - API Client Service
// Communicates with FastAPI backend running on localhost:8000

const API_BASE = 'http://localhost:8000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    let msg = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const parsed = JSON.parse(errorText);
      msg = parsed.detail || parsed.error || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Wells
  async getWells() {
    const res = await fetch(`${API_BASE}/wells`);
    return handleResponse<any[]>(res);
  },
  async getWell(id: string) {
    const res = await fetch(`${API_BASE}/wells/${id}`);
    return handleResponse<any>(res);
  },

  // Dashboard
  async getDashboard(id: string) {
    const res = await fetch(`${API_BASE}/dashboard/${id}`);
    return handleResponse<any>(res);
  },

  // Digital Twin
  async getDigitalTwin(id: string) {
    const res = await fetch(`${API_BASE}/digital-twin/${id}`);
    return handleResponse<any>(res);
  },

  // CSS Operations
  async getCss(id: string) {
    const res = await fetch(`${API_BASE}/css/${id}`);
    return handleResponse<any>(res);
  },

  // SRP Operations
  async getSrp(id: string) {
    const res = await fetch(`${API_BASE}/srp/${id}`);
    return handleResponse<any>(res);
  },

  // AI Prediction
  async runPrediction(payload: {
    well_id: string;
    horizon_days: number;
    spm?: number;
    vfd_hz?: number;
    steam_volume_tons?: number;
    soak_days?: number;
  }) {
    const res = await fetch(`${API_BASE}/prediction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<any>(res);
  },
  async getModelMetrics() {
    const res = await fetch(`${API_BASE}/prediction/metrics`);
    return handleResponse<any>(res);
  },

  // What-If Simulation
  async runWhatIf(payload: {
    well_id: string;
    steam_volume_tons: number;
    injection_pressure_bar: number;
    soak_days: number;
    production_cutoff_temp_c: number;
    srp_stroke_in: number;
    srp_spm: number;
    srp_vfd_hz: number;
  }) {
    const res = await fetch(`${API_BASE}/what-if`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<any>(res);
  },

  // Multi-Objective Optimization
  async runOptimization(payload: {
    well_id: string;
    weights: {
      production_weight: number;
      steam_efficiency_weight: number;
      energy_efficiency_weight: number;
      equipment_reliability_weight: number;
    };
  }) {
    const res = await fetch(`${API_BASE}/optimization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<any>(res);
  },

  // Predictive Maintenance
  async getMaintenance(id: string) {
    const res = await fetch(`${API_BASE}/maintenance/${id}`);
    return handleResponse<any>(res);
  },

  // Smart Alerts
  async getAlerts(filters: { well_id?: string; category?: string; status?: string; search?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.well_id) params.append('well_id', filters.well_id);
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    const res = await fetch(`${API_BASE}/alerts?${params.toString()}`);
    return handleResponse<any[]>(res);
  },
  async acknowledgeAlert(id: number, operatorName: string = 'Field Operator') {
    const res = await fetch(`${API_BASE}/alerts/${id}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operator_name: operatorName, action: 'ACKNOWLEDGE' })
    });
    return handleResponse<any>(res);
  },
  async resolveAlert(id: number, operatorName: string = 'Field Operator') {
    const res = await fetch(`${API_BASE}/alerts/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operator_name: operatorName, action: 'RESOLVE' })
    });
    return handleResponse<any>(res);
  },
  async generateAlert(wellId: string = 'BGW-01', category: string = 'WARNING') {
    const res = await fetch(`${API_BASE}/alerts/generate?well_id=${wellId}&category=${category}`, {
      method: 'POST'
    });
    return handleResponse<any>(res);
  },

  // Scenarios
  async getScenarios(wellId: string) {
    const res = await fetch(`${API_BASE}/scenarios/${wellId}`);
    return handleResponse<any[]>(res);
  },
  async saveScenario(payload: any) {
    const res = await fetch(`${API_BASE}/scenarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<any>(res);
  },

  // Analytics
  async getAnalytics(wellId: string, days: number = 30) {
    const res = await fetch(`${API_BASE}/analytics/${wellId}?days=${days}`);
    return handleResponse<any>(res);
  },

  // Operator Decisions
  async getDecisions(wellId: string) {
    const res = await fetch(`${API_BASE}/operator-decisions/${wellId}`);
    return handleResponse<any[]>(res);
  },
  async recordDecision(payload: {
    well_id: string;
    scenario_or_rec_id: string;
    action: string;
    operator_name: string;
    operator_role: string;
    rationale: string;
    parameters: any;
    notes?: string;
  }) {
    const res = await fetch(`${API_BASE}/operator-decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<any>(res);
  },

  // Root Cause Explorer
  async getRootCause(wellId: string) {
    const res = await fetch(`${API_BASE}/root-cause/${wellId}`);
    return handleResponse<any>(res);
  },

  // Data Quality Monitor
  async getDataQuality(wellId?: string) {
    const url = wellId ? `${API_BASE}/data-quality/${wellId}` : `${API_BASE}/data-quality`;
    const res = await fetch(url);
    return handleResponse<any>(res);
  },

  // Replay
  async getReplay(wellId: string, window: string = '6h') {
    const res = await fetch(`${API_BASE}/replay/${wellId}?window=${window}`);
    return handleResponse<any>(res);
  },

  // Report
  async getReport(wellId: string) {
    const res = await fetch(`${API_BASE}/reports/${wellId}`);
    return handleResponse<any>(res);
  },

  // Live Simulation
  async tickSimulation(wellId: string) {
    const res = await fetch(`${API_BASE}/simulation/tick/${wellId}`, {
      method: 'POST'
    });
    return handleResponse<any>(res);
  },
  async resetSimulation(wellId: string) {
    const res = await fetch(`${API_BASE}/simulation/reset/${wellId}`, {
      method: 'POST'
    });
    return handleResponse<any>(res);
  },

  // Authentication
  async login(username: string, password: string = 'password') {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse<any>(res);
  }
};
