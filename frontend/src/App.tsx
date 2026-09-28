import React, { useState, useEffect } from 'react';
import { Well, UserProfile, DashboardData, DigitalTwinState } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { SafetyBanner } from './components/SafetyBanner';
import { PresentationModal } from './components/PresentationModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { CssPage } from './pages/CssPage';
import { SrpPage } from './pages/SrpPage';
import { PredictionPage } from './pages/PredictionPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { OptimizationPage } from './pages/OptimizationPage';
import { PredictiveMaintenancePage } from './pages/PredictiveMaintenancePage';
import { AlertsPage } from './pages/AlertsPage';
import { ScenarioComparisonPage } from './pages/ScenarioComparisonPage';
import { HistoricalAnalyticsPage } from './pages/HistoricalAnalyticsPage';
import { ReplayPage } from './pages/ReplayPage';
import { RootCausePage } from './pages/RootCausePage';
import { DataQualityPage } from './pages/DataQualityPage';
import { OperatorDecisionPage } from './pages/OperatorDecisionPage';
import { ReportsPage } from './pages/ReportsPage';
import { SihRequirementMappingPage } from './pages/SihRequirementMappingPage';

const DEFAULT_USER: UserProfile = {
  username: 'admin',
  name: 'Dr. Rajesh Sharma',
  role: 'ADMIN',
  title: 'Chief Digital Officer',
  department: 'Production Technology & AI',
  permissions: {
    can_view_dashboard: true,
    can_run_simulation: true,
    can_run_prediction: true,
    can_run_optimization: true,
    can_manage_alerts: true,
    can_make_operator_decisions: true,
    can_edit_scenarios: true,
    can_export_reports: true,
    can_train_models: true,
  },
};

