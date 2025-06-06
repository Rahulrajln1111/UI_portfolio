import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export default function PageHeader({ 
  title, 
  description, 
  className 
}: PageHeaderProps) {
  return (
    <div className={cn('text-center mb-12', className)}>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
        {title}
      </h1>
      {description && (
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}