import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Users, ArrowRight, PlayCircle, Award, Sparkles, BookOpen, Clock } from 'lucide-react';
import api from '../utils/api';
import CourseCard from '../components/CourseCard';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Badge from '../components/ui/Badge';
import GlassPanel from '../components/ui/GlassPanel';
import { Reveal } from '../components/ui/Reveal';

const Home: React.FC = () => {
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/courses?limit=3')
      .then(res => setTopCourses(res.data.data))
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* ... (rest unchanged) */}
      {/* Hero Section */}
      <section ref={heroRef} className="hero-wrapper" style={{ minHeight: '100vh', position: 'relative' }}>
        <motion.div className="hero-bg" style={{ y, opacity }} />
        
        <div className="hero-content">
          <Reveal delay={0.2} y={20}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <Badge variant="info">
                <Sparkles size={14} style={{ marginRight: '6px' }} /> 
                The Future of Learning is Here
              </Badge>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', letterSpacing: '-0.02em' }}>
              Master New Skills <br />
              <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                With Expert Guidance
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.6}>
            <p className="hero-subtitle" style={{ fontSize: '1.25rem', maxWidth: '640px', marginInline: 'auto' }}>
              Experience a premium, community-driven learning environment. 
              Join 50,000+ students mastering technology, design, and business through interactive courses.
            </p>
          </Reveal>

          <Reveal delay={0.8}>
            <div className="hero-actions" style={{ marginTop: '3rem' }}>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Button isMagnetic style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px' }}>
                  Get Started Free <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/courses" style={{ textDecoration: 'none' }}>
                <Button isMagnetic variant="secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px' }}>
                  Explore Courses
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Floating Decorative Elements */}
        <motion.div 
          style={{ position: 'absolute', bottom: '10%', left: '15%', opacity: 0.2 }}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <BookOpen size={48} color="var(--primary-color)" />
        </motion.div>
        <motion.div 
          style={{ position: 'absolute', top: '20%', right: '15%', opacity: 0.2 }}
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Clock size={40} color="#c084fc" />
        </motion.div>
      </section>

      {/* Feature Section */}
      <section className="feature-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <Reveal width="100%">
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Engineered for Results</h2>
            </Reveal>
            <Reveal width="100%" delay={0.3}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>We provide the elite tools you need to succeed in the modern digital economy.</p>
            </Reveal>
          </div>
          
          <div className="feature-grid">
            {[
              { icon: <PlayCircle />, title: "Interactive Lessons", text: "High-quality video content and terminal-grade environments designed for deep focus." },
              { icon: <Users />, title: "Elite Community", text: "Ask questions and get answers from industry leads and peers directly inside your workspace." },
              { icon: <Award />, title: "Global Certification", text: "Earn cryptographically signed certificates to showcase your industry mastery." }
            ].map((f, i) => (
              <Reveal key={i} delay={0.2 * (i + 1)}>
                <GlassPanel className="feature-card" style={{ height: '100%' }}>
                  <div className="feature-icon">{f.icon}</div>
                  <h4 style={{ fontSize: '1.4rem' }}>{f.title}</h4>
                  <p>{f.text}</p>
                </GlassPanel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="container" style={{ padding: '8rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
          <div>
            <Reveal>
              <h2 style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Trending Now</h2>
            </Reveal>
            <Reveal delay={0.3}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Hand-picked trajectories from our world-class faculty.</p>
            </Reveal>
          </div>
          <Reveal delay={0.5}>
            <Link to="/courses" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '10px' }}>
              Browse Archive <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>

        {isLoading ? (
          <Loader center />
        ) : error || topCourses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
            <p>New content arriving soon. Check back shortly.</p>
          </div>
        ) : (
          <div className="course-grid">
            {topCourses.map((course, i) => (
              <Reveal key={course.id} delay={0.2 * i} width="100%">
                <CourseCard 
                  course={course}
                  style={{ width: '100%' }}
                  footerContent={
                    <Link to={`/courses`} style={{ textDecoration: 'none' }}>
                      <Button variant="enroll" isMagnetic>Learn More</Button>
                    </Link>
                  }
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="testimonial-section" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="container">
          <Reveal width="100%">
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '5rem', textAlign: 'center' }}>Trusted by Industry Leads</h2>
          </Reveal>
          <div className="testimonial-grid">
            {[
              { name: "Sarah J.", role: "Staff Engineer @ Meta", text: "The structured approach and quality of instruction here is unmatched. I transitioned to Staff level after identifying key gaps through the system architecture tracks." },
              { name: "David M.", role: "Senior Designer @ Airbnb", text: "I love the community aspect. Being able to get direct critique from design leads is a game-changer for professional growth." },
              { name: "Elena R.", role: "Founding Engineer", text: "The platform's interface is pure art. It makes spending dozens of hours learning complex topics an absolute pleasure." }
            ].map((t, i) => (
              <Reveal key={i} delay={0.2 * i}>
                <GlassPanel className="testimonial-card" hoverScale={false} style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="testimonial-text" style={{ fontSize: '1.1rem' }}>"{t.text}"</p>
                  <div className="testimonial-author">
                    <div className="author-avatar" style={{ background: i % 2 === 0 ? 'var(--primary-glow)' : 'rgba(168,85,247,0.4)' }}>{t.name[0]}</div>
                    <div className="author-info">
                      <h5 style={{ fontSize: '1rem' }}>{t.name}</h5>
                      <span style={{ color: 'var(--primary-color)' }}>{t.role}</span>
                    </div>
                  </div>
                </GlassPanel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container" style={{ padding: '10rem 2rem' }}>
        <Reveal width="100%">
          <GlassPanel style={{ padding: '6rem 4rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 100%)', borderRadius: '40px' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
              Ready to Define <br />
              Your Career Path?
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '3.5rem', maxWidth: '600px', marginInline: 'auto', fontSize: '1.2rem' }}>
              Join our global community of high-performers today and take the definitive step towards mastery.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link to="/register" style={{ textDecoration: 'none', width: '100%', maxWidth: '350px' }}>
                <Button isMagnetic style={{ padding: '1.5rem', fontSize: '1.1rem', borderRadius: '50px' }}>
                  Create Your Free Account
                </Button>
              </Link>
            </div>
          </GlassPanel>
        </Reveal>
      </section>

      <footer style={{ padding: '6rem 0', textAlign: 'center', borderTop: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.5)' }}>
        <Link to="/" className="navbar logo" style={{ padding: 0, marginBottom: '2rem', display: 'inline-block', fontSize: '1.5rem' }}>LMS PLATFORM</Link>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
          <Link to="/courses" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Archive</Link>
          <Link to="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Instructors</Link>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</Link>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', opacity: 0.6 }}>&copy; 2026 Premium LMS. Built for the modern engineer.</p>
      </footer>
    </div>
  );
};

export default Home;
