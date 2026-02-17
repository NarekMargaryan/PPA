import { Helmet } from 'react-helmet-async';

interface OrganizationSchemaProps {
  type?: 'organization';
}

interface CourseSchemaProps {
  type: 'course';
  name: string;
  description: string;
  provider: string;
  price?: string;
  currency?: string;
  duration?: string;
  courseMode?: string;
  url?: string;
}

interface FAQSchemaProps {
  type: 'faq';
  items: Array<{
    question: string;
    answer: string;
  }>;
}

type StructuredDataProps = OrganizationSchemaProps | CourseSchemaProps | FAQSchemaProps;

const StructuredData = (props: StructuredDataProps) => {
  let schema: Record<string, unknown> = {};

  if (props.type === 'organization' || !props.type) {
    schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'EducationalOrganization',
          '@id': 'https://ppa.am/#organization',
          name: 'Pen & Paper Accounting',
          alternateName: 'PPA',
          url: 'https://ppa.am',
          logo: 'https://ppa.am/logo.png',
          description: 'Professional accounting training center in Armenia specializing in US accounting standards, QuickBooks, Xero, and Excel training.',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Yerevan',
            addressLocality: 'Yerevan',
            addressCountry: 'AM',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+374-33-52-70-70',
            contactType: 'customer service',
            availableLanguage: ['en', 'hy'],
          },
          sameAs: [
            'https://www.instagram.com/penandpaperaccounting/',
            'https://www.linkedin.com/company/pen-paper-accounting/',
            'https://www.facebook.com/share/1GDZ1qCAW2/',
          ],
          areaServed: {
            '@type': 'Country',
            name: 'Armenia',
          },
          educationalCredentialAwarded: 'Certificate of Completion',
        },
        {
          '@type': 'WebSite',
          '@id': 'https://ppa.am/#website',
          url: 'https://ppa.am',
          name: 'Pen & Paper Accounting',
          publisher: {
            '@id': 'https://ppa.am/#organization',
          },
          inLanguage: ['en', 'hy'],
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://ppa.am/faq?query={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    };
  } else if (props.type === 'course') {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: props.name,
      description: props.description,
      provider: {
        '@type': 'Organization',
        name: props.provider || 'Pen & Paper Accounting',
        sameAs: 'https://ppa.am',
      },
      ...(props.price && {
        offers: {
          '@type': 'Offer',
          price: props.price,
          priceCurrency: props.currency || 'AMD',
        },
      }),
      ...(props.duration && {
        timeRequired: props.duration,
      }),
      ...(props.courseMode && {
        courseMode: props.courseMode,
      }),
      ...(props.url && {
        url: props.url,
      }),
      educationalCredentialAwarded: 'Certificate of Completion',
      availableLanguage: ['en', 'hy'],
    };
  } else if (props.type === 'faq') {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: props.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default StructuredData;

