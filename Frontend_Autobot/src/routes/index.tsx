import { Fragment } from 'react';
import { Navigate, Route } from 'react-router-dom';
import DefaultLayout from '../layouts/DefaultLayout';

type RouteType = {
  path: string;
  component: React.ComponentType;
  layout?: typeof DefaultLayout | typeof Fragment | null;
};

// Public Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import About from '../pages/About';
import Backtest from '../pages/Backtest';
import ExtensionPage from '../pages/Download_Extension';
import ServiceRates from '../pages/Services_Rates';
import ForgotPassword from '../pages/ForgotPassword';

// Private Pages
import LogHistory from '../pages/LogHistory';
import Information from '../pages/Personal_Info';
import UserBotWebhookManager from '../pages/UserBotWebhookManager';

// Public Routes
const publicRoutes: RouteType[] = [
  { path: '/', component: Home },
  { path: '/login', component: Login, layout: null },
  { path: '/register', component: Register, layout: null },
  { path: '/forgot-password', component: ForgotPassword, layout: null },
  { path: '/about', component: About },
  { path: '/backtest', component: Backtest },
  { path: '/extension', component: ExtensionPage },
  { path: '/service-rate', component: ServiceRates },
];

// Private Routes
const privateRoutes: RouteType[] = [
  { path: '/information', component: Information },
  { path: '/log-history', component: LogHistory },
  { path: '/user-bot-webhook', component: UserBotWebhookManager },
];

// Navigation Items for Sidebar/Menu
export const navigateItems = [
  { key: '/', label: 'Trang chủ' },
  { key: '/about', label: 'Giới thiệu' },
  { key: '/backtest', label: 'Backtest' },
  { key: '/service-rate', label: 'Bảng giá dịch vụ' },
  { key: '/extension', label: 'Tải extension' },
];

// Generate Public Routes
export const generatePublicRoutes = (isAuthenticated: boolean) => {
  return publicRoutes.map((route, index) => {
    const Page = route.component;
    let Layout = DefaultLayout;

    if (route.layout) {
      Layout = route.layout;
    } else if (route.layout === null) {
      Layout = Fragment;
    }

    // Redirect to home if user is authenticated and tries to access login/register
    if (isAuthenticated && (route.path === '/login' || route.path === '/register')) {
      return <Route key={index} path={route.path} element={<Navigate to="/" />} />;
    }

    return (
      <Route
        key={index}
        path={route.path}
        element={
          <Layout>
            <Page />
          </Layout>
        }
      />
    );
  });
};

// Generate Private Routes
export const generatePrivateRoutes = (isAuthenticated: boolean) => {
  if (isAuthenticated) {
    return privateRoutes.map((route, index) => {
      const Page = route.component;
      let Layout = DefaultLayout;

      if (route.layout) {
        Layout = route.layout;
      } else if (route.layout === null) {
        Layout = Fragment;
      }

      return (
        <Route
          key={index}
          path={route.path}
          element={
            <Layout>
              <Page />
            </Layout>
          }
        />
      );
    });
  } else {
    // Redirect to login if not authenticated
    return privateRoutes.map((route, index) => (
      <Route key={index} path={route.path} element={<Navigate to="/login" />} />
    ));
  }
}; 