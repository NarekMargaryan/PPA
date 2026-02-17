import React, { createContext, useContext, useState, useEffect } from 'react';
import { asRecord, deepMerge } from '@/lib/deepMerge';
import { sanitizeUnknown } from '@/lib/sanitize';

interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  duration: string;
  format: string;
  target: string;
  features: string[];
  deliverables: string[];
  requirements: string[];
  outcomes: string[];
  isVisible: boolean;
  image?: string;
  slug: string;
  level?: string; // beginner, intermediate, advanced
  price?: string; // optional price info
}

interface FAQ {
  id: string;
  category?: string;
  order?: number;
  featured?: boolean;
  question: string;
  answer: string;
  subQuestions?: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  expertise: string[];
  image?: string;
}

interface Announcement {
  id: string;
  title: string;
  summary: string;
  content: string;
  category?: string; // simple string category (kept for backward compatibility)
  categories?: string[]; // multi-category support (new)
  relatedCourseId?: string; // optional linkage when category is courses
  image?: string; // optional cover image url
  images?: string[]; // optional gallery images
  pinned?: boolean; // optional pin flag
  slug: string;
  isVisible?: boolean;
  publishedDate?: string;
  tags?: string[];
}

type Language = 'en' | 'hy';

interface ContentData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    studentsTrained: string;
    image?: string;
  };
  
  features: {
    title: string;
    description: string;
    items: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
    }>;
    instagram?: {
      title: string;
      subtitle: string;
      badge: string;
      handle: string;
      description: string;
      buttonLabel: string;
      url: string;
    };
    linkedin?: {
      title: string;
      subtitle: string;
      badge: string;
      handle: string;
      description: string;
      buttonLabel: string;
      url: string;
    };
    facebook?: {
      title: string;
      subtitle: string;
      badge: string;
      handle: string;
      description: string;
      buttonLabel: string;
      url: string;
    };
    cta?: {
      title: string;
      description: string;
      primaryLabel: string;
      primaryHref: string;
      secondaryLabel: string;
      secondaryHref: string;
    };
  };
  
  footer: {
    tagline: string;
    description: string;
    links: Array<{
      id: string;
      title: string;
      links: Array<{
        id: string;
        label: string;
        href: string;
      }>;
    }>;
    bottom: {
      copyright: string;
      note: string;
      privacyLabel: string;
    };
  };
  
  about: {
    title: string;
    mission: string;
    missionParagraphs?: string[];
    missionPoints?: string[];
    imagePrimary?: string;
    imageSecondary?: string;
    team: TeamMember[];
    values: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
    }>;
    stats: {
      students: string;
      placement: string;
      experience: string;
      clients: string;
    };
    statsBoxes?: Array<{
      id: string;
      label: string;
      number: string;
    }>;
  };
  
  courses: {
    title: string;
    description: string;
    items: Course[];
  };
  
  announcements?: {
    title?: string;
    description?: string;
    emptyStateTitle?: string;
    emptyStateDescription?: string;
    items: Announcement[];
  };
  
  faq: {
    title: string;
    description: string;
    questions: FAQ[];
    quickActions?: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
      actionLabel: string;
      href: string;
    }>;
    ctaSection?: {
      title: string;
      description: string;
      showEmail: boolean;
      showPhone: boolean;
      showLocation: boolean;
    };
  };
  
  contact: {
    title: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    instagram: string;
    socials?: {
      instagram?: string; // full url
      linkedin?: string;
      facebook?: string;
    };
    officeHours: {
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
      sunday: string;
    };
    faqTeaser?: {
      title: string;
      description: string;
    };
  };
  
  navigation?: {
    menuItems?: Array<{
      id: string;
      label: string;
      url: string;
      children?: Array<{
        id: string;
        label: string;
        url: string;
      }>;
    }>;
  };
}

