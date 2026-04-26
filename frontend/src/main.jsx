import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layout/DashboardLayout";
import { ProjectProvider } from "./contexts/ProjectContext";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDashboard from "./pages/ProjectDashboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import Materials from "./pages/Materials";
import Workers from "./pages/Workers";
import WorkerPayments from "./pages/WorkerPayments";
import Units from "./pages/Units";
import UnitsModule from "./pages/UnitsModule";
import UnitSettings from "./pages/UnitSettings";
import SellUnit from "./pages/SellUnit";
import UnitSales from "./pages/UnitSales";
import MaterialPurchases from "./pages/MaterialPurchases";
import Contractors from "./pages/Contractors";
import MaterialCategories from "./pages/MaterialCategories";
import Parties from "./pages/Parties";
import Bills from "./pages/Bills";
import Employees from "./pages/employees";
import DocumentBank from "./pages/document-bank";
import CategoryFormPage from "./pages/CategoryFormPage";
import CategoryFormBuilderPage from "./pages/CategoryFormBuilderPage";
function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/projects" element={<DashboardLayout><Projects /></DashboardLayout>} />
          <Route path="/project-dashboard" element={<DashboardLayout><ProjectDashboard /></DashboardLayout>} />
          <Route path="/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
          <Route path="/expenses" element={<DashboardLayout><Expenses /></DashboardLayout>} />
          <Route path="/income" element={<DashboardLayout><Income /></DashboardLayout>} />
          <Route path="/materials" element={<DashboardLayout><Materials /></DashboardLayout>} />
          <Route path="/workers" element={<DashboardLayout><Workers /></DashboardLayout>} />
          <Route path="/worker-payments" element={<DashboardLayout><WorkerPayments /></DashboardLayout>} />
          <Route path="/units" element={<DashboardLayout><Units /></DashboardLayout>} />
          <Route path="/units-module" element={<DashboardLayout><UnitsModule /></DashboardLayout>} />
          <Route path="/unit-settings" element={<DashboardLayout><UnitSettings /></DashboardLayout>} />
          <Route path="/sell-unit" element={<DashboardLayout><SellUnit /></DashboardLayout>} />
          <Route path="/unit-sales" element={<DashboardLayout><UnitSales /></DashboardLayout>} />
          <Route path="/material-purchases" element={<DashboardLayout><MaterialPurchases /></DashboardLayout>} />
          <Route path="/contractors" element={<DashboardLayout><Contractors /></DashboardLayout>} />
          <Route path="/material-categories" element={<DashboardLayout><MaterialCategories /></DashboardLayout>} />
          <Route path="/bills" element={<DashboardLayout><Bills /></DashboardLayout>} />
          <Route path="/employees" element={<DashboardLayout><Employees /></DashboardLayout>} />
          <Route path="/document-bank" element={<DashboardLayout><DocumentBank /></DashboardLayout>} />
          <Route path="/parties" element={<DashboardLayout><Parties /></DashboardLayout>} />
          <Route path="/category/:categoryId" element={<DashboardLayout><CategoryFormPage /></DashboardLayout>} />
          <Route path="/category/:categoryId/build-form" element={<DashboardLayout><CategoryFormBuilderPage /></DashboardLayout>} />
        </Routes>
      </BrowserRouter>
    </ProjectProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);