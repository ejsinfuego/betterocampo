import { lazy, Suspense } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import VolunteerModal from './components/layout/VolunteerModal';
import Home from './pages/Home';
import Analytics from './components/Analytics';
import ScrollToTop from './components/ui/ScrollToTop';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router';

const Services = lazy(() => import('./pages/Services'));
const Document = lazy(() => import('./pages/Document'));
const Government = lazy(() => import('./pages/Government'));
const Search = lazy(() => import('./pages/Search'));
const About = lazy(() => import('./pages/About'));
const Needs = lazy(() => import('./pages/Needs'));

function App() {
  return (
    <HelmetProvider>
      <Router>
        <NuqsAdapter>
          <div className="flex min-h-svh flex-col bg-white text-gray-900">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary-600 focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-white"
            >
              Skip to main content
            </a>
            <Navbar />
            <VolunteerModal />
            <Analytics />
            <ScrollToTop />
            <main
              id="main-content"
              className="min-w-0 w-full flex-1 overflow-x-clip"
            >
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/services/:category" element={<Services />} />
                  <Route path="/services" element={<Services />} />
                  <Route
                    path="/services/:category/:documentSlug"
                    element={<Document categoryType="service" />}
                  />
                  <Route
                    path="/government/:category"
                    element={<Government />}
                  />
                  <Route path="/government" element={<Government />} />
                  <Route
                    path="/government/departments/projects"
                    element={<Navigate to="/projects" replace />}
                  />
                  <Route
                    path="/government/:category/:documentSlug"
                    element={<Document categoryType="government" />}
                  />
                  <Route
                    path="/projects"
                    element={
                      <Document
                        categoryType="government"
                        slug="projects"
                        category="departments"
                      />
                    }
                  />
                  <Route path="/search" element={<Search />} />
                  <Route path="/needs" element={<Needs />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/:lang/:documentSlug" element={<Document />} />
                  <Route path="/:documentSlug" element={<Document />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </NuqsAdapter>
      </Router>
    </HelmetProvider>
  );
}

export default App;