const defaultContentEn: ContentData = {
  hero: {
    title: "Learn American Accounting",
    subtitle: "Practical. Advanced. Remote-friendly.",
    description: "Master Zoho Books and QuickBooks, practice on real US-style data, and start freelancing worldwide. Bonus 2-day English class included.",
    ctaPrimary: "View Courses",
    ctaSecondary: "Contact Us",
    studentsTrained: "150+ students trained",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80"
  },
  features: {
    title: "Practical American Accounting in Armenia",
    description: "PPA (Pen & Paper Accounting) trains accountants and beginners in American bookkeeping and accounting software. Our course emphasizes practical skills used by US contractors, small businesses, and freelancers.",
    items: [
      {
        id: "zoho",
        title: "Zoho Books",
        description: "US-oriented accounting workflows",
        icon: "Calculator"
      },
      {
        id: "quickbooks",
        title: "QuickBooks Online (QBO)",
        description: "Industry-leading US platform",
        icon: "BookOpen"
      },
      {
        id: "practical",
        title: "Practical practice",
        description: "Work with real datasets and simulated companies",
        icon: "Users"
      },
      {
        id: "freelance",
        title: "Freelance guide",
        description: "Step-by-step to Upwork, Fiverr, and remote accounting work",
        icon: "Globe"
      },
      {
        id: "english",
        title: "Bonus: 2-day English class",
        description: "Focused on accounting vocabulary",
        icon: "GraduationCap"
      }
    ]
    ,
    instagram: {
      title: "Follow Our Journey",
      subtitle: "See what our students are achieving",
      badge: "IG",
      handle: "@penandpaperaccounting",
      description: "Follow us on Instagram for student success stories, course updates, and accounting tips",
      buttonLabel: "View Instagram Feed",
      url: "https://www.instagram.com/penandpaperaccounting/"
    },
    linkedin: {
      title: "Connect on LinkedIn",
      subtitle: "Company updates and opportunities",
      badge: "IN",
      handle: "Pen & Paper Accounting",
      description: "Follow us on LinkedIn for news, updates, and professional insights.",
      buttonLabel: "View LinkedIn Page",
      url: "https://www.linkedin.com/company/pen-paper-accounting/"
    },
    facebook: {
      title: "Follow on Facebook",
      subtitle: "News and community",
      badge: "FB",
      handle: "PPA on Facebook",
      description: "Stay updated with announcements and events on our Facebook page.",
      buttonLabel: "View Facebook Page",
      url: "https://www.facebook.com/share/1GDZ1qCAW2/?mibextid=wwXIfr"
    },
    cta: {
      title: "Ready to Start Your American Accounting Journey?",
      description: "Join our comprehensive program and gain the skills needed to work with US businesses and freelance worldwide.",
      primaryLabel: "See Course Details",
      primaryHref: "/courses",
      secondaryLabel: "Contact Us",
      secondaryHref: "/contact"
    }
  },
  footer: {
    tagline: "American Accounting Training in Armenia",
    description: "Practical, advanced American accounting courses in Armenia. Master Zoho Books & QuickBooks Online with real-world practice and freelance guidance.",
    links: [
      {
        id: "courses",
        title: "Courses",
        links: [
          { id: "adv", label: "Advanced Track", href: "/courses/advanced" },
          { id: "beg", label: "Beginner Track", href: "/courses/beginner" },
          { id: "overview", label: "Course Overview", href: "/courses" }
        ]
      },
      {
        id: "company",
        title: "Company",
        links: [
          { id: "about", label: "About", href: "/about" },
          { id: "faq", label: "FAQ", href: "/faq" },
          { id: "contact", label: "Contact", href: "/contact" }
        ]
      }
    ],
    bottom: {
      copyright: "© 2024 PPA - Pen & Paper Accounting. All rights reserved.",
      note: "This site is informational. No payments through site.",
      privacyLabel: "Privacy Policy"
    }
  },
  about: {
    title: "About PPA (Pen & Paper Accounting)",
    mission: "We're on a mission to prepare Armenian accountants for the global market by providing practical, hands-on training in American accounting systems and freelance readiness.",
    missionParagraphs: [
      "PPA was founded to bridge the gap between Armenian accounting education and the demands of the global market. We recognized that while Armenian accountants are highly skilled, they often lack exposure to US accounting systems and freelance opportunities.",
      "Our approach combines theoretical knowledge with practical application, ensuring students not only understand concepts but can immediately apply them in real-world scenarios with US clients."
    ],
    missionPoints: [
      "Hands-on training with real US business data",
      "Direct experience with industry-standard software",
      "Freelance guidance and client communication skills"
    ],
    imagePrimary: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=80",
    imageSecondary: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    team: [
      {
        id: "1",
        name: "Ani Petrosyan",
        role: "Lead Instructor & Founder",
        bio: "Certified CPA with 8+ years experience in US accounting systems. Former senior accountant at Fortune 500 companies.",
        expertise: ["QuickBooks Online", "Zoho Books", "US Tax Compliance"],
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: "2",
        name: "David Hakobyan",
        role: "Practical Training Specialist",
        bio: "Freelance accounting expert with 200+ successful Upwork projects. Specializes in client communication and workflow optimization.",
        expertise: ["Freelance Consulting", "Client Relations", "Workflow Design"],
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: "3",
        name: "Maria Grigoryan",
        role: "English & Communication Coach",
        bio: "Business English instructor with focus on accounting terminology. Helps students communicate effectively with US clients.",
        expertise: ["Business English", "Accounting Vocabulary", "Client Communication"],
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
      }
    ],
    values: [
      {
        id: "1",
        title: "Practical Focus",
        description: "Every lesson includes hands-on practice with real US business scenarios and datasets.",
        icon: "Target"
      },
      {
        id: "2",
        title: "Student Success",
        description: "Our goal is your success. We provide ongoing support even after course completion.",
        icon: "Users"
      },
      {
        id: "3",
        title: "Global Opportunities",
        description: "We prepare you for remote work with US clients and international accounting standards.",
        icon: "Globe"
      },
      {
        id: "4",
        title: "Industry Recognition",
        description: "Our curriculum is designed by professionals who understand the US accounting market.",
        icon: "Award"
      }
    ],
    stats: {
      students: "150+",
      placement: "95%",
      experience: "3",
      clients: "50+"
    },
    statsBoxes: [
      { id: "students", label: "Students Trained", number: "150+" },
      { id: "placement", label: "Job Placement Rate", number: "95%" },
      { id: "experience", label: "Years Experience", number: "3" },
      { id: "clients", label: "US Clients Served", number: "50+" }
    ]
  },
  courses: {
    title: "Courses — for Accountants & Beginners",
    description: "Two tailored tracks designed for different experience levels. Both include four stages of practical training and a bonus English mini-course to prepare you for the American accounting market.",
    items: [
      {
        id: "advanced",
        title: "Advanced Track",
        description: "For professional accountants who want to work with US businesses and clients",
        shortDescription: "Deep dive into Zoho Books and QuickBooks Online with hands-on practice on US-style ledger datasets and freelancing coaching.",
        duration: "14 weeks",
        format: "Weekly sessions (in-person/online)",
        target: "Working accountants ready for US markets",
        features: [
          "Advanced Zoho Books workflows",
          "QuickBooks Online mastery",
          "Real US business datasets",
          "Freelance profile optimization",
          "Client communication skills"
        ],
        deliverables: [
          "Complete Zoho Books setup for sample US business",
          "Monthly reconciliation practice",
          "Custom report creation"
        ],
        requirements: [
          "2+ years of accounting experience",
          "Basic understanding of financial statements",
          "Intermediate English proficiency",
          "Access to computer with internet connection",
          "Commitment to 14-week program"
        ],
        outcomes: [
          "Master both Zoho Books and QuickBooks Online",
          "Handle real US business accounting workflows",
          "Build a successful freelance practice",
          "Communicate effectively with US clients",
          "Earn 3-5x more than local accounting rates"
        ],
        isVisible: true,
        image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=80",
        slug: "advanced"
      },
      {
        id: "beginner",
        title: "Beginner Track",
        description: "No prior experience required",
        shortDescription: "Accounting theory + Zoho Books intro, then QBO, then real-world practice and freelance guide.",
        duration: "16 weeks",
        format: "Weekly sessions (in-person/online)",
        target: "Complete beginners to accounting",
        features: [
          "Accounting fundamentals",
          "Zoho Books from scratch",
          "QuickBooks Online basics",
          "Practical simulations",
          "Job search guidance"
        ],
        deliverables: [
          "Complete accounting cycle practice",
          "Zoho Books company setup",
          "Basic financial statement preparation"
        ],
        requirements: [
          "No prior accounting experience required",
          "Basic computer skills",
          "Willingness to learn and practice",
          "Access to computer with internet connection",
          "Commitment to 16-week program"
        ],
        outcomes: [
          "Master accounting fundamentals and principles",
          "Use both Zoho Books and QuickBooks Online confidently",
          "Handle real US business accounting tasks",
          "Build a professional portfolio",
          "Start your freelance accounting career"
        ],
        isVisible: true,
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        slug: "beginner"
      }
    ]
  },
  announcements: {
    title: "Announcements",
    description: "Stay updated with the latest news, course schedules, and job opportunities",
    emptyStateTitle: "No announcements yet",
    emptyStateDescription: "Check back soon for updates on courses, events, and opportunities",
    items: [
      {
        id: "10005",
        title: "Spring 2026 Cohort Enrollment Is Open",
        summary: "Registration for our next US Accounting cohort is now open. Early applicants receive a free 1:1 roadmap call.",
        content: "Our Spring 2026 cohort includes practical Zoho Books and QuickBooks Online labs, weekly feedback sessions, and a freelance preparation module. Seats are limited and accepted on a rolling basis.",
        category: "news",
        categories: ["news", "update"],
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
        images: [],
        pinned: true,
        slug: "spring-2026-cohort-enrollment-open",
        publishedDate: "2026-02-12"
      },
      {
        id: "10004",
        title: "Remote Junior Bookkeeper Internship",
        summary: "Partner company opening for 2 paid internship positions for PPA graduates with QBO practice.",
        content: "Internship includes onboarding, supervision, and a transition path to part-time remote work. Required: completed practical stage, English B1+, and confidence with reconciliations.",
        category: "jobs",
        categories: ["jobs"],
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        images: [],
        pinned: false,
        slug: "remote-junior-bookkeeper-internship",
        publishedDate: "2026-02-04"
      },
      {
        id: "10003",
        title: "New Workshop: Month-End Close in QBO",
        summary: "We added a focused workshop on month-end closing steps and reconciliation workflow.",
        content: "The workshop covers checklist-based closing, bank and credit card reconciliation, adjusting entries, and final report packaging for clients.",
        category: "courses",
        categories: ["courses", "update"],
        relatedCourseId: "beginner",
        image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=1200&q=80",
        images: [],
        pinned: false,
        slug: "new-workshop-month-end-close-qbo",
        publishedDate: "2026-01-28"
      },
      {
        id: "10002",
        title: "Advanced Track Adds Multi-Entity Reporting Case",
        summary: "A new real-world case now trains students on cross-entity reporting and consolidation basics.",
        content: "Students now practice month-end close for two related entities and prepare management reports with consistent chart-of-accounts mapping.",
        category: "courses",
        categories: ["courses"],
        relatedCourseId: "advanced",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        images: [],
        pinned: false,
        slug: "advanced-track-multi-entity-reporting-case",
        publishedDate: "2026-01-19"
      },
      {
        id: "10001",
        title: "Community Q&A Night in Yerevan",
        summary: "Open evening session for applicants and graduates: ask questions about curriculum and remote work.",
        content: "We will discuss skill roadmap, portfolio strategy, and client communication standards expected by US small businesses.",
        category: "news",
        categories: ["news", "event"],
        image: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80",
        images: [],
        pinned: false,
        slug: "community-qa-night-yerevan",
        publishedDate: "2026-01-10"
      }
    ]
  },
  faq: {
    title: "Frequently Asked Questions",
    description: "Find answers to common questions about our courses, schedules, and requirements. Can't find what you're looking for? We're here to help!",
    questions: [
      {
        id: "1",
        category: "General",
        order: 1,
        question: "Who is this course for?",
        answer: "Our courses are designed for two main groups: 1) Working accountants who want to expand their skills to work with US clients and learn American accounting systems, and 2) Complete beginners who want to start a career in accounting with a focus on the US market."
      },
      {
        id: "2",
        category: "General",
        order: 2,
        question: "Do I need prior accounting experience?",
        answer: "Not necessarily! We offer two tracks: the Advanced Track for working accountants, and the Beginner Track for those with no prior experience."
      },
      {
        id: "3",
        category: "General",
        order: 3,
        question: "Is this course taught in English or Armenian?",
        answer: "The course is primarily taught in English to prepare you for working with US clients. However, we provide Armenian language support when needed for complex concepts. We also include a bonus 2-day English class focused on accounting vocabulary and client communication."
      }
    ],
    quickActions: [
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
    ],
    ctaSection: {
      title: "Ready to Get Started?",
      description: "Join our next cohort and start your journey to becoming a certified American accounting professional",
      showEmail: true,
      showPhone: true,
      showLocation: true
    }
  },
  contact: {
    title: "Contact Us",
    description: "Ready to start your American accounting journey? Get in touch to learn more about our courses and find the right track for your goals.",
    email: "hello@penandpaper.am",
    phone: "+374 33 52 70 70",
    address: "Hakob Hakobyan St, Yerevan",
    instagram: "@penandpaperaccounting",
    socials: {
      instagram: "https://www.instagram.com/penandpaperaccounting/",
      linkedin: "https://www.linkedin.com/company/pen-paper-accounting/",
      facebook: "https://www.facebook.com/share/1GDZ1qCAW2/?mibextid=wwXIfr"
    },
    officeHours: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "10:00 AM - 2:00 PM",
      sunday: "Closed"
    },
    faqTeaser: {
      title: "Have Questions?",
      description: "Check out our frequently asked questions for quick answers about courses, schedules, and requirements."
    }
  }
};

