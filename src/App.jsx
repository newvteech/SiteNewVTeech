import Background from './components/Background.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import TechMarquee from './components/TechMarquee.jsx';
import Services from './components/Services.jsx';
import Process from './components/Process.jsx';
import Diagnostic from './components/Diagnostic.jsx';
import Projects from './components/Projects.jsx';
import Team from './components/Team.jsx';
import Privacy from './components/Privacy.jsx';
import Differentials from './components/Differentials.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import BackToTop from './components/BackToTop.jsx';
import { useReveal } from './hooks/useReveal.js';

export default function App() {
  useReveal();

  return (
    <>
      <Background />
      <div className="app">
        <Navbar />
        <main>
          <Hero />
          <TechMarquee />
          <Services />
          <Diagnostic />
          <Process />
          <Projects />
          <Differentials />
          <Team />
          <Contact />
        </main>
        <Footer />
        <BackToTop />
        <Privacy />
      </div>
    </>
  );
}
