import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Search from "./pages/Search";
import PropertyDetails from "./pages/PropertyDetails";
import MyBookings from "./pages/MyBookings";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/buscar" component={Search} />
      <Route path="/propriedade/:id" component={PropertyDetails} />
      <Route path="/reservas" component={MyBookings} />
      <Route path="/favoritos" component={Favorites} />
      <Route path="/perfil" component={Profile} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

