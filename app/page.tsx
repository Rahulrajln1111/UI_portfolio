import { Suspense } from 'react';
import Hero from '@/components/home/Hero';
import AboutContent from '@/components/about/AboutContent';
import SectionContainer from '@/components/common/SectionContainer';
import PageHeader from '@/components/common/PageHeader';
import AnimatedBackground from '@/components/common/AnimatedBackground';
import CVButton from '@/components/common/CVButton';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <AnimatedBackground />
      </Suspense>
      
      <Hero />
      
      <SectionContainer id="about" className="bg-background">
        <AboutContent />
      </SectionContainer>
      
      <SectionContainer className="bg-muted/30">
        <PageHeader
          title="My Journey"
          description="Explore my academic background, research projects, and professional aspirations."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
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
          
          <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
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
          
          <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
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