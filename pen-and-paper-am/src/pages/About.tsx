import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Target, 
  Users, 
  Award, 
  Globe, 
  BookOpen, 
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { useContent } from "@/contexts/ContentContext";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { content } = useContent();
  const { language, t } = useLanguage();
  const localized = content[language];
  const values = localized.about.values.map((v) => ({
    icon: v.icon === 'Target' ? <Target className="h-8 w-8" /> : v.icon === 'Users' ? <Users className="h-8 w-8" /> : v.icon === 'Globe' ? <Globe className="h-8 w-8" /> : <Award className="h-8 w-8" />,
    title: v.title,
    description: v.description,
  }));

  const seoKeywords = language === 'en'
    ? 'accounting school Armenia, professional accounting training Yerevan, certified instructors, accounting education, PPA Armenia'
    : 'հաշվապահական դպրոց Հայաստան, պրոֆեսիոնալ հաշվապահական ուսուցում Երևան, սերտիֆիկացված դասախոսներ, հաշվապահական կրթություն';

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={localized.about.title}
        description={localized.about.mission}
        url="/about"
        keywords={seoKeywords}
      />
      <Navigation />
      
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              {localized.about.title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              {localized.about.mission}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <BookOpen className="h-4 w-4 mr-2" />
                {t('about.badge.practical')}
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Globe className="h-4 w-4 mr-2" />
                {t('about.badge.global')}
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Users className="h-4 w-4 mr-2" />
                {t('about.badge.studentSuccess')}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">{t('about.mission')}</h2>
          {(localized.about.missionParagraphs && localized.about.missionParagraphs.length > 0
            ? localized.about.missionParagraphs
            : [
                'PPA was founded to bridge the gap between Armenian accounting education and the demands of the global market. We recognized that while Armenian accountants are highly skilled, they often lack exposure to US accounting systems and freelance opportunities.',
                'Our approach combines theoretical knowledge with practical application, ensuring students not only understand concepts but can immediately apply them in real-world scenarios with US clients.'
              ]
            ).map((para: string, idx: number) => (
              <p key={idx} className={`text-lg text-muted-foreground leading-relaxed ${idx === 0 ? 'mb-6' : 'mb-8'}`}>
                {para}
              </p>
          ))}
              <div className="space-y-4">
            {(localized.about.missionPoints && localized.about.missionPoints.length > 0
              ? localized.about.missionPoints
              : [
                  'Hands-on training with real US business data',
                  'Direct experience with industry-standard software',
                  'Freelance guidance and client communication skills'
                ]
              ).map((point: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>{point}</span>
                </div>
            ))}
              </div>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-4">
                {localized.about.imagePrimary && (
                  <img src={localized.about.imagePrimary} alt="About primary" className="rounded-xl shadow-elegant w-full h-auto" />
                )}
                {localized.about.imageSecondary && (
                  <img src={localized.about.imageSecondary} alt="About secondary" className="rounded-xl shadow-elegant w-full h-auto" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
      <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
        {(localized.about.statsBoxes && localized.about.statsBoxes.length > 0
          ? localized.about.statsBoxes
          : [
              { number: localized.about.stats.students, label: t('about.stats.students') },
              { number: localized.about.stats.placement, label: t('about.stats.placement') },
              { number: localized.about.stats.experience, label: t('about.stats.experience') },
              { number: localized.about.stats.clients, label: t('about.stats.clients') }
            ]
          ).map((stat: any, index: number) => (
            <div key={stat.id ?? index} className="text-center min-w-[140px] lg:min-w-[180px]">
              <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
        ))}
      </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('about.team')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('about.teamDescription')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {localized.about.team.map((instructor, index) => (
              <Card key={index} className="group hover:shadow-elegant transition-all duration-300">
                <CardHeader>
                  {instructor.image ? (
                    <img src={instructor.image} alt={instructor.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4" />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">
                      {instructor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <CardTitle className="text-center">{instructor.name}</CardTitle>
                  <CardDescription className="text-center text-primary font-medium">
                    {instructor.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {instructor.bio}
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">{t('about.expertise')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {instructor.expertise.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('about.values')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('about.valuesDescription')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {value.icon}
                </div>
                <h3 className="font-semibold mb-3">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('about.readyTitle')}</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            {t('about.readyDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="lg" asChild>
              <Link to="/courses">{t('about.readyPrimary')}</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link to="/contact">{t('about.readySecondary')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
