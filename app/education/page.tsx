import { Metadata } from 'next';
import SectionContainer from '@/components/common/SectionContainer';
import PageHeader from '@/components/common/PageHeader';
import EducationTimeline from '@/components/education/EducationTimeline';

export const metadata: Metadata = {
	title: 'Education | Rahul Razz',
	description: 'Explore  Razz\'s academic journey, qualifications, and achievements in the field of Computer Science.',
};

export default function EducationPage() {
	return (
		<div className="pt-24">
			<SectionContainer>
				<PageHeader
					title="Education"
					description="My academic journey and qualifications in the field of Computer Science."
				/>

				<EducationTimeline />
			</SectionContainer>
		</div>
	);
}