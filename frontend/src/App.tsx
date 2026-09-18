import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Restaurants from "./pages/Restaurants";
import Kitchen from "./pages/Kitchen";
import Deliveries from "./pages/Deliveries";
import Inventory from "./pages/Inventory";
import Ingredients from "./pages/Ingredients";
import Feedback from "./pages/Feedback";
import AIAnalysis from "./pages/AIAnalysis";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Foods from "./pages/Foods";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<Layout />}>

          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/restaurants"
            element={<Restaurants />}
          />
        <Route path="/foods" element={<Foods />} />
          <Route
            path="/kitchen"
            element={<Kitchen />}
          />

          <Route
            path="/deliveries"
            element={<Deliveries />}
          />

          <Route
            path="/inventory"
            element={<Inventory />}
          />

          <Route
            path="/ingredients"
            element={<Ingredients />}
          />

          <Route
            path="/feedback"
            element={<Feedback />}
          />

          <Route
            path="/ai-analysis"
            element={<AIAnalysis />}
          />
         <Route path="/analytics" element={<Analytics />} />
          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;