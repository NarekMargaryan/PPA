import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  variant?: "default" | "white" | "primary";
}

const Logo = ({ 
  size = "md", 
  className, 
  showText = true, 
  variant = "default" 
}: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-14 h-14",
    xl: "w-18 h-18"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl", 
    xl: "text-3xl"
  };

  const textColorClasses = {
    default: "text-primary",
    white: "text-white",
    primary: "text-primary"
  };

  const subtextColorClasses = {
    default: "text-muted-foreground",
    white: "text-white/80",
    primary: "text-primary-foreground/80"
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn("flex items-center justify-center", sizeClasses[size])}>
        <img 
          src={variant === "white" ? "/logo_white.png" : "/logo.png"}
          alt="PPA Logo" 
          className={cn("object-contain", sizeClasses[size])}
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-bold leading-none", textSizeClasses[size], textColorClasses[variant])}>
            Pen & Paper
          </span>
          <span className={cn("text-xs leading-none mt-0.5", subtextColorClasses[variant])}>
            Accounting
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
