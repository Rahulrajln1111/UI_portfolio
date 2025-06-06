'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Award, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const blog = [
  {
    id: 1,
    title: 'Binary exploitaion techniques',
    issuer: '',
    date: 'June 2026',
    description: 'We will discuss about different techniques of pwn',
    imageUrl: 'https://user-images.githubusercontent.com/4478350/39750107-f58848c0-52e6-11e8-8759-8629cb40e315.PNG',
    credential: ''
  }
];

export default function blogGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blog.map((blog, index) => (
        <motion.div
          key={blog.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="group"
        >
          <Dialog>
            <DialogTrigger asChild>
              <div className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative h-48">
                  <Image
                    src={blog.imageUrl}
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Award className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-bold mb-1">{blog.title}</h3>
                      <p className="text-sm text-muted-foreground">{blog.issuer}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{blog.date}</span>
                  </div>
                </div>
              </div>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{blog.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Issued by {blog.issuer}
                </DialogDescription>
              </DialogHeader>
              
              <div className="relative h-48 my-4">
                <Image
                  src={blog.imageUrl}
                  alt={blog.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {blog.description}
                </p>
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm font-medium">Credential ID:</p>
                  <p className="text-sm text-muted-foreground">{blog.credential}</p>
                </div>
                
                <Button className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Verify blogificate
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      ))}
    </div>
  );
}