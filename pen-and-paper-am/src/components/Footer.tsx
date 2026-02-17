import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin, Linkedin, Facebook } from "lucide-react";
import Logo from "./Logo";
import { useContent } from "@/contexts/ContentContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { content } = useContent();
  const { language, t } = useLanguage();
  const localized = content[language];
  
  const visibleCourses = localized.courses.items.filter(c => c.isVisible !== false);
  const coursesLinks = visibleCourses.map(course => ({
    id: course.id,
    label: course.title,
    href: `/courses/${course.slug}`
  }));
  
  coursesLinks.push({
    id: 'overview',
    label: t('courses.title'),
    href: '/courses'
  });
  
  const footerLinks = [
    {
      id: 'courses',
      title: t('nav.courses'),
      links: coursesLinks
    },
    ...localized.footer.links.filter(section => section.id !== 'courses')
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Logo size="md" showText={true} variant="white" />
              <p className="text-primary-foreground/80 text-sm mt-2">
                {localized.footer.tagline}
              </p>
            </div>
            <p className="text-primary-foreground/80 mb-6 leading-relaxed">
              {localized.footer.description}
            </p>
            
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      to={link.href}
                      className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-primary-foreground/80">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{localized.contact.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-primary-foreground/80">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{localized.contact.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-primary-foreground/80">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{localized.contact.address}</span>
              </div>
              <a 
                href={localized.contact.socials?.instagram || "https://www.instagram.com/penandpaperaccounting/"}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-4 w-4" />
                <span className="text-sm">{localized.contact.instagram}</span>
              </a>
              <a 
                href={localized.contact.socials?.linkedin || "https://www.linkedin.com/company/pen-paper-accounting/"}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                <span className="text-sm">LinkedIn</span>
              </a>
              <a 
                href={localized.contact.socials?.facebook || "https://www.facebook.com/share/1GDZ1qCAW2/?mibextid=wwXIfr"}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-4 w-4" />
                <span className="text-sm">Facebook</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-light pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-primary-foreground/60">
              <p>{localized.footer.bottom.copyright}</p>
              <p className="mt-1">{localized.footer.bottom.note}</p>
            </div>
            <div className="text-sm text-primary-foreground/60">
              <Link to="/privacy" className="hover:text-primary-foreground transition-colors">
                {localized.footer.bottom.privacyLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
