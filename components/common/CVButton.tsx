'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CVButtonProps {
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
}

export default function CVButton({ className, variant = 'default' }: CVButtonProps) {
  const handleDownload = () => {
    // In a real application, this would be a link to the actual CV file
    // For this demo, we're just showing the functionality
    alert('CV download would start here with the actual file');
  };

  return (
    <Button 
      variant={variant}
      className={cn('group', className)}
      onClick={handleDownload}
    >
      <span className="mr-2">Download CV</span>
      <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
    </Button>
  );
}