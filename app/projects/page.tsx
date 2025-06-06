import { Metadata } from 'next';
import SectionContainer from '@/components/common/SectionContainer';
import PageHeader from '@/components/common/PageHeader';
import ProjectCard from '@/components/projects/ProjectCard';
import { projects } from '@/lib/constants';

export const metadata: Metadata = {
	title: 'Projects | Rahul Razz',
	description: 'Explore the  projects and research work conducted by Rahul Razz in the field of Cybersecurity.',
};

export default function ProjectsPage() {
	return (
		<div className="pt-24">
			<SectionContainer>
				<PageHeader
					title="Projects"
					description="Explore my   projects in the field of Cybersecurity and Development."
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{projects.map((project, index) => (
						<ProjectCard
							key={project.id}
							title={project.title}
							description={project.description}
							imageUrl={project.imageUrl}
							date={project.date}
							collaborators={project.collaborators}
							link={project.link}
							index={index}
						/>
					))}
				</div>
			</SectionContainer>
		</div>
	);
}