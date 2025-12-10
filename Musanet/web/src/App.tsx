import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ComposerPage from "./pages/ComposerPage";
import "./styles/globals.scss";

export default function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="app-main">
        <div className="app-container">
          <ComposerPage />
        </div>
      </main>
      <Footer />
    </div>
  );
}