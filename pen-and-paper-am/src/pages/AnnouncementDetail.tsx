import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useParams, Link } from "react-router-dom";
import { useContent } from "@/contexts/ContentContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Megaphone, Calendar, Tag } from "lucide-react";
import { sanitizeRichText, stripHtml } from "@/lib/sanitize";

const AnnouncementDetail = () => {
  const { slug } = useParams();
  const { content } = useContent();
  const { language, t } = useLanguage();
  const localized = content[language];
  const ann = (localized.announcements?.items || []).find(
    (a) => (a.slug || a.id) === slug && a.isVisible !== false
  );
  
  const relatedAnnouncements = ann ? (localized.announcements?.items || [])
    .filter(a => a.isVisible !== false && a.id !== ann.id)
    .filter(a => {
      const annCategories = ann.categories || [ann.category];
      const aCategories = a.categories || [a.category];
      return annCategories.some(cat => aCategories.includes(cat));
    })
    .slice(0, 3) : [];

  if (!ann) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Announcement not found</h1>
          <p className="text-muted-foreground mb-8">The announcement you are looking for does not exist or was removed.</p>
          <Button asChild>
            <Link to="/announcements">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('ann.backToList')}
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={ann.title}
        description={ann.summary || stripHtml(ann.content || '').substring(0, 160)}
        url={`/announcements/${ann.slug || ann.id}`}
        type="article"
        image={ann.image}
        article={{
          publishedTime: ann.publishedDate,
          section: ann.category,
          tags: ann.tags
        }}
      />
      <Navigation />

      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <Button variant="outline" asChild>
                <Link to="/announcements"><ArrowLeft className="h-4 w-4 mr-2" /> {t('ann.backToList')}</Link>
              </Button>
              {ann.category ? (
                <Badge variant="secondary">{ann.category === 'courses' ? t('ann.category.courses') : ann.category === 'jobs' ? t('ann.category.jobs') : t('ann.category.news')}</Badge>
              ) : null}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Megaphone className="h-6 w-6 text-primary" />
              <h1 className="text-4xl font-bold">{ann.title}</h1>
            </div>
            
            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground flex-wrap">
              {ann.publishedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(ann.publishedDate).toLocaleDateString(language === 'en' ? 'en-US' : 'hy-AM', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
              {ann.tags && ann.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <div className="flex gap-2">
                    {ann.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {ann.summary ? (
              <p className="text-lg text-muted-foreground mb-8">{ann.summary}</p>
            ) : null}
            {ann.image ? (
              <div className="mb-8 overflow-hidden rounded-xl">
                <img src={ann.image} alt={ann.title} className="w-full h-auto object-cover" />
              </div>
            ) : null}
            {Array.isArray(ann.images) && ann.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {ann.images.map((url, idx) => (
                  <img key={idx} src={url} alt={`Image ${idx+1}`} className="w-full h-40 object-cover rounded-md border" />
                ))}
              </div>
            ) : null}
            <div className="prose prose-neutral dark:prose-invert max-w-none mb-8">
              <div dangerouslySetInnerHTML={{ __html: sanitizeRichText(ann.content) }} />
            </div>
            
            <div className="pt-6 pb-8 border-b">
              <Button variant="outline" type="button" onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
              }}>{t('ann.share')}</Button>
            </div>
            
            {relatedAnnouncements.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">{t('ann.relatedAnnouncements')}</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedAnnouncements.map(related => (
                    <Card key={related.id} className="group hover:shadow-md transition-shadow">
                      {related.image && (
                        <div className="aspect-[16/9] overflow-hidden">
                          <img src={related.image} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-2">{related.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{related.summary}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link to={`/announcements/${related.slug || related.id}`}>{t('ann.readMore')}</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AnnouncementDetail;


