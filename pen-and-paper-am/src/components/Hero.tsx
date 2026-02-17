import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import heroImageDefault from "@/assets/hero-accounting.jpg";
import { CheckCircle, BookOpen, Users, Award } from "lucide-react";
import ImagePlaceholder from "./ImagePlaceholder";
import { useContent } from "@/contexts/ContentContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const { content } = useContent();
  const { language } = useLanguage();
  const localized = content[language];
  
  const heroImage = localized.hero.image || heroImageDefault;
  
  const iconMap = {
    BookOpen: <BookOpen className="h-6 w-6" />,
    Users: <Users className="h-6 w-6" />,
    CheckCircle: <CheckCircle className="h-6 w-6" />,
    Award: <Award className="h-6 w-6" />,
    Calculator: <BookOpen className="h-6 w-6" />,
    Globe: <Users className="h-6 w-6" />,
    GraduationCap: <Award className="h-6 w-6" />
  };

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      <div className="container mx-auto px-4 py-12 lg:py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-4 lg:space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                {localized.hero.title}
                <span className="block bg-gradient-primary bg-clip-text gradient-text-fix mt-2 pb-2 leading-normal">
                  {localized.hero.subtitle}
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mt-8 pt-2">
                {localized.hero.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              {localized.features.items.map((feature, index) => (
                <div key={feature.id} className="flex items-center space-x-3 p-3 lg:p-4 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors duration-200">
                  <div className="text-primary flex-shrink-0">
                    {iconMap[feature.icon as keyof typeof iconMap] || <BookOpen className="h-6 w-6" />}
                  </div>
                  <span className="text-sm lg:text-base font-medium">{feature.title}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/courses">{localized.hero.ctaPrimary}</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">{localized.hero.ctaSecondary}</Link>
              </Button>
            </div>

            <div className="flex items-center space-x-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">{i}</span>
                    </div>
                  ))}
                </div>
                <span>{localized.hero.studentsTrained}</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 lg:p-8 shadow-elegant">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={heroImage}
                  alt="Professional accounting training setup with laptop showing QuickBooks interface"
                  className="w-full h-auto rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-xl"></div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-accent opacity-20 rounded-2xl blur-3xl transform rotate-6"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/30 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
