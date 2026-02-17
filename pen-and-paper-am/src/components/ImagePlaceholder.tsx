import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  children?: React.ReactNode;
}

const ImagePlaceholder = ({ 
  width = 400, 
  height = 300, 
  className, 
  alt = "Placeholder image",
  children 
}: ImagePlaceholderProps) => {
  return (
    <div 
      className={cn(
        "bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center text-muted-foreground",
        className
      )}
      style={{ width, height }}
    >
      {children || (
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-medium">{alt}</p>
        </div>
      )}
    </div>
  );
};

export default ImagePlaceholder;