const defaultContentHy: ContentData = {
  hero: {
    title: "Սովորեք ամերիկյան հաշվապահություն",
    subtitle: "Գործնական. Առաջադեմ. Հեռավար.",
    description: "Տիրապետեք Zoho Books-ին և QuickBooks-ին, աշխատեք իրական ամերիկյան տվյալների հետ և սկսեք ֆրիլանս աշխատանք աշխարհում։ Բոնուս՝ 2-օրյա անգլերեն դասընթաց։",
    ctaPrimary: "Դիտել դասընթացները",
    ctaSecondary: "Կապ մեզ հետ",
    studentsTrained: "150+ ուսանող պատրաստված",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80"
  },
  features: {
    title: "Գործնական ամերիկյան հաշվապահություն Հայաստանում",
    description: "PPA (Pen & Paper Accounting) պատրաստում է հաշվապահների և սկսնակների ամերիկյան հաշվապահական ծրագրերի համար։ Դասընթացը կենտրոնացած է գործնական հմտությունների վրա, որոնք կիրառվում են ԱՄՆ կապալառուների, փոքր բիզնեսների և ֆրիլանսերների կողմից։",
    items: [
      {
        id: "zoho",
        title: "Zoho Books",
        description: "ԱՄՆ-ին ուղղված հաշվապահական աշխատանքային հոսքեր",
        icon: "Calculator"
      },
      {
        id: "quickbooks",
        title: "QuickBooks Online (QBO)",
        description: "Արդյունաբերության առաջատար ամերիկյան հարթակ",
        icon: "BookOpen"
      },
      {
        id: "practical",
        title: "Գործնական պրակտիկա",
        description: "Աշխատեք իրական տվյալների և սիմուլացված ընկերությունների հետ",
        icon: "Users"
      },
      {
        id: "freelance",
        title: "Ֆրիլանս ուղեցույց",
        description: "Քայլ առ քայլ դեպի Upwork, Fiverr և հեռավար հաշվապահական աշխատանք",
        icon: "Globe"
      },
      {
        id: "english",
        title: "Բոնուս․ 2-օրյա անգլերեն դաս",
        description: "Կենտրոնացած է հաշվապահական բառապաշարի վրա",
        icon: "GraduationCap"
      }
    ],
    instagram: {
      title: "Հետևեք մեր ճանապարհին",
      subtitle: "Տեսեք՝ ինչի են հասնում մեր ուսանողները",
      badge: "IG",
      handle: "@penandpaperaccounting",
      description: "Հետևեք մեզ Instagram-ում ուսանողների հաջողությունների պատմությունների, դասընթացների թարմացումների և հաշվապահական խորհուրդների համար",
      buttonLabel: "Դիտել Instagram-ը",
      url: "https://www.instagram.com/penandpaperaccounting/"
    },
    linkedin: {
      title: "Հետևեք LinkedIn-ում",
      subtitle: "Ընկերության նորություններ և հնարավորություններ",
      badge: "IN",
      handle: "Pen & Paper Accounting",
      description: "Միացեք մեր LinkedIn էջին՝ թարմացումների և մասնագիտական հրապարակումների համար։",
      buttonLabel: "Դիտել LinkedIn էջը",
      url: "https://www.linkedin.com/company/pen-paper-accounting/"
    },
    facebook: {
      title: "Հետևեք Facebook-ում",
      subtitle: "Նորություններ և համայնք",
      badge: "FB",
      handle: "PPA Facebook",
      description: "Մնացեք թարմացված մեր հայտարարություններով և միջոցառումներով Facebook-ում։",
      buttonLabel: "Դիտել Facebook էջը",
      url: "https://www.facebook.com/share/1GDZ1qCAW2/?mibextid=wwXIfr"
    },
    cta: {
      title: "Պատրա՞ստ եք սկսել ամերիկյան հաշվապահության ձեր ճանապարհը։",
      description: "Միացեք մեր համապարփակ ծրագրին և ձեռք բերեք հմտություններ՝ ԱՄՆ բիզնեսների հետ աշխատելու և աշխարհով մեկ ֆրիլանսելու համար։",
      primaryLabel: "Դասընթացների մանրամասներ",
      primaryHref: "/courses",
      secondaryLabel: "Կապ մեզ հետ",
      secondaryHref: "/contact"
    }
  },
  footer: {
    tagline: "Ամերիկյան հաշվապահության ուսուցում Հայաստանում",
    description: "Գործնական, առաջադեմ ամերիկյան հաշվապահության դասընթացներ Հայաստանում։ Տիրապետեք Zoho Books-ին և QuickBooks Online-ին՝ իրական գործնական պրակտիկայով և ֆրիլանս ուղեցույցով։",
    links: [
      {
        id: "courses",
        title: "Դասընթացներ",
        links: [
          { id: "adv", label: "Ընդլայնված ուղի", href: "/courses/advanced" },
          { id: "beg", label: "Սկսնակների ուղի", href: "/courses/beginner" },
          { id: "overview", label: "Դասընթացների ընդհանուր", href: "/courses" }
        ]
      },
      {
        id: "company",
        title: "Ընկերություն",
        links: [
          { id: "about", label: "Մեր մասին", href: "/about" },
          { id: "faq", label: "Հաճախակի հարցեր", href: "/faq" },
          { id: "contact", label: "Կապ", href: "/contact" }
        ]
      }
    ],
    bottom: {
      copyright: "© 2024 PPA - Pen & Paper Accounting. Բոլոր իրավունքները պաշտպանված են։",
      note: "Կայքը տեղեկատվական է։ Վճարումներ կայքով չեն կատարվում։",
      privacyLabel: "Գաղտնիության քաղաքականություն"
    }
  },
  about: {
    title: "PPA-ի մասին (Pen & Paper Accounting)",
    mission: "Մեր առաքելությունն է պատրաստել հայ հաշվապահներին գլոբալ շուկայի համար՝ տրամադրելով գործնական ուսուցում ամերիկյան հաշվապահական համակարգերում և ֆրիլանս պատրաստվածություն։",
    missionParagraphs: [
      "PPA-ն հիմնադրվել է՝ կամուրջ հանդիսանալու հայաստանյան հաշվապահական կրթության և գլոբալ շուկայի պահանջների միջև։ Մենք տեսանք, որ թեև հայ հաշվապահները բարձր որակավորում ունեն, նրանք հաճախ զրկված են ԱՄՆ հաշվապահական համակարգերի և ֆրիլանս հնարավորությունների փորձից։",
      "Մեր մոտեցումը համատեղում է տեսական գիտելիքները գործնական կիրառության հետ՝ ապահովելով, որ ուսանողները ոչ միայն հասկանան հայեցակարգերը, այլև կարողանան անմիջապես կիրառել դրանք իրական աշխարհի սցենարներում ԱՄՆ հաճախորդների հետ աշխատելիս։"
    ],
    missionPoints: [
      "Գործնական ուսուցում իրական ԱՄՆ բիզնես տվյալներով",
      "Ուղղակի փորձ արդյունաբերության ստանդարտ ծրագրային ապահովման հետ",
      "Ֆրիլանս ուղեցույց և հաճախորդի հետ հաղորդակցման հմտություններ"
    ],
    imagePrimary: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=80",
    imageSecondary: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    team: [
      {
        id: "1",
        name: "Անի Պետրոսյան",
        role: "Առաջատար դասախոս և հիմնադիր",
        bio: "Վկայական ունեցող CPA՝ 8+ տարի ԱՄՆ հաշվապահական համակարգերի փորձով։ Աշխատել է Fortune 500 ընկերություններում որպես ավագ հաշվապահ։",
        expertise: ["QuickBooks Online", "Zoho Books", "ԱՄՆ հարկային համապատասխանություն"],
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: "2",
        name: "Դավիթ Հակոբյան",
        role: "Գործնական պատրաստության մասնագետ",
        bio: "Ֆրիլանս հաշվապահական փորձագետ՝ 200+ հաջողված Upwork նախագծերով։ Մասնագիտանում է հաճախորդի հաղորդակցությունում և աշխատանքային հոսքերի օպտիմալացման մեջ։",
        expertise: ["Ֆրիլանս խորհրդատվություն", "Հաճախորդների հարաբերություններ", "Աշխատանքային հոսքերի դիզայն"],
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: "3",
        name: "Մարիա Գրիգորյան",
        role: "Անգլերեն և հաղորդակցության մարզիչ",
        bio: "Բիզնես անգլերենի դասախոս՝ կենտրոնացած հաշվապահական տերմինաբանության վրա։ Օգնում է ուսանողներին արդյունավետ հաղորդակցվել ԱՄՆ հաճախորդների հետ։",
        expertise: ["Բիզնես անգլերեն", "Հաշվապահական բառապաշար", "Հաճախորդի հետ հաղորդակցություն"],
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
      }
    ],
    values: [
      {
        id: "1",
        title: "Գործնական ուղղվածություն",
        description: "Յուրաքանչյուր դաս ներառում է գործնական աշխատանքներ իրական ԱՄՆ բիզնես սցենարներով և տվյալներով։",
        icon: "Target"
      },
      {
        id: "2",
        title: "Ուսանողի հաջողությունը",
        description: "Մեր նպատակը ձեր հաջողությունն է։ Աջակցում ենք նաև դասընթացից հետո։",
        icon: "Users"
      },
      {
        id: "3",
        title: "Գլոբալ հնարավորություններ",
        description: "Պատրաստում ենք հեռավար աշխատանքին ԱՄՆ հաճախորդների հետ և միջազգային ստանդարտներին։",
        icon: "Globe"
      },
      {
        id: "4",
        title: "Արդյունաբերական ճանաչում",
        description: "Ծրագիրը կազմված է մասնագետների կողմից, ովքեր հասկանում են ԱՄՆ շուկան։",
        icon: "Award"
      }
    ],
    stats: {
      students: "150+",
      placement: "95%",
      experience: "3",
      clients: "50+"
    },
    statsBoxes: [
      { id: "students", label: "Պատրաստված ուսանողներ", number: "150+" },
      { id: "placement", label: "Աշխատանքի տեղավորման տոկոս", number: "95%" },
      { id: "experience", label: "Տարիների փորձ", number: "3" },
      { id: "clients", label: "ԱՄՆ հաճախորդներ", number: "50+" }
    ]
  },
  courses: {
    title: "Դասընթացներ — հաշվապահների և սկսնակների համար",
    description: "Երկու հարմարեցված ուղի տարբեր փորձի մակարդակների համար։ Երկուսն էլ ներառում են գործնական ուսուցման չորս փուլ և բոնուս անգլերեն մինի-դասընթաց՝ պատրաստվելու ամերիկյան շուկայի համար։",
    items: [
      {
        id: "advanced",
        title: "Ընդլայնված ուղի",
        description: "Պրոֆեսիոնալ հաշվապահների համար, ովքեր ցանկանում են աշխատել ԱՄՆ բիզնեսների և հաճախորդների հետ",
        shortDescription: "Խորացված ուսուցում Zoho Books և QuickBooks Online-ում՝ ԱՄՆ-ոճի տվյալների վրա գործնական աշխատանքներով և ֆրիլանս խորհրդատվությամբ։",
        duration: "14 շաբաթ",
        format: "Շաբաթական սեսիաներ (առցանց/օֆլայն)",
        target: "Աշխատող հաշվապահներ՝ պատրաստ ԱՄՆ շուկային",
        features: [
          "Առաջադեմ Zoho Books աշխատանքային հոսքեր",
          "QuickBooks Online վարպետացում",
          "Իրական ԱՄՆ բիզնեսների dataset-ներ",
          "Ֆրիլանս պրոֆիլի օպտիմալացում",
          "Հաճախորդի հաղորդակցման հմտություններ"
        ],
        deliverables: [
          "Zoho Books-ի ամբողջական կարգավորում օրինակային ԱՄՆ բիզնեսի համար",
          "Ամսական հաշտեցման պրակտիկա",
          "Ստուգողական հաշվետվությունների կազմություն"
        ],
        requirements: [
          "2+ տարվա փորձ հաշվապահությունում",
          "Ֆինանսական հաշվետվությունների հիմնական ըմբռնում",
          "Միջին մակարդակի անգլերեն",
          "Համակարգիչ և ինտերնետ",
          "Նվիրվածություն 14-շաբաթյա ծրագրին"
        ],
        outcomes: [
          "Տիրապետել Zoho Books-ին և QuickBooks Online-ին",
          "Կառավարել իրական ԱՄՆ հաշվապահական հոսքեր",
          "Կառուցել հաջողված ֆրիլանս պրակտիկա",
          "Արդյունավետ շփվել ԱՄՆ հաճախորդների հետ",
          "Վաստակել 3-5x ավելի տեղական շուկայի համեմատ"
        ],
        isVisible: true,
        image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=80",
        slug: "advanced"
      },
      {
        id: "beginner",
        title: "Սկսնակների ուղի",
        description: "Նախնական փորձ չի պահանջվում",
        shortDescription: "Հաշվապահական տեսություն + Zoho Books մտնում, ապա QBO, ապա իրական պրակտիկա և ֆրիլանս ուղեցույց։",
        duration: "16 շաբաթ",
        format: "Շաբաթական սեսիաներ (առցանց/օֆլայն)",
        target: "Լրիվ սկսնակներ",
        features: [
          "Հաշվապահության հիմունքներ",
          "Zoho Books՝ սկզբից",
          "QuickBooks Online-ի հիմունքներ",
          "Գործնական սիմուլացիաներ",
          "Աշխատանքի որոնման ուղեցույց"
        ],
        deliverables: [
          "Ամբողջական հաշվապահական ցիկլի պրակտիկա",
          "Zoho Books ընկերության կարգավորում",
          "Հիմնական ֆինանսական հաշվետվություններ"
        ],
        requirements: [
          "Նախնական փորձ անհրաժեշտ չէ",
          "Հիմնական համակարգչային հմտություններ",
          "Ցանկություն սովորելու և վարժվելու",
          "Համակարգիչ և ինտերնետ",
          "Նվիրվածություն 16-շաբաթյա ծրագրին"
        ],
        outcomes: [
          "Տիրապետել հաշվապահության հիմունքներին",
          "Աշխատել Zoho Books և QuickBooks Online ծրագրերով",
          "Կատարել իրական հաշվապահական խնդիրներ",
          "Կառուցել պրոֆեսիոնալ պորտֆոլիո",
          "Սկսել ֆրիլանս կարիերա"
        ],
        isVisible: true,
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        slug: "beginner"
      }
    ]
  },
  announcements: {
    title: "Հայտարարություններ",
    description: "Մնացեք տեղեկացված վերջին նորություններով, դասընթացների ժամանակացույցով և աշխատանքի հնարավորություններով",
    emptyStateTitle: "Հայտարարություններ դեռ չկան",
    emptyStateDescription: "Վերադարձեք շուտով՝ իմանալու դասընթացների, միջոցառումների և հնարավորությունների մասին",
    items: [
      {
        id: "10005",
        title: "Բացվել է 2026 գարնանային հոսքի գրանցումը",
        summary: "Հաջորդ հոսքի գրանցումը բաց է․ վաղ գրանցվողները ստանում են անվճար 1:1 խորհրդատվական զանգ։",
        content: "2026-ի գարնանային հոսքում ներառված են Zoho Books և QuickBooks Online գործնական լաբորատորիաներ, շաբաթական հետադարձ կապ և ֆրիլանս մեկնարկի մոդուլ։ Տեղերը սահմանափակ են։",
        category: "news",
        categories: ["news", "update"],
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
        images: [],
        pinned: true,
        slug: "2026-garnanayin-hosqi-grancum",
        publishedDate: "2026-02-12"
      },
      {
        id: "10004",
        title: "Հեռավար Junior Bookkeeper Internship",
        summary: "Գործընկեր ընկերությունում բացվել է 2 վճարովի internship՝ QBO փորձ ունեցող շրջանավարտների համար։",
        content: "Internship-ը ներառում է onboarding, մենթորական աջակցություն և part-time հեռավար աշխատանքի անցման հնարավորություն։ Պահանջվում է՝ գործնական փուլի ավարտ, անգլերեն B1+ և reconciliation-ի վստահ հմտություններ։",
        category: "jobs",
        categories: ["jobs"],
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        images: [],
        pinned: false,
        slug: "junior-bookkeeper-internship",
        publishedDate: "2026-02-04"
      },
      {
        id: "10003",
        title: "Նոր workshop՝ Month-End Close in QBO",
        summary: "Ավելացրել ենք առանձին workshop ամսվա փակման և reconciliation workflow-ի թեմայով։",
        content: "Workshop-ում անցնում ենք checklist-ով փակման փուլեր, բանկային և քարտային reconciliation, adjusting entries և հաճախորդին վերջնական հաշվետվությունների փոխանցման ստանդարտը։",
        category: "courses",
        categories: ["courses", "update"],
        relatedCourseId: "beginner",
        image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=1200&q=80",
        images: [],
        pinned: false,
        slug: "nor-workshop-month-end-close-qbo",
        publishedDate: "2026-01-28"
      },
      {
        id: "10002",
        title: "Ընդլայնված ուղիում ավելացվել է Multi-Entity Reporting Case",
        summary: "Նոր իրական քեյս՝ փոխկապակցված կազմակերպությունների հաշվետվական հոսքերի համար։",
        content: "Ուսանողները կատարում են երկու փոխկապակցված կազմակերպությունների month-end close և պատրաստում համադրելի management report chart of accounts mapping-ով։",
        category: "courses",
        categories: ["courses"],
        relatedCourseId: "advanced",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        images: [],
        pinned: false,
        slug: "yndlaynvat-ugi-multi-entity-reporting-case",
        publishedDate: "2026-01-19"
      },
      {
        id: "10001",
        title: "Համայնքային Q&A երեկո Երևանում",
        summary: "Բաց հանդիպում դիմորդների և շրջանավարտների համար՝ ծրագրի և հեռավար աշխատանքի թեմայով հարցուպատասխան։",
        content: "Քննարկելու ենք skill roadmap, պորտֆոլիոյի կառուցում և ԱՄՆ փոքր բիզնեսների հետ հաղորդակցման գործնական չափանիշներ։",
        category: "news",
        categories: ["news", "event"],
        image: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80",
        images: [],
        pinned: false,
        slug: "hamaynqayin-qa-ereko-yerevan",
        publishedDate: "2026-01-10"
      }
    ]
  },
  faq: {
    title: "Հաճախակի հարցեր",
    description: "Գտեք պատասխաններ մեր դասընթացների, ժամանակացույցի և պահանջների մասին հաճախակի հարցերին։ Չեք գտնում՞ ինչ եք փնտրում։ Մենք այստեղ ենք օգնելու։",
    questions: [
      {
        id: "1",
        category: "Ընդհանուր",
        order: 1,
        question: "Ում համար է այս դասընթացը?",
        answer: "Մեր դասընթացները նախատեսված են երկու խմբի համար՝ 1) Աշխատող հաշվապահներ, ովքեր ցանկանում են ընդլայնել հմտությունները ԱՄՆ հաճախորդների հետ աշխատելու համար, և 2) Սկսնակներ, ովքեր ցանկանում են սկսել կարիերա հաշվապահությունում՝ կենտրոնանալով ԱՄՆ շուկայի վրա։"
      },
      {
        id: "2",
        category: "Ընդհանուր",
        order: 2,
        question: "Անհրաժեշտ է նախնական փորձ?",
        answer: "Պարտադիր չէ։ Մենք ունենք երկու ուղի՝ Ընդլայնված՝ աշխատող հաշվապահների համար և Սկսնակների՝ նախնական փորձ չունեցողների համար։"
      },
      {
        id: "3",
        category: "Ընդհանուր",
        order: 3,
        question: "Դասընթացը անգլերեն է, թե հայերեն?",
        answer: "Դասընթացը հիմնականում անգլերեն է՝ ԱՄՆ հաճախորդների հետ աշխատանքի համար պատրաստվելու նպատակով, սակայն բարդ թեմաների դեպքում տրամադրում ենք հայերեն աջակցություն։ Ներառված է նաև 2-օրյա անգլերեն մինի-դաս։"
      }
    ],
    quickActions: [
      {
        id: "1",
        icon: "BookOpen",
        title: "Դիտել դասընթացները",
        description: "Իմացեք ավելին մեր Ընդլայնված և Սկսնակների դասընթացների մասին",
        actionLabel: "Դիտել դասընթացները",
        href: "/courses"
      },
      {
        id: "2",
        icon: "Users",
        title: "Ամրագրել խորհրդատվություն",
        description: "Պահեք անվճար 15-րոպեանոց զանգ՝ քննարկելու ձեր նպատակները",
        actionLabel: "Սկսել",
        href: "/contact"
      },
      {
        id: "3",
        icon: "Mail",
        title: "Գրել մեզ",
        description: "Ուղարկեք ձեր հարցերը ուղղակիորեն",
        actionLabel: "hello@penandpaper.am",
        href: "mailto:hello@penandpaper.am"
      }
    ],
    ctaSection: {
      title: "Պատրա՞ստ եք սկսել",
      description: "Միացեք մեր հաջորդ հոսքին և սկսեք ձեր ուղին դառնալու վկայագրված ամերիկյան հաշվապահ մասնագետ",
      showEmail: true,
      showPhone: true,
      showLocation: true
    }
  },
  contact: {
    title: "Կապ մեզ հետ",
    description: "Պատրա՞ստ եք սկսել ձեր ամերիկյան հաշվապահական ճանապարհը։ Կապվեք մեզ հետ՝ իմանալու դասընթացների մասին և գտնելու ձեզ համար ճիշտ ուղին։",
    email: "hello@penandpaper.am",
    phone: "+374 33 52 70 70",
    address: "Հակոբ Հակոբյան, Երևան",
    instagram: "@penandpaperaccounting",
    socials: {
      instagram: "https://www.instagram.com/penandpaperaccounting/",
      linkedin: "https://www.linkedin.com/company/pen-paper-accounting/",
      facebook: "https://www.facebook.com/share/1GDZ1qCAW2/?mibextid=wwXIfr"
    },
    officeHours: {
      monday: "09:00 - 18:00",
      tuesday: "09:00 - 18:00",
      wednesday: "09:00 - 18:00",
      thursday: "09:00 - 18:00",
      friday: "09:00 - 18:00",
      saturday: "10:00 - 14:00",
      sunday: "Փակ է"
    },
    faqTeaser: {
      title: "Հարցեր ունե՞ք",
      description: "Ստուգեք մեր հաճախ տրվող հարցերը՝ արագ պատասխաններ ստանալու դասընթացների, ժամանակացույցերի և պահանջների վերաբերյալ։"
    }
  }
};

