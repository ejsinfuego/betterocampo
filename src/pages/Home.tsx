import Hero from '../components/sections/Hero';
import MapSection from '../components/home/MapSection';
import FloodSection from '../components/home/FloodSection';
import ServicesSection from '../components/home/ServicesSection';
import GovernmentActivitySection from '../components/home/GovernmentActivitySection';
import TrustPromiseSection from '../components/home/TrustPromiseSection';
import SEO from '../components/SEO';

const HOME_TITLE = 'LGU Ocampo, Camarines Sur | Better Ocampo';
const HOME_DESCRIPTION =
  'Better Ocampo is the LGU Ocampo community guide for the Ocampo, Camarines Sur community and the Ocampo Cam Sur community.';

const homeJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://betterocampo.org/#website',
      name: 'Better Ocampo',
      url: 'https://betterocampo.org/',
      description: HOME_DESCRIPTION,
      inLanguage: 'en',
    },
    {
      '@type': 'WebPage',
      '@id': 'https://betterocampo.org/#webpage',
      url: 'https://betterocampo.org/',
      name: 'LGU Ocampo, Camarines Sur',
      description: HOME_DESCRIPTION,
      isPartOf: { '@id': 'https://betterocampo.org/#website' },
      about: { '@id': 'https://betterocampo.org/#ocampo' },
      inLanguage: 'en',
    },
    {
      '@type': 'AdministrativeArea',
      '@id': 'https://betterocampo.org/#ocampo',
      name: 'Ocampo',
      alternateName: [
        'Ocampo',
        'LGU Ocampo',
        'Ocampo, Camarines Sur',
        'Ocampo Cam Sur',
        'Municipality of Ocampo',
        'Better Ocampo',
      ],
      sameAs: [
        'https://www.wikidata.org/wiki/Q208878',
        'https://en.wikipedia.org/wiki/Ocampo,_Camarines_Sur',
      ],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Ocampo',
        addressRegion: 'Camarines Sur',
        postalCode: '4419',
        addressCountry: 'PH',
      },
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: 'Camarines Sur',
      },
    },
  ],
});

const Home: React.FC = () => {
  return (
    <>
      <SEO
        title={HOME_TITLE}
        exactTitle
        description={HOME_DESCRIPTION}
        keywords="lgu ocampo, ocampo, better ocampo, lgu ocampo community, ocampo camarines sur community, ocampo cam sur community, ocampo cam sur tourists spot"
        jsonLd={homeJsonLd}
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
          <FloodSection />
          <ServicesSection limit={5} />
          <GovernmentActivitySection limit={5} />
        </div>
      </div>

      <TrustPromiseSection />
    </>
  );
};

export default Home;
