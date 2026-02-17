import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, Instagram, Linkedin, Facebook } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContent } from "@/contexts/ContentContext";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useLanguage();
  const { content } = useContent();
  const socials = content[language].contact.socials || {};
  const instagramUrl = socials.instagram || "https://www.instagram.com/penandpaperaccounting/";
  const linkedinUrl = socials.linkedin || "https://www.linkedin.com/company/pen-paper-accounting/";
  const facebookUrl = socials.facebook || "https://www.facebook.com/share/1GDZ1qCAW2/?mibextid=wwXIfr";

  const navItems = [
    { label: t('nav.home'), href: "/" },
    { label: t('nav.courses'), href: "/courses" },
    { label: t('nav.about'), href: "/about" },
    { label: t('nav.announcements'), href: "/announcements" },
    { label: t('nav.faq'), href: "/faq" },
    { label: t('nav.contact'), href: "/contact" },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/">
            <Logo size="md" showText={true} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <LanguageSwitcher />
            <a 
              href={instagramUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href={linkedinUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a 
              href={facebookUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <Button variant="outline" size="sm" asChild>
              <Link to="/contact">{t('nav.getStarted')}</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block px-3 py-2 text-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center space-x-4 px-3 pt-4">
                <LanguageSwitcher />
                <a 
                  href={instagramUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href={linkedinUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a 
                  href={facebookUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link to="/contact" onClick={() => setIsOpen(false)}>{t('nav.getStarted')}</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