export const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState<boolean>(false);

  const [activeTab, setActiveTab] =
    useState<NavTab>('dashboard');

  const [wells, setWells] = useState<Well[]>([]);

  const [selectedWellId, setSelectedWellId] =
    useState<string>('BGW-01');

  const [currentUser, setCurrentUser] =
    useState<UserProfile>(DEFAULT_USER);

  const [isDemoMode, setIsDemoMode] =
    useState<boolean>(true);

  /*
   * Theme
   *
   * Dark mode is the default.
   * The user's choice is stored in localStorage.
   */
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('welltwin-theme');

    if (savedTheme === 'light') {
      return false;
    }

    return true;
  });

  const [isPresentationOpen, setIsPresentationOpen] =
    useState<boolean>(false);

  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);

  const [digitalTwinState, setDigitalTwinState] =
    useState<DigitalTwinState | null>(null);

  const [alertCount, setAlertCount] =
    useState<number>(2);

  /*
   * Apply theme to the entire document.
   *
   * This gives us:
   * <html class="dark">
   *
   * or
   *
   * <html class="light">
   */
  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove('dark');
    root.classList.remove('light');

    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('welltwin-theme', 'dark');
    } else {
      root.classList.add('light');
      localStorage.setItem('welltwin-theme', 'light');
    }
  }, [isDarkMode]);

  /*
   * Fetch initial wells
   */
  useEffect(() => {
    api.getWells()
      .then(res => {
        setWells(res);

        if (res.length > 0 && !selectedWellId) {
          setSelectedWellId(res[0].well_id);
        }
      })
      .catch(err => {
        console.warn(
          'Initial wells fetch fallback:',
          err
        );

        const fallbackWells: Well[] = [
          {
            well_id: 'BGW-01',
            name: 'Baghewala Well #01 (Thermal Pilot)',
            field: 'Baghewala Heavy Oil Field',
            formation: 'Jodhpur Sandstone',
            reservoir_depth_m: 1040,
            api_gravity: 17.2,
            asphaltene_pct: 14.2,
            initial_res_temp_c: 61.8,
            initial_res_pressure_bar: 98.4,
            current_status: 'ACTIVE_PRODUCTION',
            current_css_cycle: 4,
            srp_type: 'Mark II Unitorque 456-305-144',
            surface_unit: 'Lufkin C-456D-305-144',
          },
          {
            well_id: 'BGW-02',
            name: 'Baghewala Well #02 (High Viscosity/Cooling)',
            field: 'Baghewala Heavy Oil Field',
            formation: 'Bilara Dolomite/Carbonate',
            reservoir_depth_m: 1015,
            api_gravity: 16.5,
            asphaltene_pct: 16.8,
            initial_res_temp_c: 59.2,
            initial_res_pressure_bar: 94.0,
            current_status: 'COOLING_WATCH',
            current_css_cycle: 3,
            srp_type: 'Conventional C-320-256-120',
            surface_unit: 'Lufkin C-320D-256-120',
          },
          {
            well_id: 'BGW-03',
            name: 'Baghewala Well #03 (North Extension)',
            field: 'Baghewala Heavy Oil Field',
            formation: 'Jodhpur Sandstone North',
            reservoir_depth_m: 1080,
            api_gravity: 18.0,
            asphaltene_pct: 12.5,
            initial_res_temp_c: 63.5,
            initial_res_pressure_bar: 102.1,
            current_status: 'PEAK_PRODUCTION',
            current_css_cycle: 5,
            srp_type: 'Mark II M-640-365-168',
            surface_unit: 'Lufkin M-640D-365-168',
          },
          {
            well_id: 'BGW-04',
            name: 'Baghewala Well #04 (South Flank Appraisal)',
            field: 'Baghewala Heavy Oil Field',
            formation: 'Jodhpur Sandstone South',
            reservoir_depth_m: 1025,
            api_gravity: 16.8,
            asphaltene_pct: 15.5,
            initial_res_temp_c: 60.1,
            initial_res_pressure_bar: 96.5,
            current_status: 'SOAK_PHASE',
            current_css_cycle: 2,
            srp_type: 'Conventional C-456-305-144',
            surface_unit: 'Lufkin C-456D-305-144',
          },
          {
            well_id: 'BGW-05',
            name: 'Baghewala Well #05 (Deep Sector)',
            field: 'Baghewala Heavy Oil Field',
            formation: 'Basal Clastics Deep',
            reservoir_depth_m: 1110,
            api_gravity: 17.5,
            asphaltene_pct: 13.8,
            initial_res_temp_c: 64.0,
            initial_res_pressure_bar: 104.5,
            current_status: 'ACTIVE_PRODUCTION',
            current_css_cycle: 4,
            srp_type: 'Mark II M-456-305-144',
            surface_unit: 'Lufkin M-456D-305-144',
          },
        ];

        setWells(fallbackWells);
      });
  }, [selectedWellId]);

  /*
   * Fetch telemetry for selected well
   */
  const refreshWellData = () => {
    if (!selectedWellId) {
      return;
    }

    api.getDashboard(selectedWellId)
      .then(res => {
        setDashboardData(res);
      })
      .catch(err => {
        console.error(
          'Dashboard load error:',
          err
        );
      });

    api.getDigitalTwin(selectedWellId)
      .then(res => {
        setDigitalTwinState(res);
      })
      .catch(err => {
        console.error(
          'Digital twin load error:',
          err
        );
      });

    api.getAlerts({
      well_id: selectedWellId,
      status: 'ACTIVE',
    })
      .then(res => {
        setAlertCount(res.length);
      })
      .catch(err => {
        console.error(
          'Alerts count error:',
          err
        );
      });
  };

  useEffect(() => {
    refreshWellData();
  }, [selectedWellId]);

  /*
   * Change role
   */
  const handleChangeRole = (
    role: 'ADMIN' | 'ENGINEER' | 'OPERATOR' | 'VIEWER'
  ) => {
    setCurrentUser(prev => ({
      ...prev,
      role,
    }));
  };

  /*
   * Toggle Dark / Light Mode
   */
  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  /*
   * Landing Page
   */
  if (showLanding) {
    return (
      <LandingPage
        onEnterDashboard={() => setShowLanding(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setShowLanding(false);
        }}
        onOpenPresentation={() =>
          setIsPresentationOpen(true)
        }
      />
    );
  }

  return (
    <div
      className={`
        welltwin-app
        min-h-screen
        flex
        flex-col
        transition-colors
        duration-300
        ${
          isDarkMode
            ? 'dark bg-slate-950 text-slate-100'
            : 'light bg-slate-50 text-slate-900'
        }
      `}
    >

      {/* ============================
          TOP APPLICATION HEADER
          ============================ */}
      <Navbar
        wells={wells}
        selectedWellId={selectedWellId}
        onSelectWell={(id) =>
          setSelectedWellId(id)
        }
        currentUser={currentUser}
        onChangeRole={handleChangeRole}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() =>
          setIsDemoMode(prev => !prev)
        }

        /*
         * Theme props
         */
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}

        onOpenPresentation={() =>
          setIsPresentationOpen(true)
        }

        onOpenReportModal={() =>
          setActiveTab('reports')
        }
      />

      {/* ============================
          SAFETY BANNER
          ============================ */}
      <SafetyBanner />

      {/* ============================
          MAIN APPLICATION
          ============================ */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) =>
            setActiveTab(tab)
          }
          alertCount={alertCount}
        />

        {/* CONTENT AREA */}
        <main
          className="
            flex-1
            p-6
            overflow-y-auto
            max-w-7xl
            mx-auto
            w-full
          "
        >

          {/* ============================
              MAIN DASHBOARD
              ============================ */}
          {activeTab === 'dashboard' && (
            <DashboardPage
              data={dashboardData}
              onNavigateTab={(tab) =>
                setActiveTab(tab)
              }
              onOpenRootCause={() =>
                setActiveTab('root-cause')
              }
              onOpenReport={() =>
                setActiveTab('reports')
              }
              onRefreshData={refreshWellData}
            />
          )}

          {/* DIGITAL TWIN */}
          {activeTab === 'digital-twin' && (
            <DigitalTwinPage
              state={digitalTwinState}
              onNavigateTab={(tab) =>
                setActiveTab(tab)
              }
            />
          )}

          {/* LIVE MONITORING */}
          {activeTab === 'live-monitoring' && (
            <LiveMonitoringPage
              wellId={selectedWellId}
            />
          )}

          {/* CSS STEAM MONITORING */}
          {activeTab === 'css' && (
            <CssPage
              wellId={selectedWellId}
            />
          )}

          {/* SRP */}
          {activeTab === 'srp' && (
            <SrpPage
              wellId={selectedWellId}
            />
          )}

          {/* AI PREDICTION */}
          {activeTab === 'prediction' && (
            <PredictionPage
              wellId={selectedWellId}
            />
          )}

          {/* WHAT IF */}
          {activeTab === 'what-if' && (
            <WhatIfPage
              wellId={selectedWellId}
            />
          )}

          {/* OPTIMIZATION */}
          {activeTab === 'optimization' && (
            <OptimizationPage
              wellId={selectedWellId}
              onNavigateTab={(tab) =>
                setActiveTab(tab)
              }
            />
          )}

          {/* PREDICTIVE MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <PredictiveMaintenancePage
              wellId={selectedWellId}
            />
          )}

          {/* ALERTS */}
          {activeTab === 'alerts' && (
            <AlertsPage
              wellId={selectedWellId}
            />
          )}

          {/* SCENARIOS */}
          {activeTab === 'scenarios' && (
            <ScenarioComparisonPage
              wellId={selectedWellId}
              onNavigateTab={(tab) =>
                setActiveTab(tab)
              }
            />
          )}

          {/* HISTORICAL ANALYTICS */}
          {activeTab === 'analytics' && (
            <HistoricalAnalyticsPage
              wellId={selectedWellId}
            />
          )}

          {/* REPLAY */}
          {activeTab === 'replay' && (
            <ReplayPage
              wellId={selectedWellId}
            />
          )}

          {/* ROOT CAUSE */}
          {activeTab === 'root-cause' && (
            <RootCausePage
              wellId={selectedWellId}
            />
          )}

          {/* DATA QUALITY */}
          {activeTab === 'data-quality' && (
            <DataQualityPage
              wellId={selectedWellId}
            />
          )}

          {/* OPERATOR DECISIONS */}
          {activeTab === 'decisions' && (
            <OperatorDecisionPage
              wellId={selectedWellId}
              onNavigateTab={(tab) =>
                setActiveTab(tab)
              }
            />
          )}

          {/* REPORTS */}
          {activeTab === 'reports' && (
            <ReportsPage
              wellId={selectedWellId}
            />
          )}

          {/* SIH REQUIREMENT MAPPING */}
          {activeTab === 'sih-mapping' && (
            <SihRequirementMappingPage
              onNavigateTab={(tab) =>
                setActiveTab(tab)
              }
            />
          )}

        </main>
      </div>

      {/* ============================
          PRESENTATION MODAL
          ============================ */}
      <PresentationModal
        isOpen={isPresentationOpen}
        onClose={() =>
          setIsPresentationOpen(false)
        }
        onNavigateToTab={(tab) =>
          setActiveTab(tab)
        }
      />

    </div>
  );
};

export default App;