type LocalizedContent = {
  en: ContentData;
  hy: ContentData;
};

const defaultContent: LocalizedContent = {
  en: defaultContentEn,
  hy: defaultContentHy
};

const alignAnnouncementIdsByIndex = (localized: LocalizedContent): LocalizedContent => {
  const enItems = localized.en.announcements?.items || [];
  const hyItems = localized.hy.announcements?.items || [];

  if (enItems.length === 0 || hyItems.length === 0 || enItems.length !== hyItems.length) {
    return localized;
  }

  const enIds = new Set(enItems.map((item) => item.id));
  const alreadyAligned = hyItems.every((item) => enIds.has(item.id));
  if (alreadyAligned) {
    return localized;
  }

  const alignedHy = hyItems.map((hyItem, index) => ({
    ...hyItem,
    id: enItems[index]?.id || hyItem.id
  }));

  return {
    ...localized,
    hy: {
      ...localized.hy,
      announcements: {
        ...(localized.hy.announcements || { items: [] }),
        items: alignedHy
      }
    }
  };
};

const normalizeLocalizedContent = (
  rawContent: unknown,
  previousContent?: LocalizedContent
): LocalizedContent => {
  const baseEn = deepMerge(defaultContentEn, previousContent?.en ?? {});
  const baseHy = deepMerge(defaultContentHy, previousContent?.hy ?? {});

  const rawRecord = asRecord(rawContent);
  const localizedRaw = rawRecord && asRecord(rawRecord.en) && asRecord(rawRecord.hy)
    ? { en: rawRecord.en, hy: rawRecord.hy }
    : null;

  const legacyRaw = rawRecord && asRecord(rawRecord.hero) && asRecord(rawRecord.features) && asRecord(rawRecord.footer)
    ? rawRecord
    : null;

  const merged: LocalizedContent = localizedRaw
    ? {
        en: deepMerge(baseEn, localizedRaw.en),
        hy: deepMerge(baseHy, localizedRaw.hy)
      }
    : legacyRaw
      ? {
          en: deepMerge(baseEn, legacyRaw),
          hy: deepMerge(baseHy, {})
        }
      : {
          en: baseEn,
          hy: baseHy
        };

  const aligned = alignAnnouncementIdsByIndex(merged);
  return sanitizeUnknown(aligned) as LocalizedContent;
};

