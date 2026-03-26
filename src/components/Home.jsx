import { useNavigate } from 'react-router-dom';
import { HeroSection } from './home/HeroSection';
import { AboutSection } from './home/AboutSection';
import { AmenitiesSection } from './home/AmenitiesSection';
import { FeaturesSection } from './home/FeaturesSection';
import { CTASection } from './home/CTASection';

function Home({ user }) {
  const navigate = useNavigate();

  const handleScrollToRooms = () => {
    navigate('/rooms');
  };

  const handleLogin = () => {
    navigate(user ? '/profile' : '/auth');
  };

  return (
    <>
      <main className="relative z-10">
        <HeroSection
          onExploreClick={handleScrollToRooms}
          onLoginClick={handleLogin}
        />

        <AboutSection />

        <FeaturesSection />

        <AmenitiesSection />

        <CTASection
          onBrowseClick={handleScrollToRooms}
          onLoginClick={handleLogin}
        />
      </main>
    </>
  );
}

export default Home;
