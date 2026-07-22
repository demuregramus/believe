import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Home from '@/pages/Home';
import GetNumber from '@/pages/GetNumber';
import Plans from '@/pages/Plans';
import Coverage from '@/pages/Coverage';
import WebMessaging from '@/pages/WebMessaging';
import EsimCatalogue from '@/pages/EsimCatalogue';
import EsimDetail from '@/pages/EsimDetail';
import EsimOrder from '@/pages/EsimOrder';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminNumbers from '@/pages/admin/AdminNumbers';
import AdminMessages from '@/pages/admin/AdminMessages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/get-free-number" component={GetNumber} />
      <Route path="/plans" component={Plans} />
      <Route path="/coverage" component={Coverage} />
      <Route path="/web-messaging" component={WebMessaging} />
      <Route path="/esim" component={EsimCatalogue} />
      <Route path="/esim/order/:transactionId" component={EsimOrder} />
      <Route path="/esim/:id" component={EsimDetail} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/numbers" component={AdminNumbers} />
      <Route path="/admin/messages" component={AdminMessages} />
      <Route component={NotFound} />
    </Switch>
  );
}



function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
