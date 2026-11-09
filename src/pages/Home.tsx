import Hero from '../components/sections/Hero';
import MapSection from '../components/home/MapSection';
import ServicesSection from '../components/home/ServicesSection';
import GovernmentActivitySection from '../components/home/GovernmentActivitySection';
import TrustPromiseSection from '../components/home/TrustPromiseSection';
import SEO from '../components/SEO';

const Home: React.FC = () => {
  return (
    <>
      <SEO
        title="Home"
        description="Community transparency portal for the Municipality of Ocampo, Camarines Sur."
        keywords="Ocampo, Camarines Sur, government, services, transparency"
      />

      {/* Shared atmosphere: hero → services → government */}
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className="landing-aurora absolute inset-x-0 top-0 h-[56rem] sm:h-[46rem] lg:h-[42rem]" />
        </div>

        <div className="relative">
          <Hero />
          <MapSection />
          <ServicesSection limit={5} />
          <GovernmentActivitySection limit={5} />
        </div>
      </div>

      <TrustPromiseSection />
    </>
  );
};

export default Home;
