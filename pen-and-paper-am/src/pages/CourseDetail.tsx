import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { useParams, Link } from "react-router-dom";
import { useContent } from "@/contexts/ContentContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const CourseDetail = () => {
  const { slug } = useParams();
  const { content } = useContent();
  const { language, t } = useLanguage();
  const localized = content[language];
  const course = localized.courses.items.find(c => c.slug === slug && c.isVisible !== false);
  const latestRelatedAnnouncement = (localized.announcements?.items || [])
    .filter(a => {
      if (a.isVisible === false) return false;
      const hasCoursesCategory = (a.categories || [a.category]).includes('courses');
      const isRelated = a.relatedCourseId === (course?.id || '');
      return hasCoursesCategory && isRelated;
    })
    .sort((a, b) => Number(b.id) - Number(a.id))[0];

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Course not found</h1>
          <p className="text-muted-foreground mb-8">The course you are looking for does not exist or was removed.</p>
          <Button asChild>
            <Link to="/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const features = (course.features || []).map((s) => (s ?? '').trim()).filter(Boolean);
  const deliverables = (course.deliverables || []).map((s) => (s ?? '').trim()).filter(Boolean);
  const requirements = (course.requirements || []).map((s) => (s ?? '').trim()).filter(Boolean);
  const outcomes = (course.outcomes || []).map((s) => (s ?? '').trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={course.title}
        description={course.description}
        url={`/courses/${course.slug}`}
        type="course"
        keywords={`${course.title}, ${course.target}, ${course.format}, accounting course`}
      />
      <StructuredData 
        type="course"
        name={course.title}
        description={course.description}
        provider="Pen & Paper Accounting"
        duration={course.duration}
        courseMode={course.format}
        url={`https://ppa.am/courses/${course.slug}`}
      />
      <Navigation />

      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button variant="outline" asChild>
                <Link to="/courses"><ArrowLeft className="h-4 w-4 mr-2" /> {t('nav.courses')}</Link>
              </Button>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

            <div className="flex flex-wrap gap-2 mb-8">
              <Badge variant="secondary">{t('courses.duration')}: {course.duration}</Badge>
              <Badge variant="secondary">{t('courses.format')}: {course.format}</Badge>
              <Badge variant="secondary">{t('courses.target')}: {course.target}</Badge>
            </div>

            <div className="space-y-10">
              {features.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">{t('courses.whatYoullLearn')}</h2>
                  <ul className="space-y-2">
                    {features.map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {deliverables.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Deliverables</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {deliverables.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {requirements.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Requirements</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {requirements.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {outcomes.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Outcomes</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {outcomes.map((o, idx) => (
                      <li key={idx}>{o}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4">
                <Button size="lg" asChild>
                  <Link to="/contact">{t('courses.requestConsultation')}</Link>
                </Button>
              </div>

              {latestRelatedAnnouncement && (
                <div className="pt-12">
                  <Card className="overflow-hidden">
                    {latestRelatedAnnouncement.image ? (
                      <div className="aspect-[16/9] overflow-hidden">
                        <img src={latestRelatedAnnouncement.image} alt={latestRelatedAnnouncement.title} className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <CardHeader>
                      <CardTitle className="text-xl">{latestRelatedAnnouncement.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{latestRelatedAnnouncement.summary}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" asChild>
                        <Link to={`/announcements/${latestRelatedAnnouncement.slug || latestRelatedAnnouncement.id}`}>{t('ann.readMore')}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CourseDetail;
