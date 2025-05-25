import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";      // ✅ FIXED
import Dashboard from "./pages/Dashboard";      // ✅ FIXED

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* ✅ Add this */}
      </Routes>
    </Router>
  );
}

export default App;
