import { Metadata } from 'next';
import SectionContainer from '@/components/common/SectionContainer';
import PageHeader from '@/components/common/PageHeader';
import ContactForm from '@/components/contact/ContactForm';
import CVButton from '@/components/common/CVButton';
import { MapPin, Mail, Phone, Linkedin, Twitter, Github } from 'lucide-react';
import Link from 'next/link';
import { contactInfo } from '@/lib/constants';

export const metadata: Metadata = {
	title: 'Contact | Rahul Razz',
	description: 'Get in touch with Rahul Razz, a B.tech CSE student from IIT, India, for  academic inquiries, or professional opportunities.',
};

export default function ContactPage() {
	return (
		<div className="pt-24">
			<SectionContainer>
				<PageHeader
					title="Contact Me"
					description="Have a question or want to collaborate? Feel free to reach out."
				/>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					<div>
						<h3 className="text-2xl font-bold mb-6">Get In Touch</h3>

						<div className="space-y-6 mb-8">
							<div className="flex items-start">
								<MapPin className="h-5 w-5 text-primary mr-3 mt-1" />
								<div>
									<h4 className="font-medium mb-1">Location</h4>
									<p className="text-muted-foreground">{contactInfo.address}</p>
								</div>
							</div>

							<div className="flex items-start">
								<Mail className="h-5 w-5 text-primary mr-3 mt-1" />
								<div>
									<h4 className="font-medium mb-1">Email</h4>
									<a
										href={`mailto:${contactInfo.email}`}
										className="text-muted-foreground hover:text-primary transition-colors"
									>
										{contactInfo.email}
									</a>
								</div>
							</div>

							<div className="flex items-start">
								<Phone className="h-5 w-5 text-primary mr-3 mt-1" />
								<div>
									<h4 className="font-medium mb-1">Phone</h4>
									<a
										href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
										className="text-muted-foreground hover:text-primary transition-colors"
									>
										{contactInfo.phone}
									</a>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<h4 className="font-medium">Connect with me</h4>

							<div className="flex space-x-4">
								<Link
									href={contactInfo.socialMedia.linkedin}
									target="_blank"
									rel="noopener noreferrer"
									className="bg-card p-3 rounded-full text-muted-foreground hover:text-primary hover:shadow-md transition-all"
								>
									<Linkedin className="h-5 w-5" />
									<span className="sr-only">LinkedIn</span>
								</Link>

								<Link
									href={contactInfo.socialMedia.twitter}
									target="_blank"
									rel="noopener noreferrer"
									className="bg-card p-3 rounded-full text-muted-foreground hover:text-primary hover:shadow-md transition-all"
								>
									<Twitter className="h-5 w-5" />
									<span className="sr-only">Twitter</span>
								</Link>

								<Link
									href={contactInfo.socialMedia.github}
									target="_blank"
									rel="noopener noreferrer"
									className="bg-card p-3 rounded-full text-muted-foreground hover:text-primary hover:shadow-md transition-all"
								>
									<Github className="h-5 w-5" />
									<span className="sr-only">GitHub</span>
								</Link>
							</div>
						</div>

						<div className="mt-10">
							<p className="text-muted-foreground mb-4">
								Interested in my qualifications? Download my CV for a complete overview of my academic and research background.
							</p>
							<CVButton variant="outline" />
						</div>
					</div>

					<ContactForm />
				</div>
			</SectionContainer>
		</div>
	);
}