import { Metadata } from 'next';
import SectionContainer from '@/components/common/SectionContainer';
import PageHeader from '@/components/common/PageHeader';
import BlogGrid from '@/components/blogs/blogGrid';

export const metadata: Metadata = {
	title: 'Blogs | Rahul Razz',
	description: 'Read my  academic and professional blog  in the field of Computer Science.',
};

export default function BlogPage() {
	return (
		<div className="pt-24">
			<SectionContainer>
				<PageHeader
					title="Blog"
					description="Academic and professional Blogging showcasing my expertise and continuous learning in Computer Science."
				/>

				<BlogGrid />
			</SectionContainer>
		</div>
	);
}