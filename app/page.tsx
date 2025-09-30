import { Suspense } from 'react';
import Hero from '@/components/home/Hero';
import AboutContent from '@/components/about/AboutContent';
import SectionContainer from '@/components/common/SectionContainer';
import PageHeader from '@/components/common/PageHeader';
import AnimatedBackground from '@/components/common/AnimatedBackground';
import CVButton from '@/components/common/CVButton';
import Link from 'next/link';
// --- MODIFIED IMPORTS ---
import { ArrowRight, GraduationCap, FlaskConical, Mail } from 'lucide-react';

export default function Home() {
  
  // Define a consistent card style for improved visuals and hover interaction
  const cardClasses = "bg-card rounded-xl p-6 shadow-lg border border-transparent hover:border-primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1";

  return (
    <>
      {/* This is a great practice for non-essential heavy components, 
        ensuring the main content loads quickly. 
      */}
      <Suspense fallback={null}>
        <AnimatedBackground />
      </Suspense>
      
      <Hero />
      
      {/* Ensure good vertical padding for the About section */}
      <SectionContainer id="about" className="bg-background py-24">
        <AboutContent />
      </SectionContainer>
      
      {/* ADDED py-24 for ample vertical spacing */}
      <SectionContainer className="bg-muted/30 py-24">
        <PageHeader
          title="My Journey"
          description="Explore my academic background, research projects, and professional aspirations."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          {/* EDUCATION CARD with Icon and Enhanced Hover */}
          <div className={cardClasses}>
            <GraduationCap className="h-8 w-8 text-primary mb-4" /> {/* NEW ICON */}
            <h3 className="text-xl font-bold mb-4">Education</h3>
            <p className="text-muted-foreground mb-6">
              Discover my academic journey , from undergraduate studies to my current.
            </p>
            <Link 
              href="/education" 
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              Learn more <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {/* PROJECTS CARD with Icon and Enhanced Hover */}
          <div className={cardClasses}>
            <FlaskConical className="h-8 w-8 text-primary mb-4" /> {/* NEW ICON */}
            <h3 className="text-xl font-bold mb-4">Research Projects</h3>
            <p className="text-muted-foreground mb-6">
              Explore my interest in Binary Exploitation, Reverse Engineering, and Development.
            </p>
            <Link 
              href="/projects" 
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              See projects <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {/* CONTACT CARD with Icon and Enhanced Hover */}
          <div className={cardClasses}>
            <Mail className="h-8 w-8 text-primary mb-4" /> {/* NEW ICON */}
            <h3 className="text-xl font-bold mb-4">Get in Touch</h3>
            <p className="text-muted-foreground mb-6">
              Interested in collaboration or have questions about my work? Feel free to reach out.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              Contact me <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Looking for my full credentials? Download my comprehensive CV to learn more about my academic achievements, research experience, and professional skills.
          </p>
          <CVButton variant="outline" />
        </div>
      </SectionContainer>
    </>
  );
}