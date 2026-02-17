import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'course';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  article,
}: SEOProps) => {
  const { language } = useLanguage();
  
  const defaultTitle = language === 'en' 
    ? 'Pen & Paper Accounting - Professional Accounting Training in Armenia'
    : 'Pen & Paper Accounting - Պրոֆեսիոնալ Հաշվապահական Դասընթացներ Հայաստանում';
  
  const defaultDescription = language === 'en'
    ? 'Master US accounting standards with QuickBooks, Xero & Excel. Get certified and start your freelance accounting career with international clients.'
    : 'Սովորեք ամերիկյան հաշվապահական ստանդարտները QuickBooks, Xero և Excel ծրագրերով։ Ստացեք սերտիֆիկատ և սկսեք ֆրիլանս հաշվապահի կարիերան միջազգային հաճախորդների հետ։';
  
  const defaultKeywords = language === 'en'
    ? 'accounting training Armenia, QuickBooks training, Xero training, US accounting, freelance accounting, accounting courses, bookkeeping training, Yerevan accounting school'
    : 'հաշվապահական դասընթացներ Հայաստան, QuickBooks ուսուցում, Xero ուսուցում, ամերիկյան հաշվապահություն, ֆրիլանս հաշվապահ, հաշվապահական կուրսեր, Երևան հաշվապահական դպրոց';
  
  const defaultImage = '/logo.png';
  const siteUrl = 'https://ppa.am';
  
  const fullTitle = title ? `${title} | Pen & Paper Accounting` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullKeywords = keywords || defaultKeywords;
  const fullImage = image || defaultImage;
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const imageUrl = fullImage.startsWith('http') ? fullImage : `${siteUrl}${fullImage}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content="Pen & Paper Accounting" />
      <meta property="og:locale" content={language === 'en' ? 'en_US' : 'hy_AM'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Article specific meta tags */}
      {type === 'article' && article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
          {article.section && (
            <meta property="article:section" content={article.section} />
          )}
          {article.tags && article.tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="author" content="Pen & Paper Accounting" />
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
};

export default SEO;

