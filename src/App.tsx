/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Financial from './pages/Financial';
import Settings from './pages/Settings';
import Products from './pages/Products';
import Orders from './pages/Orders';
import SuperAdmin from './pages/SuperAdmin';
import Collaborators from './pages/Collaborators';
import PublicPage from './pages/PublicPage';
import LandingPage from './pages/LandingPage';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';

import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LGPD from './pages/LGPD';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/lgpd" element={<LGPD />} />
        <Route path="/p/:slug" element={<PublicPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="clients" element={<Clients />} />
            <Route path="services" element={<Services />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="financial" element={<Financial />} />
            <Route path="settings" element={<Settings />} />
            <Route path="admin" element={<SuperAdmin />} />
            <Route path="collaborators" element={<Collaborators />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