interface ContentContextType {
  content: LocalizedContent;
  updateContent: (lang: Language, path: string, value: any) => void;
  setContentData: (newContent: LocalizedContent) => void;
  addCourse: (lang: Language, course: Omit<Course, 'id' | 'slug'>) => void;
  updateCourse: (lang: Language, id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  toggleCourseVisibility: (id: string) => void;
  addFAQ: (lang: Language, faq: Omit<FAQ, 'id'>) => void;
  updateFAQ: (lang: Language, id: string, faq: Partial<FAQ>) => void;
  deleteFAQ: (id: string) => void;
  addTeamMember: (lang: Language, member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (lang: Language, id: string, member: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  addAnnouncement: (lang: Language, ann: Omit<Announcement, 'id' | 'slug'>) => void;
  updateAnnouncement: (lang: Language, id: string, ann: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<LocalizedContent>(defaultContent);

  useEffect(() => {
    const savedContent = localStorage.getItem('ppa-content-data');
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent) as unknown;
        setContent((previous) => normalizeLocalizedContent(parsed, previous));
      } catch (error) {
        console.error('Error loading saved content:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ppa-content-data', JSON.stringify(content));
  }, [content]);

  const updateContent = (lang: Language, path: string, value: any) => {
    setContent(prev => {
      const newContent: LocalizedContent = { ...prev, [lang]: { ...prev[lang] } } as LocalizedContent;
      const keys = path.split('.');
      let current: any = (newContent as any)[lang];
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return normalizeLocalizedContent(newContent, prev);
    });
  };

  const setContentData = (newContent: LocalizedContent) => {
    setContent(prev => normalizeLocalizedContent(newContent, prev));
  };

  const addCourse = (lang: Language, course: Omit<Course, 'id' | 'slug'>) => {
    const id = Date.now().toString();
    const slug = course.title.toLowerCase().replace(/\s+/g, '-');
    const newCourse: Course = { ...course, id, slug };
    const otherLang: Language = lang === 'en' ? 'hy' : 'en';
    const placeholder: Course = {
      id,
      title: '',
      description: '',
      shortDescription: '',
      duration: course.duration || '',
      format: course.format || '',
      target: '',
      features: [],
      deliverables: [],
      requirements: [],
      outcomes: [],
      isVisible: course.hasOwnProperty('isVisible') ? (course as any).isVisible : true,
      image: course.hasOwnProperty('image') ? (course as any).image : '',
      slug
    };
    setContent(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        courses: { ...prev[lang].courses, items: [...prev[lang].courses.items, newCourse] }
      },
      [otherLang]: {
        ...prev[otherLang],
        courses: { ...prev[otherLang].courses, items: [...prev[otherLang].courses.items, placeholder] }
      }
    }));
  };

