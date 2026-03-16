// Enhanced for full process flow - Updated routing structure with Auth
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import { FaBars } from 'react-icons/fa';
import ToastContainer from './components/Toast';
import Home from './pages/Home';
import Login from './pages/Login';
import GuidePreparation from './pages/guide/GuidePreparation';
import GuideApplicationForm from './pages/guide/GuideApplicationForm';
import GuideRelatedCompetitions from './pages/guide/GuideRelatedCompetitions';
import GuideMidterm from './pages/guide/GuideMidterm';
import GuideConclusion from './pages/guide/GuideConclusion';
import ProcessGuide from './pages/guide/ProcessGuide';
import Competitions from './pages/Competitions';
import CompetitionDetail from './pages/CompetitionDetail';
import Reimbursements from './pages/Reimbursements';
import Resources from './pages/Resources';
import Tools from './pages/Tools';
import AICreation from './pages/AICreation';
import MyProjects from './pages/MyProjects';
import ProjectDashboard from './pages/ProjectDashboard';
import ProjectEdit from './pages/ProjectEdit';
import ProjectConclusion from './pages/ProjectConclusion';
import ProjectReimburse from './pages/ProjectReimburse';
import ApplicationEditor from './pages/ApplicationEditor';
import MidtermEditor from './pages/MidtermEditor';
import FinalEditor from './pages/FinalEditor';
import PatentEditor from './pages/PatentEditor';
import AuditLog from './pages/AuditLog';
import AdminDashboard from './pages/AdminDashboard';
import CompetitionReview from './pages/CompetitionReview';
import PageTransition from './components/PageTransition';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// 路由保护组件 - 所有非登录页面都需要认证
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 正在检查登录状态时，显示加载中（避免闪烁登录页）
  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', backgroundColor: '#f0f4f8'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: '16px', color: '#8c8c8c', fontSize: '14px' }}>正在验证登录状态...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// 主应用布局组件（带侧边栏）
const AppLayout = ({ children }) => {
  const [sidebarShow, setSidebarShow] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-container">
      {/* Mobile Top Header Bar */}
      {isMobile && (
        <div className="mobile-header">
          <button
            className="mobile-hamburger"
            onClick={() => setSidebarShow(true)}
            aria-label="打开导航菜单"
          >
            <FaBars size={20} />
          </button>
          <span className="mobile-header-title">GDUT 大创指南</span>
          <div style={{ width: '44px' }} />
        </div>
      )}
      <div className="main-content-wrapper">
        <Sidebar show={sidebarShow} onHide={() => setSidebarShow(false)} />
        <main
          className="main-content"
          style={{
            flexGrow: 1,
            width: !isMobile ? 'calc(100% - 240px)' : '100%',
            marginLeft: !isMobile ? '240px' : '0',
            maxWidth: !isMobile ? 'calc(100% - 240px)' : '100%'
          }}
        >
          <PageTransition key={location.pathname}>
            {children}
          </PageTransition>
        </main>
      </div>
      <Footer />
    </div>
  );
};

// 应用路由
const AppRoutes = () => {
  return (
    <Routes>
      {/* 登录页 - 不需要认证，不显示侧边栏 */}
      <Route path="/login" element={<Login />} />

      {/* 所有其他路由 - 需要认证，显示侧边栏布局 */}
      <Route path="/*" element={
        <RequireAuth>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/guide" element={<GuidePreparation />} />
              <Route path="/guide/preparation" element={<GuidePreparation />} />
              <Route path="/guide/application-form" element={<GuideApplicationForm />} />
              <Route path="/guide/related-competitions" element={<GuideRelatedCompetitions />} />
              <Route path="/guide/midterm" element={<GuideMidterm />} />
              <Route path="/guide/conclusion" element={<GuideConclusion />} />
              <Route path="/guide/process-map" element={<ProcessGuide />} />
              <Route path="/competitions" element={<Competitions />} />
              <Route path="/competitions/:id" element={<CompetitionDetail />} />
              <Route path="/reimbursements" element={<Reimbursements />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/ai-creation" element={<AICreation />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/my-projects" element={<MyProjects />} />
              <Route path="/project/:id" element={<ProjectDashboard />} />
              <Route path="/project/:id/edit" element={<ProjectEdit />} />
              <Route path="/project/:id/edit/application" element={<ApplicationEditor />} />
              <Route path="/project/:id/edit/midterm" element={<MidtermEditor />} />
              <Route path="/project/:id/edit/conclusion" element={<ProjectConclusion />} />
              <Route path="/project/:id/edit/final" element={<FinalEditor />} />
              <Route path="/project/:id/reimburse" element={<ProjectReimburse />} />
              <Route path="/project/:id/logs" element={<AuditLog />} />
              <Route path="/project/:id/application-editor" element={<ApplicationEditor />} />
              <Route path="/application-editor" element={<ApplicationEditor />} />
              <Route path="/midterm-editor" element={<MidtermEditor />} />
              <Route path="/final-editor" element={<FinalEditor />} />
              <Route path="/patent-editor" element={<PatentEditor />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/competition-review" element={<CompetitionReview />} />
            </Routes>
          </AppLayout>
        </RequireAuth>
      } />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppRoutes />
          <ToastContainer />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
