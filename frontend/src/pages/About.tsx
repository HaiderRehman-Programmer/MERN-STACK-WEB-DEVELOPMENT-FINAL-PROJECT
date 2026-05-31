import React from 'react';
import GlassPanel from '../components/ui/GlassPanel';
import { BookOpen, Users, Shield, Award } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="container">
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(45deg, var(--primary-light), var(--primary-main))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          About LMS Platform
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Empowering learners and educators globally through a modern, scalable, and immersive educational experience.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <GlassPanel style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary-main)' }}>
            <BookOpen size={30} />
          </div>
          <h3 style={{ marginBottom: '1rem' }}>Vast Knowledge Base</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Access hundreds of high-quality courses across various disciplines, tailored for both beginners and experts.</p>
        </GlassPanel>

        <GlassPanel style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#10b981' }}>
            <Users size={30} />
          </div>
          <h3 style={{ marginBottom: '1rem' }}>Community Driven</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Join a thriving community of learners. Engage in discussions, leave reviews, and grow together.</p>
        </GlassPanel>

        <GlassPanel style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#f59e0b' }}>
            <Award size={30} />
          </div>
          <h3 style={{ marginBottom: '1rem' }}>Expert Instructors</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Learn from industry professionals with real-world experience, dedicated to helping you succeed.</p>
        </GlassPanel>

        <GlassPanel style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#ef4444' }}>
            <Shield size={30} />
          </div>
          <h3 style={{ marginBottom: '1rem' }}>Secure & Reliable</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Built on the robust MERN stack, ensuring a secure, fast, and reliable learning environment.</p>
        </GlassPanel>
      </div>

      <GlassPanel style={{ padding: '3rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Our Mission</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1.1rem' }}>
          We believe that education should be accessible, engaging, and transformative. 
          By bridging the gap between passionate educators and eager learners, we aim to 
          foster a global community where skills are developed and dreams are realized. 
          Our platform is designed with cutting-edge technology to provide an intuitive 
          and seamless learning journey.
        </p>
      </GlassPanel>
    </div>
  );
};

export default About;
