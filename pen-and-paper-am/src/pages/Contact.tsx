import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Instagram, Clock, Linkedin, Facebook } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { FormEvent, useState } from "react";
import { addContactSubmission, getContactSubmissionStorageMode } from "@/lib/contactSubmissions";
import { trackFormSubmit } from "@/components/GoogleAnalytics";

const Contact = () => {
  const { content } = useContent();
  const { language, t } = useLanguage();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [submitFeedback, setSubmitFeedback] = useState<"idle" | "success" | "warning" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const localized = content[language];
  const seoKeywords = language === 'en'
    ? 'contact accounting school Armenia, accounting training inquiry, course registration Yerevan, consultation booking, enroll accounting course'
    : 'կապ հաշվապահական դպրոց Հայաստան, դասընթացների գրանցում Երևան, խորհրդատվություն, գրանցվել հաշվապահական դասընթաց';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitFeedback("idle");
    setSubmitMessage("");

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const phone = String(formData.get("phone") || "").trim();
    const startDate = String(formData.get("startDate") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!firstName || !lastName || !email) {
      setSubmitFeedback("error");
      setSubmitMessage(
        language === "en"
          ? "Please fill in the required fields."
          : "Խնդրում ենք լրացնել պարտադիր դաշտերը։"
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setSubmitFeedback("error");
      setSubmitMessage(
        language === "en"
          ? "Please enter a valid email address."
          : "Խնդրում ենք մուտքագրել վավեր էլ. փոստ։"
      );
      return;
    }

    try {
      addContactSubmission({
        firstName,
        lastName,
        email,
        phone,
        course: selectedCourse,
        startDate,
        message,
        language,
        source: "/contact"
      });

      trackFormSubmit("contact_form", {
        language,
        course: selectedCourse || "not_selected"
      });

      event.currentTarget.reset();
      setSelectedCourse("");

      const storageMode = getContactSubmissionStorageMode();
      if (storageMode === "local") {
        setSubmitFeedback("success");
        setSubmitMessage(
          language === "en"
            ? "Your request was sent successfully. We will contact you soon."
            : "Ձեր հայտը հաջողությամբ ուղարկվեց։ Շուտով կապ կհաստատենք ձեզ հետ։"
        );
      } else {
        setSubmitFeedback("warning");
        setSubmitMessage(
          language === "en"
            ? "Request saved, but this browser is using temporary storage mode. Please avoid private mode for reliable admin visibility."
            : "Հայտը պահվեց, բայց այս browser-ը ժամանակավոր պահման ռեժիմում է։ Խորհուրդ է տրվում չօգտագործել private mode՝ admin-ում վստահելի տեսանելիության համար։"
        );
      }
    } catch (error) {
      console.error("Failed to save contact submission:", error);
      setSubmitFeedback("error");
      setSubmitMessage(
        language === "en"
          ? "Could not submit your request. Please try again or contact us by phone."
          : "Հայտը չհաջողվեց ուղարկել։ Խնդրում ենք փորձել կրկին կամ կապ հաստատել հեռախոսով։"
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={localized.contact.title}
        description={localized.contact.description}
        url="/contact"
        keywords={seoKeywords}
      />
      <Navigation />
      
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">{localized.contact.title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{localized.contact.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('contact.sendMessage')}</CardTitle>
                <CardDescription>
                  {t('contact.formDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('contact.firstName')} *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder={t('contact.firstName')}
                        autoComplete="given-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('contact.lastName')} *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder={t('contact.lastName')}
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('contact.email')} *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="email"
                      inputMode="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('contact.phone')}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+374 XX XXX XXX"
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course">{t('contact.course')}</Label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('courses.title')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="advanced">{t('courses.advanced')}</SelectItem>
                        <SelectItem value="beginner">{t('courses.beginner')}</SelectItem>
                        <SelectItem value="consultation">{t('features.scheduleConsultation')}</SelectItem>
                        <SelectItem value="other">{t('common.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">{t('contact.startDate')}</Label>
                    <Input id="startDate" name="startDate" type="date" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('contact.message')}</Label>
                    <Textarea 
                      id="message" 
                      name="message"
                      placeholder={t('contact.messagePlaceholder')}
                      rows={5}
                    />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    {t('contact.sendButton')}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    {t('contact.requiredNote')}
                  </p>
                  {submitFeedback === "success" && (
                    <p className="text-sm text-green-600 text-center">{submitMessage}</p>
                  )}
                  {submitFeedback === "warning" && (
                    <p className="text-sm text-amber-600 text-center">{submitMessage}</p>
                  )}
                  {submitFeedback === "error" && (
                    <p className="text-sm text-destructive text-center">
                      {submitMessage}
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>{t('contact.getInTouch')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{t('contact.label.email')}</p>
                    <p className="text-sm text-muted-foreground">{localized.contact.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{t('contact.label.phone')}</p>
                    <p className="text-sm text-muted-foreground">{localized.contact.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{t('contact.label.location')}</p>
                    <p className="text-sm text-muted-foreground">{localized.contact.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Instagram className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{t('contact.label.instagram')}</p>
                    <a 
                      href={`https://www.instagram.com/${localized.contact.instagram.replace('@','')}/`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {localized.contact.instagram}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Linkedin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{t('contact.label.linkedin')}</p>
                    <a 
                      href={localized.features.linkedin?.url || "https://www.linkedin.com/company/pen-paper-accounting/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {localized.features.linkedin?.handle || 'Pen & Paper Accounting'}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Facebook className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{t('contact.label.facebook')}</p>
                    <a 
                      href={localized.features.facebook?.url || "https://www.facebook.com/share/1GDZ1qCAW2/?mibextid=wwXIfr"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {localized.features.facebook?.handle || 'Facebook'}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>{t('contact.officeHours')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(localized.contact.officeHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-sm">{t(`days.${day}`)}</span>
                    <span className="text-sm font-medium">{hours}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        </div>

        <div className="mt-16 text-center bg-secondary/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">
            {localized.contact.faqTeaser?.title || t('contact.haveQuestions')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {localized.contact.faqTeaser?.description || 
              t('contact.faqFallback')}
          </p>
          <Button variant="outline" asChild>
            <a href="/faq">{t('courses.viewFaq')}</a>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
