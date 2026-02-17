import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useContent } from "@/contexts/ContentContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Megaphone } from "lucide-react";
import { useMemo, useState } from "react";

const Announcements = () => {
  const { content } = useContent();
  const { language, t } = useLanguage();
  const localized = content[language];
  const items = useMemo(() => localized.announcements?.items ?? [], [localized.announcements?.items]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<'newest' | 'oldest'>("newest");
  const [visibleCount, setVisibleCount] = useState<number>(9);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let res = items.filter((a) => a.isVisible !== false);
    res = res.filter((a) =>
      [a.title, a.summary, a.category || ""].some((f) => (f || "").toLowerCase().includes(q))
    );
    if (category !== 'all') {
      res = res.filter(a => (a.category || '') === category);
    }
    res = res.sort((a: any, b: any) => sort === 'newest' ? (Number(b.id) - Number(a.id)) : (Number(a.id) - Number(b.id)));
    res = res.sort((a: any, b: any) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
    return res;
  }, [items, query, category, sort]);

  const seoDescription = language === 'en' 
    ? 'Latest news, course updates, and job opportunities from Pen & Paper Accounting in Armenia'
    : 'Վերջին նորություններ, դասընթացների թարմացումներ և աշխատանքի հնարավորություններ Pen & Paper Accounting-ից';
  
  const seoKeywords = language === 'en'
    ? 'accounting news Armenia, course announcements Yerevan, accounting job openings, training updates, bookkeeping jobs Armenia'
    : 'հաշվապահական նորություններ Հայաստան, դասընթացների հայտարարություններ Երևան, աշխատանքի հայտարարություններ, հաշվապահ աշխատանք';

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach(item => {
      if (item.categories && Array.isArray(item.categories)) {
        item.categories.forEach(cat => cats.add(cat));
      } else if (item.category) {
        cats.add(item.category);
      }
    });
    return Array.from(cats);
  }, [items]);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={localized.announcements?.title || t('ann.title')}
        description={localized.announcements?.description || seoDescription}
        url="/announcements"
        keywords={seoKeywords}
      />
      <Navigation />

      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Megaphone className="h-8 w-8 text-primary" />
              <h1 className="text-4xl lg:text-5xl font-bold">
                {localized.announcements?.title || t('ann.title')}
              </h1>
            </div>
            {localized.announcements?.description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {localized.announcements.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-6 flex-wrap mb-8">
            <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('ann.searchPlaceholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={category} onValueChange={(v: string) => setCategory(v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('ann.filter.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('ann.filter.all')}</SelectItem>
                  {allCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'courses' ? t('ann.category.courses') : 
                       cat === 'jobs' ? t('ann.category.jobs') : 
                       cat === 'news' ? t('ann.category.news') : 
                       cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={(v: any) => setSort(v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('ann.sort.label')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('ann.sort.newest')}</SelectItem>
                  <SelectItem value="oldest">{t('ann.sort.oldest')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Megaphone className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h2 className="text-2xl font-semibold mb-2">
                {localized.announcements?.emptyStateTitle || t('ann.noResults')}
              </h2>
              {localized.announcements?.emptyStateDescription && (
                <p className="text-muted-foreground max-w-md mx-auto">
                  {localized.announcements.emptyStateDescription}
                </p>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, visibleCount).map((ann) => (
                <Card key={ann.id} className="group hover:shadow-elegant transition-all duration-300 overflow-hidden">
                  {ann.image ? (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={ann.image} alt={ann.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : null}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-xl">{ann.title}</CardTitle>
                      {ann.category ? (
                        <Badge variant="secondary">
                          {ann.category === 'courses' ? t('ann.category.courses') : ann.category === 'jobs' ? t('ann.category.jobs') : t('ann.category.news')}
                        </Badge>
                      ) : null}
                    </div>
                    <CardDescription className="line-clamp-3">{ann.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild className="w-full">
                      <Link to={`/announcements/${ann.slug || ann.id}`}>{t('ann.readMore')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filtered.length > visibleCount && (
            <div className="text-center mt-10">
              <Button variant="outline" onClick={() => setVisibleCount(visibleCount + 9)}>{t('ann.loadMore')}</Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Announcements;


