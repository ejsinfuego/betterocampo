import { NuqsAdapter } from 'nuqs/adapters/react';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Analytics from './components/Analytics';
import ScrollToTop from './components/ui/ScrollToTop';
import Services from './pages/Services';
import Document from './pages/Document';
import Government from './pages/Government';
import Search from './pages/Search';
import About from './pages/About';
import { isMeilisearchEnabled } from './lib/meilisearch';
import { BrowserRouter as Router, Routes, Route } from 'react-router';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <NuqsAdapter>
          <div className="flex min-h-svh flex-col bg-white text-gray-900">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-white"
            >
              Skip to main content
            </a>
            <Navbar />
            <Analytics />
            <ScrollToTop />
            <main
              id="main-content"
              className="min-w-0 w-full flex-1 overflow-x-clip"
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/services/:category" element={<Services />} />
                <Route path="/services" element={<Services />} />
                <Route
                  path="/services/:category/:documentSlug"
                  element={<Document categoryType="service" />}
                />
                <Route path="/government/:category" element={<Government />} />
                <Route path="/government" element={<Government />} />
                <Route
                  path="/government/:category/:documentSlug"
                  element={<Document categoryType="government" />}
                />
                {isMeilisearchEnabled && (
                  <Route path="/search" element={<Search />} />
                )}
                <Route path="/about" element={<About />} />
                <Route path="/:lang/:documentSlug" element={<Document />} />
                <Route path="/:documentSlug" element={<Document />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NuqsAdapter>
      </Router>
    </HelmetProvider>
  );
}

export default App;
