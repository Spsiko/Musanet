import React from "react";
import ComposerPage from "./pages/ComposerPage";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import "./styles/globals.scss";

function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="app-main">
        <ComposerPage />
      </main>
      <Footer />
    </div>
  );
}

export default App;
