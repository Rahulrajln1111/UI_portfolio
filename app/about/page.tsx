import { Metadata } from 'next';
import AboutContent from '@/components/about/AboutContent';
import SectionContainer from '@/components/common/SectionContainer';
import PageHeader from '@/components/common/PageHeader';

export const metadata: Metadata = {
  title: 'About | Rahul Razz',
  description: 'Learn about Rahul Razz, a B.tech CSE student from IIT Bhilai, India, his background, research interests, and professional goals.',
};

export default function AboutPage() {
  return (
    <div className="pt-24">
      <SectionContainer>
        <PageHeader
          title="About Me"
          description="Learn about my journey, interests, and aspirations in the field of Cybersecurity."
        />

        <AboutContent />
      </SectionContainer>
    </div>
  );
}