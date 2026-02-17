import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { 
  Calculator, 
  BookOpen, 
  Users, 
  Globe, 
  GraduationCap,
  CheckCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import ImagePlaceholder from "./ImagePlaceholder";
import { useContent } from "@/contexts/ContentContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Features = () => {
  const { content } = useContent();
  const { language } = useLanguage();
  const localized = content[language];
  
  const iconMap = {
    Calculator: <Calculator className="h-8 w-8" />,
    BookOpen: <BookOpen className="h-8 w-8" />,
    Users: <Users className="h-8 w-8" />,
    Globe: <Globe className="h-8 w-8" />,
    GraduationCap: <GraduationCap className="h-8 w-8" />,
    CheckCircle: <CheckCircle className="h-8 w-8" />
  };

  return (
    <section className="py-16 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            {localized.features.title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {localized.features.description}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {localized.features.items.map((feature, index) => (
            <div key={feature.id} className="group">
              <div className="bg-card p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-elegant transition-all duration-300 border h-full flex flex-col relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-accent/5 to-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
                
                <div className="relative z-10">
                  <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                    {iconMap[feature.icon as keyof typeof iconMap] || <Calculator className="h-8 w-8" />}
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed flex-grow">
                    {feature.description}
                  </p>
                  
                  {/* Hover arrow removed */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="relative text-center bg-gradient-primary rounded-2xl p-8 lg:p-12 text-primary-foreground overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-accent/20 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-accent/20 rounded-full translate-x-12 translate-y-12"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-accent mr-2" />
              <h3 className="text-2xl lg:text-3xl font-bold">
                {localized.features.cta?.title || 'Ready to Start Your American Accounting Journey?'}
              </h3>
              <Sparkles className="h-6 w-6 text-accent ml-2" />
            </div>
            <p className="text-lg opacity-90 mb-8">
              {localized.features.cta?.description || 'Join our comprehensive program and gain the skills needed to work with US businesses and freelance worldwide.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" size="lg" asChild className="group">
                <Link to={localized.features.cta?.primaryHref || "/courses"} className="flex items-center">
                  {localized.features.cta?.primaryLabel || 'See Course Details'}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground group"
                asChild
              >
                <Link to={localized.features.cta?.secondaryHref || "/contact"} className="flex items-center">
                  {localized.features.cta?.secondaryLabel || 'Contact Us'}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>


        {/* Instagram / LinkedIn / Facebook */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">{localized.features.instagram?.title || 'Follow Our Journey'}</h3>
            {localized.features.instagram?.subtitle ? (
              <p className="text-muted-foreground">{localized.features.instagram?.subtitle}</p>
            ) : null}
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Instagram */}
            <div className="bg-card p-8 rounded-xl shadow-sm border text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold text-xl">{localized.features.instagram?.badge || 'IG'}</span>
                </div>
                <h4 className="text-lg font-semibold mb-2">{localized.features.instagram?.handle || '@penandpaperaccounting'}</h4>
                <p className="text-muted-foreground mb-6">
                  {localized.features.instagram?.description || 'Follow us on Instagram for student success stories, course updates, and accounting tips'}
                </p>
                <Button variant="outline" asChild>
                  <a href={localized.features.instagram?.url || "https://www.instagram.com/penandpaperaccounting/"} target="_blank" rel="noopener noreferrer">
                    {localized.features.instagram?.buttonLabel || 'View Instagram Feed'}
                  </a>
                </Button>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="bg-card p-8 rounded-xl shadow-sm border text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-600/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">{localized.features.linkedin?.badge || 'IN'}</span>
                </div>
                <h4 className="text-lg font-semibold mb-2">{localized.features.linkedin?.handle || 'LinkedIn'}</h4>
                <p className="text-muted-foreground mb-6">
                  {localized.features.linkedin?.description || 'Follow us on LinkedIn for news, updates, and professional insights.'}
                </p>
                <Button variant="outline" asChild>
                  <a href={localized.features.linkedin?.url || "https://www.linkedin.com/company/pen-paper-accounting/"} target="_blank" rel="noopener noreferrer">
                    {localized.features.linkedin?.buttonLabel || 'View LinkedIn Page'}
                  </a>
                </Button>
              </div>
            </div>

            {/* Facebook */}
            <div className="bg-card p-8 rounded-xl shadow-sm border text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-500/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">{localized.features.facebook?.badge || 'FB'}</span>
                </div>
                <h4 className="text-lg font-semibold mb-2">{localized.features.facebook?.handle || 'Facebook'}</h4>
                <p className="text-muted-foreground mb-6">
                  {localized.features.facebook?.description || 'Stay updated with announcements and events on our Facebook page.'}
                </p>
                <Button variant="outline" asChild>
                  <a href={localized.features.facebook?.url || "https://www.facebook.com/share/1GDZ1qCAW2/?mibextid=wwXIfr"} target="_blank" rel="noopener noreferrer">
                    {localized.features.facebook?.buttonLabel || 'View Facebook Page'}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;