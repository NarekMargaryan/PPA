import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { Megaphone, ArrowRight } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const { content } = useContent();
  const { language, t } = useLanguage();
  const localized = content[language];
  const pinned = (localized.announcements?.items || [])
    .filter(a => a.pinned)
    .sort((a, b) => Number(b.id) - Number(a.id))[0];
  const latestThree = (localized.announcements?.items || [])
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        url="/"
        type="website"
      />
      <StructuredData type="organization" />
      <Navigation />
      {pinned && (
        <div className="bg-accent/15 border-b">
          <div className="container mx-auto px-4 py-3 flex items-start md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3">
              <Megaphone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-semibold">{pinned.title}</div>
                {pinned.summary ? (
                  <div className="text-sm text-muted-foreground line-clamp-2">{pinned.summary}</div>
                ) : null}
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/announcements/${pinned.slug || pinned.id}`} className="inline-flex items-center">
                <span>{t('ann.readMore')}</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      )}
      <Hero />
      {/* Announcements teaser */}
      {latestThree.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                {t('ann.title')}
              </h2>
              <Button variant="outline" asChild>
                <Link to="/announcements">{t('common.viewAll')}</Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestThree.map((ann) => (
                <Card key={ann.id} className="overflow-hidden">
                  {ann.image ? (
                    <img src={ann.image} alt={ann.title} className="w-full h-40 object-cover" />
                  ) : null}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-xl">{ann.title}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-3">{ann.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild>
                      <Link to={`/announcements/${ann.slug || ann.id}`}>{t('ann.readMore')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
      <Features />
      <Footer />
    </div>
  );
};

export default Index;
