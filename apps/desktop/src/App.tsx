import { Navbar } from "./components/navigation/Navbar";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Live } from "./components/navigation/Live";
import { Matches } from "./pages/Matches";
import { Sponsors } from "./pages/Sponsors";

function App() {
  return (
    <Router>
      <main className="mx-auto text-left text-secondary-foreground">
        <Navbar />
        <div className="px-4 pt-20 h-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/live" element={<Live />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/sponsors" element={<Sponsors />} />
          </Routes>
        </div>
      </main>
    </Router>
  );
}

export default App;
