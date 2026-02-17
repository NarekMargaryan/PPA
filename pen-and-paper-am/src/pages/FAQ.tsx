import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useState, useMemo, type ComponentType } from "react";
import { 
  HelpCircle, 
  BookOpen, 
  Users, 
  Clock, 
  Globe, 
  Mail,
  Phone,
  ArrowRight,
  Search,
  Star
} from "lucide-react";
import { useContent } from "@/contexts/ContentContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { sanitizeRichText, stripHtml } from "@/lib/sanitize";

const FAQ = () => {
  const { content } = useContent();
  const { language, t } = useLanguage();
  const localized = content[language];
  const faqs = localized.faq.questions;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const getIcon = (iconName: string) => {
    const icons: Record<string, ComponentType<{ className?: string }>> = {
      BookOpen, Users, Mail, Phone, Globe, Clock
    };
    const IconComponent = icons[iconName] || BookOpen;
    return <IconComponent className="h-6 w-6" />;
  };

  const quickActions = localized.faq.quickActions || [
    {
      id: "1",
      icon: "BookOpen",
      title: "View Course Details",
      description: "Learn more about our Advanced and Beginner tracks",
      actionLabel: "View Courses",
      href: "/courses"
    },
    {
      id: "2",
      icon: "Users",
      title: "Schedule Consultation",
      description: "Book a free 15-minute call to discuss your goals",
      actionLabel: "Get Started",
      href: "/contact"
    },
    {
      id: "3",
      icon: "Mail",
      title: "Email Us",
      description: "Send us your questions directly",
      actionLabel: "hello@penandpaper.am",
      href: "mailto:hello@penandpaper.am"
    }
  ];

  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add("all");
    faqs.forEach(faq => {
      if (faq.category) cats.add(faq.category);
    });
    return Array.from(cats);
  }, [faqs]);

  const filteredFAQs = useMemo(() => {
    let filtered = faqs;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(query) || 
        stripHtml(faq.answer).toLowerCase().includes(query)
      );
    }
    
    return filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.order || 999) - (b.order || 999);
    });
  }, [faqs, selectedCategory, searchQuery]);

  const groupedFAQs = useMemo(() => {
    const groups: Record<string, typeof faqs> = {};
    filteredFAQs.forEach(faq => {
      const cat = faq.category || t('faq.generalCategory');
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(faq);
    });
    return groups;
  }, [filteredFAQs, t]);

  const seoKeywords = language === 'en'
    ? 'accounting course FAQ Armenia, course requirements, enrollment questions, tuition fees, training schedule Yerevan, frequently asked questions'
    : 'հարցեր դասընթացների մասին Հայաստան, գրանցման պայմաններ, ուսուցման ժամանակացույց Երևան, դասավանդման հարցեր';

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={t('faq.title')}
        description={t('faq.description')}
        url="/faq"
        keywords={seoKeywords}
      />
      <StructuredData 
        type="faq"
        items={faqs.map(faq => ({
          question: faq.question,
          answer: stripHtml(faq.answer)
        }))}
      />
      <Navigation />
      
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              {t('faq.title')}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              {t('faq.description')}
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
              <span>{t('faq.needHelp')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder={t('faq.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {categories.length > 2 ? (
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-8">
                <TabsList className="w-full justify-start flex-wrap h-auto gap-2">
                  <TabsTrigger value="all" className="capitalize">
                    {t('faq.all')} ({faqs.length})
                  </TabsTrigger>
                  {categories.filter(cat => cat !== "all").map(category => (
                    <TabsTrigger key={category} value={category} className="capitalize">
                      {category} ({faqs.filter(f => f.category === category).length})
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map(category => (
                  <TabsContent key={category} value={category} className="space-y-6">
                    {selectedCategory === "all" ? (
                      Object.entries(groupedFAQs).map(([cat, catFAQs]) => (
                        <div key={cat} className="space-y-4">
                          <h3 className="text-xl font-bold text-primary border-b pb-2">{cat}</h3>
                          <Accordion type="single" collapsible className="space-y-4">
                            {catFAQs.map((faq, index) => (
                              <AccordionItem key={faq.id} value={`item-${faq.id}`} className="border rounded-lg px-6">
                                <AccordionTrigger className="text-left hover:no-underline py-6">
                                  <div className="flex items-center gap-2 flex-1">
                                    {faq.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                                    <span className="font-semibold text-lg">{faq.question}</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6">
                                  <div 
                                    className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(faq.answer) }}
                                  />
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      ))
                    ) : (
                      <Accordion type="single" collapsible className="space-y-4">
                        {filteredFAQs.map((faq, index) => (
                          <AccordionItem key={faq.id} value={`item-${faq.id}`} className="border rounded-lg px-6">
                            <AccordionTrigger className="text-left hover:no-underline py-6">
                              <div className="flex items-center gap-2 flex-1">
                                {faq.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                                <span className="font-semibold text-lg">{faq.question}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6">
                              <div 
                                className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: sanitizeRichText(faq.answer) }}
                              />
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                    
                    {filteredFAQs.length === 0 && (
                      <div className="text-center py-12">
                        <HelpCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                        <p className="text-muted-foreground">
                          {t('faq.noResults')}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <AccordionItem key={faq.id} value={`item-${faq.id}`} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline py-6">
                      <div className="flex items-center gap-2 flex-1">
                        {faq.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                        <span className="font-semibold text-lg">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div 
                        className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeRichText(faq.answer) }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('faq.needHelp')}</h2>
            <p className="text-lg text-muted-foreground">
              {t('contact.quickHelp')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {quickActions.map((action) => (
              <Card key={action.id} className="group hover:shadow-elegant transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    {getIcon(action.icon)}
                  </div>
                  <CardTitle className="text-xl">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                    asChild
                  >
                    <Link to={action.href}>
                      {action.actionLabel}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gradient-primary text-primary-foreground">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {localized.faq.ctaSection?.title || t('faq.readyToStart')}
              </CardTitle>
              <CardDescription className="text-primary-foreground/90">
                {localized.faq.ctaSection?.description || t('faq.ctaFallbackDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                {(localized.faq.ctaSection?.showEmail !== false) && (
                  <div className="flex items-center justify-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{localized.contact.email}</span>
                  </div>
                )}
                {(localized.faq.ctaSection?.showPhone !== false) && (
                  <div className="flex items-center justify-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${localized.contact.phone.replace(/\s/g, '')}`} className="hover:text-primary-foreground transition-colors">
                      {localized.contact.phone}
                    </a>
                  </div>
                )}
                {(localized.faq.ctaSection?.showLocation !== false) && (
                  <div className="flex items-center justify-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>{localized.contact.address}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="accent" size="lg" asChild>
                  <Link to="/contact">{t('common.contactUs')}</Link>
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90"
                  asChild
                >
                  <Link to="/courses">{t('nav.courses')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
