import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Clock, 
  Users, 
  Award, 
  BookOpen, 
  Globe,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import classroomImage from "@/assets/classroom-training.jpg";
import { useContent } from "@/contexts/ContentContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Courses = () => {
  const { content } = useContent();
  const { language, t } = useLanguage();
  const localized = content[language];
  const visibleCourses = localized.courses.items.filter(course => course.isVisible);

  const commonBenefits = [
    {
      icon: <Award className="h-6 w-6" />,
      title: t('courses.benefit.certificateTitle'),
      description: t('courses.benefit.certificateDesc')
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: t('courses.benefit.englishTitle'),
      description: t('courses.benefit.englishDesc')
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: t('courses.benefit.portfolioTitle'),
      description: t('courses.benefit.portfolioDesc')
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: t('courses.benefit.freelanceTitle'),
      description: t('courses.benefit.freelanceDesc')
    }
  ];

  const seoKeywords = language === 'en' 
    ? 'accounting courses Armenia, QuickBooks training Yerevan, Xero certification, bookkeeping courses, US accounting training, freelance accounting Armenia'
    : 'հաշվապահական դասընթացներ Հայաստան, QuickBooks ուսուցում Երևան, Xero սերտիֆիկացիա, հաշվապահական կուրսեր, ֆրիլանս հաշվապահ Հայաստան';

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={localized.courses.title}
        description={localized.courses.description}
        url="/courses"
        keywords={seoKeywords}
      />
      <Navigation />
      
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                {localized.courses.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {localized.courses.description}
              </p>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{t('courses.meta.duration')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{t('courses.meta.groupSize')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>{t('courses.meta.certificate')}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={classroomImage} 
                alt="Professional accounting training classroom"
                className="w-full h-auto rounded-xl shadow-elegant"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {visibleCourses.map((track, index) => (
              <div key={index} className="group">
                <div className="bg-card rounded-xl shadow-sm hover:shadow-elegant transition-all duration-300 border overflow-hidden">
                  <div className={`bg-gradient-to-r from-primary to-primary-light p-6 text-primary-foreground`}>
                    <h3 className="text-2xl font-bold mb-2">{track.title}</h3>
                    <p className="text-lg opacity-90">{track.shortDescription}</p>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {track.description}
                    </p>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('courses.target')}:</span>
                        <span className="font-medium">{track.target}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('courses.duration')}:</span>
                        <span className="font-medium">{track.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('courses.format')}:</span>
                        <span className="font-medium">{track.format}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        {t('courses.whatYoullLearn')}:
                      </h4>
                      <ul className="space-y-2">
                        {track.features.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground" 
                      asChild
                    >
                      <Link to={`/courses/${track.slug}`}>
                        {t('courses.viewSyllabus')}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('courses.commonBenefitsTitle')}</h2>
            <p className="text-lg text-muted-foreground">
              {t('courses.commonBenefitsDesc')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {commonBenefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-secondary/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('courses.readyCtaTitle')}</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            {t('courses.readyCtaDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="lg" asChild>
              <Link to="/contact">{t('courses.requestConsultation')}</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link to="/faq">{t('courses.viewFaq')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Courses;