  const updateCourse = (lang: Language, id: string, courseData: Partial<Course>) => {
    setContent(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        courses: {
          ...prev[lang].courses,
          items: prev[lang].courses.items.map(course => course.id === id ? { ...course, ...courseData } : course)
        }
      }
    }));
  };

  const deleteCourse = (id: string) => {
    setContent(prev => ({
      ...prev,
      en: {
        ...prev.en,
        courses: { ...prev.en.courses, items: prev.en.courses.items.filter(c => c.id !== id) }
      },
      hy: {
        ...prev.hy,
        courses: { ...prev.hy.courses, items: prev.hy.courses.items.filter(c => c.id !== id) }
      }
    }));
  };

  const toggleCourseVisibility = (id: string) => {
    setContent(prev => ({
      ...prev,
      en: {
        ...prev.en,
        courses: {
          ...prev.en.courses,
          items: prev.en.courses.items.map(course => course.id === id ? { ...course, isVisible: !course.isVisible } : course)
        }
      },
      hy: {
        ...prev.hy,
        courses: {
          ...prev.hy.courses,
          items: prev.hy.courses.items.map(course => course.id === id ? { ...course, isVisible: !course.isVisible } : course)
        }
      }
    }));
  };

  const addFAQ = (lang: Language, faq: Omit<FAQ, 'id'>) => {
    const id = Date.now().toString();
    const newFAQ: FAQ = { ...faq, id };
    const otherLang: Language = lang === 'en' ? 'hy' : 'en';
    const placeholder: FAQ = { id, question: '', answer: '', subQuestions: [] };
    setContent(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        faq: { ...prev[lang].faq, questions: [...prev[lang].faq.questions, newFAQ] }
      },
      [otherLang]: {
        ...prev[otherLang],
        faq: { ...prev[otherLang].faq, questions: [...prev[otherLang].faq.questions, placeholder] }
      }
    }));
  };

  const updateFAQ = (lang: Language, id: string, faqData: Partial<FAQ>) => {
    setContent(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        faq: {
          ...prev[lang].faq,
          questions: prev[lang].faq.questions.map(faq => faq.id === id ? { ...faq, ...faqData } : faq)
        }
      }
    }));
  };

  const deleteFAQ = (id: string) => {
    setContent(prev => ({
      ...prev,
      en: {
        ...prev.en,
        faq: { ...prev.en.faq, questions: prev.en.faq.questions.filter(f => f.id !== id) }
      },
      hy: {
        ...prev.hy,
        faq: { ...prev.hy.faq, questions: prev.hy.faq.questions.filter(f => f.id !== id) }
      }
    }));
  };

  const addTeamMember = (lang: Language, member: Omit<TeamMember, 'id'>) => {
    const id = Date.now().toString();
    const newMember: TeamMember = { ...member, id };
    const otherLang: Language = lang === 'en' ? 'hy' : 'en';
    const placeholder: TeamMember = { id, name: '', role: '', bio: '', expertise: [] };
    setContent(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        about: { ...prev[lang].about, team: [...prev[lang].about.team, newMember] }
      },
      [otherLang]: {
        ...prev[otherLang],
        about: { ...prev[otherLang].about, team: [...prev[otherLang].about.team, placeholder] }
      }
    }));
  };

  const updateTeamMember = (lang: Language, id: string, memberData: Partial<TeamMember>) => {
    setContent(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        about: {
          ...prev[lang].about,
          team: prev[lang].about.team.map(member => member.id === id ? { ...member, ...memberData } : member)
        }
      }
    }));
  };

  const deleteTeamMember = (id: string) => {
    setContent(prev => ({
      ...prev,
      en: {
        ...prev.en,
        about: { ...prev.en.about, team: prev.en.about.team.filter(m => m.id !== id) }
      },
      hy: {
        ...prev.hy,
        about: { ...prev.hy.about, team: prev.hy.about.team.filter(m => m.id !== id) }
      }
    }));
  };

  const addAnnouncement = (lang: Language, ann: Omit<Announcement, 'id' | 'slug'>) => {
    const id = Date.now().toString();
    const slug = ann.title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const newAnn: Announcement = { ...ann, id, slug } as Announcement;
    const otherLang: Language = lang === 'en' ? 'hy' : 'en';
    const placeholder: Announcement = {
      id,
      title: '',
      summary: '',
      content: '',
      category: ann.category,
      relatedCourseId: ann.relatedCourseId,
      image: ann.image || '',
      images: [],
      pinned: false,
      slug
    };
    setContent(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        announcements: {
          items: [...(prev[lang].announcements?.items || []), newAnn]
        }
      },
      [otherLang]: {
        ...prev[otherLang],
        announcements: {
          items: [...(prev[otherLang].announcements?.items || []), placeholder]
        }
      }
    }));
  };

  const updateAnnouncement = (lang: Language, id: string, annData: Partial<Announcement>) => {
    setContent(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        announcements: {
          items: (prev[lang].announcements?.items || []).map(a => a.id === id ? { ...a, ...annData, slug: annData.title ? annData.title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') : a.slug } : a)
        }
      }
    }));
  };

  const deleteAnnouncement = (id: string) => {
    setContent(prev => ({
      ...prev,
      en: {
        ...prev.en,
        announcements: {
          items: (prev.en.announcements?.items || []).filter(a => a.id !== id)
        }
      },
      hy: {
        ...prev.hy,
        announcements: {
          items: (prev.hy.announcements?.items || []).filter(a => a.id !== id)
        }
      }
    }));
  };

  return (
    <ContentContext.Provider value={{
      content,
      updateContent,
      setContentData,
      addCourse,
      updateCourse,
      deleteCourse,
      toggleCourseVisibility,
      addFAQ,
      updateFAQ,
      deleteFAQ,
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
