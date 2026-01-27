import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import About from "./pages/About";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="page-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
