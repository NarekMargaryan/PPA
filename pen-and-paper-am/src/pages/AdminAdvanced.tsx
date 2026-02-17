import { useCallback, useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/contexts/ContentContext';
import Logo from '@/components/Logo';
import { 
  Save, Eye, EyeOff, Lock, Users, FileText, Megaphone,
  GraduationCap, HelpCircle, Mail, Globe, Download, Upload, LogOut, Edit, Trash2, Pin, Plus, Bell
} from 'lucide-react';
import { SearchFilter, ContentType, SortBy, SortOrder } from '@/components/admin/SearchFilter';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { BulkOperations, BulkCheckbox } from '@/components/admin/BulkOperations';
import { ExportImport } from '@/components/admin/ExportImport';
import { PreviewMode } from '@/components/admin/PreviewMode';
import { MultilingualEditor, TranslationProgress } from '@/components/admin/MultilingualEditor';
import { StatCard } from '@/components/admin/StatCard';
import { QuickActions } from '@/components/admin/QuickActions';
import { ActivityTimeline } from '@/components/admin/ActivityTimeline';
import { UserManagement } from '@/components/admin/UserManagement';
import { getActivityLog } from '@/contexts/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { prepareImageForUpload } from '@/lib/imageUpload';
import {
  CONTACT_SUBMISSION_STORAGE_KEY,
  ContactSubmission,
  ContactSubmissionStatus,
  getContactSubmissionStatusLabel,
  readContactSubmissions,
  updateContactSubmissionStatus
} from '@/lib/contactSubmissions';

type PageEditorTab = 'home' | 'about' | 'contact' | 'footer' | 'courses' | 'announcements' | 'faq-page';
type ContactStatusFilter = 'all' | ContactSubmissionStatus;
type ContactSortOrder = 'newest' | 'oldest';

type FeatureItemDraft = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

const FEATURE_ICON_OPTIONS = [
  'Calculator',
  'BookOpen',
  'Users',
  'Globe',
  'GraduationCap',
  'CheckCircle'
] as const;

const PAGE_SECTION_JUMPS: Array<{
  value: string;
  label: string;
  tab: PageEditorTab;
  sectionId: string;
}> = [
  { value: 'home-hero', label: 'Home: Hero', tab: 'home', sectionId: 'pages-home-hero' },
  { value: 'home-hero-image', label: 'Home: Hero Image', tab: 'home', sectionId: 'pages-home-hero-image' },
  { value: 'home-features', label: 'Home: Features Intro', tab: 'home', sectionId: 'pages-home-features' },
  { value: 'home-feature-cards', label: 'Home: Feature Cards', tab: 'home', sectionId: 'pages-home-feature-cards' },
  { value: 'home-cta', label: 'Home: Features CTA', tab: 'home', sectionId: 'pages-home-features-cta' },
  { value: 'home-social', label: 'Home: Social Links', tab: 'home', sectionId: 'pages-home-social' },
  { value: 'about-header', label: 'About: Header', tab: 'about', sectionId: 'pages-about-header' },
  { value: 'about-mission', label: 'About: Mission Details', tab: 'about', sectionId: 'pages-about-mission' },
  { value: 'about-images', label: 'About: Images', tab: 'about', sectionId: 'pages-about-images' },
  { value: 'about-team', label: 'About: Team', tab: 'about', sectionId: 'pages-about-team' },
  { value: 'about-values', label: 'About: Values', tab: 'about', sectionId: 'pages-about-values' },
  { value: 'about-stats', label: 'About: Stats', tab: 'about', sectionId: 'pages-about-stats' },
  { value: 'contact-header', label: 'Contact: Header', tab: 'contact', sectionId: 'pages-contact-header' },
  { value: 'contact-info', label: 'Contact: Info + Hours', tab: 'contact', sectionId: 'pages-contact-info' },
  { value: 'contact-faq-teaser', label: 'Contact: FAQ Teaser', tab: 'contact', sectionId: 'pages-contact-faq-teaser' },
  { value: 'footer-main', label: 'Footer: Main Content', tab: 'footer', sectionId: 'pages-footer-main' },
  { value: 'footer-links', label: 'Footer: Company Links', tab: 'footer', sectionId: 'pages-footer-links' },
  { value: 'announcements-header', label: 'Announcements: Header', tab: 'announcements', sectionId: 'pages-announcements-header' },
  { value: 'announcements-empty', label: 'Announcements: Empty State', tab: 'announcements', sectionId: 'pages-announcements-empty' },
  { value: 'announcements-manage', label: 'Announcements: Manage', tab: 'announcements', sectionId: 'pages-announcements-manage' },
  { value: 'courses-settings', label: 'Courses: Page Settings', tab: 'courses', sectionId: 'pages-courses-settings' },
  { value: 'faq-settings', label: 'FAQ: Page Settings', tab: 'faq-page', sectionId: 'pages-faq-settings' }
];

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readStorageArray = (key: string): unknown[] => {
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const buildAnnouncementSlug = (value: string, fallback: string): string => {
  const normalized = value
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return normalized || fallback;
};

const AdminAdvanced = () => {
  const { currentUser, isAuthenticated, hasUsers, login, logout, initializeAdmin, hasPermission, verifyCurrentPassword, changePassword } = useAuth();
  const { content, setContentData } = useContent();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [setupUsername, setSetupUsername] = useState('admin');
  const [setupEmail, setSetupEmail] = useState('admin@ppa.am');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [setupError, setSetupError] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPasswordValue, setCurrentPasswordValue] = useState('');
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [confirmNewPasswordValue, setConfirmNewPasswordValue] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');

  const [activeTab, setActiveTab] = useState('home');
  const [pagesTab, setPagesTab] = useState<PageEditorTab>('home');
  const [pagesJumpTarget, setPagesJumpTarget] = useState<string | undefined>(undefined);
  const [pagesLoadedSnapshot, setPagesLoadedSnapshot] = useState('');
  const [pagesLoadedOnce, setPagesLoadedOnce] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ContentType>('all');
  const [sortConfig, setSortConfig] = useState<{ by: SortBy; order: SortOrder }>({ by: 'date', order: 'desc' });
  
  const [tempContent, setTempContent] = useState(content);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [activeContactSubmission, setActiveContactSubmission] = useState<ContactSubmission | null>(null);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState<ContactStatusFilter>('all');
  const [contactSortOrder, setContactSortOrder] = useState<ContactSortOrder>('newest');

  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [annTitleEn, setAnnTitleEn] = useState('');
  const [annTitleHy, setAnnTitleHy] = useState('');
  const [annSummaryEn, setAnnSummaryEn] = useState('');
  const [annSummaryHy, setAnnSummaryHy] = useState('');
  const [annContentEn, setAnnContentEn] = useState('');
  const [annContentHy, setAnnContentHy] = useState('');
  const [annCategory, setAnnCategory] = useState('news');
  const [annCategories, setAnnCategories] = useState<string[]>(['news']);
  const [annRelatedCourseId, setAnnRelatedCourseId] = useState('');
  const [annImage, setAnnImage] = useState('');
  const [annPinned, setAnnPinned] = useState(false);
  const [annLanguage, setAnnLanguage] = useState<'both' | 'en' | 'hy'>('both');

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [courseTitleEn, setCourseTitleEn] = useState('');
  const [courseTitleHy, setCourseTitleHy] = useState('');
  const [courseDescEn, setCourseDescEn] = useState('');
  const [courseDescHy, setCourseDescHy] = useState('');
  const [courseShortDescEn, setCourseShortDescEn] = useState('');
  const [courseShortDescHy, setCourseShortDescHy] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [courseFormat, setCourseFormat] = useState('');
  const [courseTarget, setCourseTarget] = useState('');
  const [courseFeaturesEn, setCourseFeaturesEn] = useState<string[]>([]);
  const [courseFeaturesHy, setCourseFeaturesHy] = useState<string[]>([]);
  const [courseDeliverablesEn, setCourseDeliverablesEn] = useState<string[]>([]);
  const [courseDeliverablesHy, setCourseDeliverablesHy] = useState<string[]>([]);
  const [courseRequirementsEn, setCourseRequirementsEn] = useState<string[]>([]);
  const [courseRequirementsHy, setCourseRequirementsHy] = useState<string[]>([]);
  const [courseOutcomesEn, setCourseOutcomesEn] = useState<string[]>([]);
  const [courseOutcomesHy, setCourseOutcomesHy] = useState<string[]>([]);
  const [courseLevel, setCourseLevel] = useState('beginner');
  
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<any>(null);
  const [faqQuestionEn, setFaqQuestionEn] = useState('');
  const [faqQuestionHy, setFaqQuestionHy] = useState('');
  const [faqAnswerEn, setFaqAnswerEn] = useState('');
  const [faqAnswerHy, setFaqAnswerHy] = useState('');
  
  const [heroTitleEn, setHeroTitleEn] = useState('');
  const [heroTitleHy, setHeroTitleHy] = useState('');
  const [heroSubtitleEn, setHeroSubtitleEn] = useState('');
  const [heroSubtitleHy, setHeroSubtitleHy] = useState('');
  const [heroDescEn, setHeroDescEn] = useState('');
  const [heroDescHy, setHeroDescHy] = useState('');
  const [heroCtaPrimaryEn, setHeroCtaPrimaryEn] = useState('');
  const [heroCtaPrimaryHy, setHeroCtaPrimaryHy] = useState('');
  const [heroCtaSecondaryEn, setHeroCtaSecondaryEn] = useState('');
  const [heroCtaSecondaryHy, setHeroCtaSecondaryHy] = useState('');
  const [heroStudentsTrainedEn, setHeroStudentsTrainedEn] = useState('');
  const [heroStudentsTrainedHy, setHeroStudentsTrainedHy] = useState('');
  const [heroImage, setHeroImage] = useState('');
  
  const [featuresTitleEn, setFeaturesTitleEn] = useState('');
  const [featuresTitleHy, setFeaturesTitleHy] = useState('');
  const [featuresDescEn, setFeaturesDescEn] = useState('');
  const [featuresDescHy, setFeaturesDescHy] = useState('');
  const [featuresCtaTitleEn, setFeaturesCtaTitleEn] = useState('');
  const [featuresCtaTitleHy, setFeaturesCtaTitleHy] = useState('');
  const [featuresCtaDescEn, setFeaturesCtaDescEn] = useState('');
  const [featuresCtaDescHy, setFeaturesCtaDescHy] = useState('');
  const [featuresCtaPrimaryLabelEn, setFeaturesCtaPrimaryLabelEn] = useState('');
  const [featuresCtaPrimaryLabelHy, setFeaturesCtaPrimaryLabelHy] = useState('');
  const [featuresCtaSecondaryLabelEn, setFeaturesCtaSecondaryLabelEn] = useState('');
  const [featuresCtaSecondaryLabelHy, setFeaturesCtaSecondaryLabelHy] = useState('');
  const [featureItemsEn, setFeatureItemsEn] = useState<FeatureItemDraft[]>([]);
  const [featureItemsHy, setFeatureItemsHy] = useState<FeatureItemDraft[]>([]);
  const [instagramTitleEn, setInstagramTitleEn] = useState('');
  const [instagramTitleHy, setInstagramTitleHy] = useState('');
  const [instagramSubtitleEn, setInstagramSubtitleEn] = useState('');
  const [instagramSubtitleHy, setInstagramSubtitleHy] = useState('');
  const [instagramBadgeEn, setInstagramBadgeEn] = useState('');
  const [instagramBadgeHy, setInstagramBadgeHy] = useState('');
  const [instagramHandleEn, setInstagramHandleEn] = useState('');
  const [instagramHandleHy, setInstagramHandleHy] = useState('');
  const [instagramDescriptionEn, setInstagramDescriptionEn] = useState('');
  const [instagramDescriptionHy, setInstagramDescriptionHy] = useState('');
  const [instagramButtonLabelEn, setInstagramButtonLabelEn] = useState('');
  const [instagramButtonLabelHy, setInstagramButtonLabelHy] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinBadgeEn, setLinkedinBadgeEn] = useState('');
  const [linkedinBadgeHy, setLinkedinBadgeHy] = useState('');
  const [linkedinHandleEn, setLinkedinHandleEn] = useState('');
  const [linkedinHandleHy, setLinkedinHandleHy] = useState('');
  const [linkedinDescriptionEn, setLinkedinDescriptionEn] = useState('');
  const [linkedinDescriptionHy, setLinkedinDescriptionHy] = useState('');
  const [linkedinButtonLabelEn, setLinkedinButtonLabelEn] = useState('');
  const [linkedinButtonLabelHy, setLinkedinButtonLabelHy] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [facebookBadgeEn, setFacebookBadgeEn] = useState('');
  const [facebookBadgeHy, setFacebookBadgeHy] = useState('');
  const [facebookHandleEn, setFacebookHandleEn] = useState('');
  const [facebookHandleHy, setFacebookHandleHy] = useState('');
  const [facebookDescriptionEn, setFacebookDescriptionEn] = useState('');
  const [facebookDescriptionHy, setFacebookDescriptionHy] = useState('');
  const [facebookButtonLabelEn, setFacebookButtonLabelEn] = useState('');
  const [facebookButtonLabelHy, setFacebookButtonLabelHy] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  
  const [contactTitleEn, setContactTitleEn] = useState('');
  const [contactTitleHy, setContactTitleHy] = useState('');
  const [contactDescriptionEn, setContactDescriptionEn] = useState('');
  const [contactDescriptionHy, setContactDescriptionHy] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddressEn, setContactAddressEn] = useState('');
  const [contactAddressHy, setContactAddressHy] = useState('');
  const [contactInstagram, setContactInstagram] = useState('');
  const [faqTeaserTitleEn, setFaqTeaserTitleEn] = useState('');
  const [faqTeaserTitleHy, setFaqTeaserTitleHy] = useState('');
  const [faqTeaserDescEn, setFaqTeaserDescEn] = useState('');
  const [faqTeaserDescHy, setFaqTeaserDescHy] = useState('');
  const [footerTaglineEn, setFooterTaglineEn] = useState('');
  const [footerTaglineHy, setFooterTaglineHy] = useState('');
  const [footerDescEn, setFooterDescEn] = useState('');
  const [footerDescHy, setFooterDescHy] = useState('');
  const [footerCopyright, setFooterCopyright] = useState('');
  const [footerNote, setFooterNote] = useState('');
  const [footerPrivacyLabelEn, setFooterPrivacyLabelEn] = useState('');
  const [footerPrivacyLabelHy, setFooterPrivacyLabelHy] = useState('');
  const [footerInstagram, setFooterInstagram] = useState('');
  const [footerLinkedin, setFooterLinkedin] = useState('');
  const [footerFacebook, setFooterFacebook] = useState('');
  
  const [showFooterLinkModal, setShowFooterLinkModal] = useState(false);
  const [editingFooterLink, setEditingFooterLink] = useState<any>(null);
  const [footerLinkLabelEn, setFooterLinkLabelEn] = useState('');
  const [footerLinkLabelHy, setFooterLinkLabelHy] = useState('');
  const [footerLinkHref, setFooterLinkHref] = useState('');
  
  const [announcementsTitleEn, setAnnouncementsTitleEn] = useState('');
  const [announcementsTitleHy, setAnnouncementsTitleHy] = useState('');
  const [announcementsDescEn, setAnnouncementsDescEn] = useState('');
  const [announcementsDescHy, setAnnouncementsDescHy] = useState('');
  const [announcementsEmptyTitleEn, setAnnouncementsEmptyTitleEn] = useState('');
  const [announcementsEmptyTitleHy, setAnnouncementsEmptyTitleHy] = useState('');
  const [announcementsEmptyDescEn, setAnnouncementsEmptyDescEn] = useState('');
  const [announcementsEmptyDescHy, setAnnouncementsEmptyDescHy] = useState('');
  
  const [officeMonday, setOfficeMonday] = useState('');
  const [officeTuesday, setOfficeTuesday] = useState('');
  const [officeWednesday, setOfficeWednesday] = useState('');
  const [officeThursday, setOfficeThursday] = useState('');
  const [officeFriday, setOfficeFriday] = useState('');
  const [officeSaturday, setOfficeSaturday] = useState('');
  const [officeSunday, setOfficeSunday] = useState('');
  
  const [aboutTitleEn, setAboutTitleEn] = useState('');
  const [aboutTitleHy, setAboutTitleHy] = useState('');
  const [aboutMissionEn, setAboutMissionEn] = useState('');
  const [aboutMissionHy, setAboutMissionHy] = useState('');
  const [aboutImagePrimary, setAboutImagePrimary] = useState('');
  const [aboutImageSecondary, setAboutImageSecondary] = useState('');
  const [missionPara1En, setMissionPara1En] = useState('');
  const [missionPara1Hy, setMissionPara1Hy] = useState('');
  const [missionPara2En, setMissionPara2En] = useState('');
  const [missionPara2Hy, setMissionPara2Hy] = useState('');
  const [missionPoint1En, setMissionPoint1En] = useState('');
  const [missionPoint1Hy, setMissionPoint1Hy] = useState('');
  const [missionPoint2En, setMissionPoint2En] = useState('');
  const [missionPoint2Hy, setMissionPoint2Hy] = useState('');
  const [missionPoint3En, setMissionPoint3En] = useState('');
  const [missionPoint3Hy, setMissionPoint3Hy] = useState('');
  
  const [showValueModal, setShowValueModal] = useState(false);
  const [editingValue, setEditingValue] = useState<any>(null);
  const [valueTitleEn, setValueTitleEn] = useState('');
  const [valueTitleHy, setValueTitleHy] = useState('');
  const [valueDescEn, setValueDescEn] = useState('');
  const [valueDescHy, setValueDescHy] = useState('');
  const [valueIcon, setValueIcon] = useState('Star');
  
  const [showStatModal, setShowStatModal] = useState(false);
  const [editingStat, setEditingStat] = useState<any>(null);
  const [statLabelEn, setStatLabelEn] = useState('');
  const [statLabelHy, setStatLabelHy] = useState('');
  const [statNumber, setStatNumber] = useState('');

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<any>(null);
  const [teamNameEn, setTeamNameEn] = useState('');
  const [teamNameHy, setTeamNameHy] = useState('');
  const [teamRoleEn, setTeamRoleEn] = useState('');
  const [teamRoleHy, setTeamRoleHy] = useState('');
  const [teamBioEn, setTeamBioEn] = useState('');
  const [teamBioHy, setTeamBioHy] = useState('');
  const [teamExpertiseEn, setTeamExpertiseEn] = useState<string[]>([]);
  const [teamExpertiseHy, setTeamExpertiseHy] = useState<string[]>([]);
  const [teamImage, setTeamImage] = useState('');

  useEffect(() => {
    setTempContent(content);
  }, [content]);

  useEffect(() => {
    setContactSubmissions(readContactSubmissions());
  }, []);

  useEffect(() => {
    if (activeTab !== 'contact-requests') {
      return;
    }
    setContactSubmissions(readContactSubmissions());
  }, [activeTab]);

  const adminAnnouncementItems = useMemo(() => {
    const enItems = content.en.announcements?.items || [];
    const hyItems = content.hy.announcements?.items || [];
    const hyById = new Map(hyItems.map((item) => [item.id, item]));
    const enIds = new Set(enItems.map((item) => item.id));

    const mergedFromEn = enItems.map((enItem) => {
      const hyItem = hyById.get(enItem.id);
      const hasHyContent = Boolean(hyItem?.title || hyItem?.summary || hyItem?.content);
      return {
        ...enItem,
        title: enItem.title || hyItem?.title || '(No title)',
        summary: enItem.summary || hyItem?.summary || '',
        category: enItem.category || hyItem?.category || 'news',
        pinned: Boolean(enItem.pinned || hyItem?.pinned),
        isVisible: enItem.isVisible !== false || (hasHyContent && hyItem?.isVisible !== false),
        publishedDate: enItem.publishedDate || hyItem?.publishedDate
      };
    });

    const hyOnlyItems = hyItems
      .filter((item) => !enIds.has(item.id))
      .map((item) => ({
        ...item,
        title: item.title || '(No title)',
        summary: item.summary || '',
        category: item.category || 'news',
        pinned: Boolean(item.pinned),
        isVisible: item.isVisible !== false
      }));

    return [...mergedFromEn, ...hyOnlyItems].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.publishedDate || '').getTime() - new Date(a.publishedDate || '').getTime();
    });
  }, [content.en.announcements?.items, content.hy.announcements?.items]);

  const filteredContactSubmissions = useMemo(() => {
    const query = contactSearchQuery.trim().toLowerCase();

    return contactSubmissions
      .filter((item) => {
        if (contactStatusFilter !== 'all' && item.status !== contactStatusFilter) {
          return false;
        }

        if (!query) {
          return true;
        }

        return [
          item.firstName,
          item.lastName,
          item.email,
          item.phone,
          item.course,
          item.message
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return contactSortOrder === 'newest' ? bTime - aTime : aTime - bTime;
      });
  }, [contactSubmissions, contactSearchQuery, contactStatusFilter, contactSortOrder]);

  const pagesDraft = useMemo(
    () => ({
      hero: {
        titleEn: heroTitleEn,
        titleHy: heroTitleHy,
        subtitleEn: heroSubtitleEn,
        subtitleHy: heroSubtitleHy,
        descriptionEn: heroDescEn,
        descriptionHy: heroDescHy,
        ctaPrimaryEn: heroCtaPrimaryEn,
        ctaPrimaryHy: heroCtaPrimaryHy,
        ctaSecondaryEn: heroCtaSecondaryEn,
        ctaSecondaryHy: heroCtaSecondaryHy,
        studentsTrainedEn: heroStudentsTrainedEn,
        studentsTrainedHy: heroStudentsTrainedHy,
        image: heroImage
      },
      features: {
        titleEn: featuresTitleEn,
        titleHy: featuresTitleHy,
        descriptionEn: featuresDescEn,
        descriptionHy: featuresDescHy,
        ctaTitleEn: featuresCtaTitleEn,
        ctaTitleHy: featuresCtaTitleHy,
        ctaDescriptionEn: featuresCtaDescEn,
        ctaDescriptionHy: featuresCtaDescHy,
        ctaPrimaryLabelEn: featuresCtaPrimaryLabelEn,
        ctaPrimaryLabelHy: featuresCtaPrimaryLabelHy,
        ctaSecondaryLabelEn: featuresCtaSecondaryLabelEn,
        ctaSecondaryLabelHy: featuresCtaSecondaryLabelHy,
        itemsEn: featureItemsEn,
        itemsHy: featureItemsHy,
        instagram: {
          titleEn: instagramTitleEn,
          titleHy: instagramTitleHy,
          subtitleEn: instagramSubtitleEn,
          subtitleHy: instagramSubtitleHy,
          badgeEn: instagramBadgeEn,
          badgeHy: instagramBadgeHy,
          handleEn: instagramHandleEn,
          handleHy: instagramHandleHy,
          descriptionEn: instagramDescriptionEn,
          descriptionHy: instagramDescriptionHy,
          buttonLabelEn: instagramButtonLabelEn,
          buttonLabelHy: instagramButtonLabelHy,
          url: instagramUrl
        },
        linkedin: {
          badgeEn: linkedinBadgeEn,
          badgeHy: linkedinBadgeHy,
          handleEn: linkedinHandleEn,
          handleHy: linkedinHandleHy,
          descriptionEn: linkedinDescriptionEn,
          descriptionHy: linkedinDescriptionHy,
          buttonLabelEn: linkedinButtonLabelEn,
          buttonLabelHy: linkedinButtonLabelHy,
          url: linkedinUrl
        },
        facebook: {
          badgeEn: facebookBadgeEn,
          badgeHy: facebookBadgeHy,
          handleEn: facebookHandleEn,
          handleHy: facebookHandleHy,
          descriptionEn: facebookDescriptionEn,
          descriptionHy: facebookDescriptionHy,
          buttonLabelEn: facebookButtonLabelEn,
          buttonLabelHy: facebookButtonLabelHy,
          url: facebookUrl
        }
      },
      contact: {
        titleEn: contactTitleEn,
        titleHy: contactTitleHy,
        descriptionEn: contactDescriptionEn,
        descriptionHy: contactDescriptionHy,
        email: contactEmail,
        phone: contactPhone,
        addressEn: contactAddressEn,
        addressHy: contactAddressHy,
        instagram: contactInstagram,
        officeHours: {
          monday: officeMonday,
          tuesday: officeTuesday,
          wednesday: officeWednesday,
          thursday: officeThursday,
          friday: officeFriday,
          saturday: officeSaturday,
          sunday: officeSunday
        },
        faqTeaser: {
          titleEn: faqTeaserTitleEn,
          titleHy: faqTeaserTitleHy,
          descriptionEn: faqTeaserDescEn,
          descriptionHy: faqTeaserDescHy
        }
      },
      footer: {
        taglineEn: footerTaglineEn,
        taglineHy: footerTaglineHy,
        descriptionEn: footerDescEn,
        descriptionHy: footerDescHy,
        copyright: footerCopyright,
        note: footerNote,
        privacyLabelEn: footerPrivacyLabelEn,
        privacyLabelHy: footerPrivacyLabelHy,
        socials: {
          instagram: footerInstagram,
          linkedin: footerLinkedin,
          facebook: footerFacebook
        }
      },
      announcements: {
        titleEn: announcementsTitleEn,
        titleHy: announcementsTitleHy,
        descriptionEn: announcementsDescEn,
        descriptionHy: announcementsDescHy,
        emptyTitleEn: announcementsEmptyTitleEn,
        emptyTitleHy: announcementsEmptyTitleHy,
        emptyDescriptionEn: announcementsEmptyDescEn,
        emptyDescriptionHy: announcementsEmptyDescHy
      },
      about: {
        titleEn: aboutTitleEn,
        titleHy: aboutTitleHy,
        missionEn: aboutMissionEn,
        missionHy: aboutMissionHy,
        imagePrimary: aboutImagePrimary,
        imageSecondary: aboutImageSecondary,
        paragraph1En: missionPara1En,
        paragraph1Hy: missionPara1Hy,
        paragraph2En: missionPara2En,
        paragraph2Hy: missionPara2Hy,
        point1En: missionPoint1En,
        point1Hy: missionPoint1Hy,
        point2En: missionPoint2En,
        point2Hy: missionPoint2Hy,
        point3En: missionPoint3En,
        point3Hy: missionPoint3Hy
      }
    }),
    [
      heroTitleEn,
      heroTitleHy,
      heroSubtitleEn,
      heroSubtitleHy,
      heroDescEn,
      heroDescHy,
      heroCtaPrimaryEn,
      heroCtaPrimaryHy,
      heroCtaSecondaryEn,
      heroCtaSecondaryHy,
      heroStudentsTrainedEn,
      heroStudentsTrainedHy,
      heroImage,
      featuresTitleEn,
      featuresTitleHy,
      featuresDescEn,
      featuresDescHy,
      featuresCtaTitleEn,
      featuresCtaTitleHy,
      featuresCtaDescEn,
      featuresCtaDescHy,
      featuresCtaPrimaryLabelEn,
      featuresCtaPrimaryLabelHy,
      featuresCtaSecondaryLabelEn,
      featuresCtaSecondaryLabelHy,
      featureItemsEn,
      featureItemsHy,
      instagramTitleEn,
      instagramTitleHy,
      instagramSubtitleEn,
      instagramSubtitleHy,
      instagramBadgeEn,
      instagramBadgeHy,
      instagramHandleEn,
      instagramHandleHy,
      instagramDescriptionEn,
      instagramDescriptionHy,
      instagramButtonLabelEn,
      instagramButtonLabelHy,
      instagramUrl,
      linkedinBadgeEn,
      linkedinBadgeHy,
      linkedinHandleEn,
      linkedinHandleHy,
      linkedinDescriptionEn,
      linkedinDescriptionHy,
      linkedinButtonLabelEn,
      linkedinButtonLabelHy,
      linkedinUrl,
      facebookBadgeEn,
      facebookBadgeHy,
      facebookHandleEn,
      facebookHandleHy,
      facebookDescriptionEn,
      facebookDescriptionHy,
      facebookButtonLabelEn,
      facebookButtonLabelHy,
      facebookUrl,
      contactTitleEn,
      contactTitleHy,
      contactDescriptionEn,
      contactDescriptionHy,
      contactEmail,
      contactPhone,
      contactAddressEn,
      contactAddressHy,
      contactInstagram,
      officeMonday,
      officeTuesday,
      officeWednesday,
      officeThursday,
      officeFriday,
      officeSaturday,
      officeSunday,
      faqTeaserTitleEn,
      faqTeaserTitleHy,
      faqTeaserDescEn,
      faqTeaserDescHy,
      footerTaglineEn,
      footerTaglineHy,
      footerDescEn,
      footerDescHy,
      footerCopyright,
      footerNote,
      footerPrivacyLabelEn,
      footerPrivacyLabelHy,
      footerInstagram,
      footerLinkedin,
      footerFacebook,
      announcementsTitleEn,
      announcementsTitleHy,
      announcementsDescEn,
      announcementsDescHy,
      announcementsEmptyTitleEn,
      announcementsEmptyTitleHy,
      announcementsEmptyDescEn,
      announcementsEmptyDescHy,
      aboutTitleEn,
      aboutTitleHy,
      aboutMissionEn,
      aboutMissionHy,
      aboutImagePrimary,
      aboutImageSecondary,
      missionPara1En,
      missionPara1Hy,
      missionPara2En,
      missionPara2Hy,
      missionPoint1En,
      missionPoint1Hy,
      missionPoint2En,
      missionPoint2Hy,
      missionPoint3En,
      missionPoint3Hy
    ]
  );

  const pagesDraftSnapshot = useMemo(() => JSON.stringify(pagesDraft), [pagesDraft]);
  const hasUnsavedPageChanges = useMemo(
    () => pagesLoadedOnce && pagesDraftSnapshot !== pagesLoadedSnapshot,
    [pagesDraftSnapshot, pagesLoadedOnce, pagesLoadedSnapshot]
  );

  const confirmLeaveWithUnsavedPages = useCallback(
    (actionLabel: string) => {
      if (!hasUnsavedPageChanges) return true;
      return window.confirm(
        `You have unsaved changes in Pages.\n\nDo you want to continue and ${actionLabel} without saving?`
      );
    },
    [hasUnsavedPageChanges]
  );

  const switchAdminTab = useCallback(
    (nextTab: string) => {
      if (activeTab === 'pages' && nextTab !== 'pages') {
        if (!confirmLeaveWithUnsavedPages(`switch to "${nextTab}"`)) {
          return;
        }
      }
      setActiveTab(nextTab);
    },
    [activeTab, confirmLeaveWithUnsavedPages]
  );

  const handleLogout = useCallback(() => {
    if (activeTab === 'pages' && !confirmLeaveWithUnsavedPages('logout')) {
      return;
    }
    logout();
  }, [activeTab, confirmLeaveWithUnsavedPages, logout]);

  const resetPasswordDialog = useCallback(() => {
    setCurrentPasswordValue('');
    setNewPasswordValue('');
    setConfirmNewPasswordValue('');
    setPasswordChangeError('');
  }, []);

  const handleOpenPasswordDialog = useCallback(() => {
    resetPasswordDialog();
    setShowPasswordDialog(true);
  }, [resetPasswordDialog]);

  const handleSavePasswordChange = useCallback(() => {
    if (!currentUser) {
      return;
    }

    setPasswordChangeError('');

    if (!currentPasswordValue || !newPasswordValue || !confirmNewPasswordValue) {
      setPasswordChangeError('All fields are required');
      return;
    }

    if (newPasswordValue.length < 8) {
      setPasswordChangeError('Password must be at least 8 characters');
      return;
    }

    if (newPasswordValue !== confirmNewPasswordValue) {
      setPasswordChangeError('New passwords do not match');
      return;
    }

    if (newPasswordValue === currentPasswordValue) {
      setPasswordChangeError('New password must be different from current password');
      return;
    }

    const updated = changePassword(currentUser.id, currentPasswordValue, newPasswordValue);
    if (!updated) {
      setPasswordChangeError('Current password is incorrect');
      return;
    }

    alert('Password changed successfully!');
    setShowPasswordDialog(false);
    resetPasswordDialog();
  }, [
    changePassword,
    confirmNewPasswordValue,
    currentPasswordValue,
    currentUser,
    newPasswordValue,
    resetPasswordDialog
  ]);

  const updateFeatureItemField = useCallback(
    (lang: 'en' | 'hy', id: string, field: 'title' | 'description', value: string) => {
      if (lang === 'en') {
        setFeatureItemsEn(prev => prev.map(item => (item.id === id ? { ...item, [field]: value } : item)));
      } else {
        setFeatureItemsHy(prev => prev.map(item => (item.id === id ? { ...item, [field]: value } : item)));
      }
    },
    []
  );

  const handleFeatureIconChange = useCallback((id: string, icon: string) => {
    setFeatureItemsEn(prev => prev.map(item => (item.id === id ? { ...item, icon } : item)));
    setFeatureItemsHy(prev => prev.map(item => (item.id === id ? { ...item, icon } : item)));
  }, []);

  const handleAddFeatureItem = useCallback(() => {
    const id = `feature-${Date.now()}`;
    setFeatureItemsEn(prev => [...prev, { id, title: '', description: '', icon: 'Calculator' }]);
    setFeatureItemsHy(prev => [...prev, { id, title: '', description: '', icon: 'Calculator' }]);
  }, []);

  const handleDeleteFeatureItem = useCallback((id: string) => {
    setFeatureItemsEn(prev => prev.filter(item => item.id !== id));
    setFeatureItemsHy(prev => prev.filter(item => item.id !== id));
  }, []);

  const jumpToPagesSection = useCallback((value: string) => {
    const target = PAGE_SECTION_JUMPS.find(item => item.value === value);
    if (!target) return;
    setPagesJumpTarget(value);
    setPagesTab(target.tab);

    window.setTimeout(() => {
      const section = document.getElementById(target.sectionId);
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPagesJumpTarget(undefined);
    }, 120);
  }, []);

  const processSelectedImage = useCallback(async (file: File, applyResult: (value: string) => void) => {
    try {
      const prepared = await prepareImageForUpload(file, {
        askToCompress: true,
        maxDimension: 1920,
        targetMaxBytes: 1024 * 1024
      });
      applyResult(prepared.dataUrl);
    } catch (error) {
      console.error('Image processing failed:', error);
      alert('Could not process this image. Please try another file.');
    }
  }, []);

  const getContactStatusBadgeVariant = useCallback((status: ContactSubmissionStatus) => {
    switch (status) {
      case 'new':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'contacted':
        return 'outline';
      case 'resolved':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  }, []);

  const handleContactStatusChange = useCallback((submissionId: string, status: ContactSubmissionStatus) => {
    const updatedSubmissions = updateContactSubmissionStatus(submissionId, status);
    setContactSubmissions(updatedSubmissions);
    if (activeContactSubmission?.id === submissionId) {
      setActiveContactSubmission(updatedSubmissions.find((item) => item.id === submissionId) || null);
    }
  }, [activeContactSubmission]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedPageChanges) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedPageChanges]);

  const handleLogin = async () => {
    setLoginError('');
    const success = await login(username, password);
    if (!success) {
      setLoginError('Invalid username or password');
    }
    setUsername('');
    setPassword('');
  };

  const handleInitializeAdmin = () => {
    setSetupError('');

    if (!setupUsername.trim() || !setupEmail.trim()) {
      setSetupError('Username and email are required');
      return;
    }

    if (setupPassword.length < 8) {
      setSetupError('Password must be at least 8 characters');
      return;
    }

    if (setupPassword !== setupConfirmPassword) {
      setSetupError('Passwords do not match');
      return;
    }

    const initialized = initializeAdmin(setupUsername, setupEmail, setupPassword);
    if (!initialized) {
      setSetupError('Admin account setup failed');
      return;
    }

    setSetupPassword('');
    setSetupConfirmPassword('');
    setUsername(setupUsername);
  };

  const handleSave = () => {
    setContentData(tempContent);
    setIsEditing(false);
    setSelectedIds([]);
    alert('Changes saved successfully!');
  };

  const handlePreview = () => {
    if (activeTab === 'pages' && !confirmLeaveWithUnsavedPages('open preview')) {
      return;
    }
    window.open('/', '_blank');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds: string[] = [];
      if (filterType === 'all' || filterType === 'announcements') {
        allIds.push(...adminAnnouncementItems.map((announcement) => announcement.id));
      }
      if (filterType === 'all' || filterType === 'courses') {
        allIds.push(...content.en.courses.items.map(c => c.id));
      }
      if (filterType === 'all' || filterType === 'faq') {
        allIds.push(...content.en.faq.questions.map(q => q.id));
      }
      setSelectedIds(allIds);
    }
  };

  const handleBulkDelete = (ids: string[]) => {
    if (confirm(`Delete ${ids.length} items?`)) {
      console.log('Bulk delete:', ids);
      setSelectedIds([]);
    }
  };

  const handleBulkToggleVisibility = (ids: string[], visible: boolean) => {
    console.log('Bulk visibility:', ids, visible);
    setSelectedIds([]);
  };

  const handleBulkExport = (ids: string[]) => {
    const selectedData = {
      announcements: adminAnnouncementItems.filter(a => ids.includes(a.id)),
      courses: content.en.courses.items.filter(c => ids.includes(c.id)),
      faq: content.en.faq.questions.filter(q => ids.includes(q.id))
    };
    
    const dataStr = JSON.stringify(selectedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ppa-export-selected.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getBackupPayload = useCallback((): Record<string, unknown> => ({
    backupType: 'ppa-full-backup',
    backupVersion: 1,
    exportedAt: new Date().toISOString(),
    exportedBy: currentUser?.username ?? 'unknown',
    languagePreference: localStorage.getItem('ppa-language') || 'en',
    content,
    adminUsers: readStorageArray('ppa_admin_users'),
    adminActivity: readStorageArray('ppa_admin_activity'),
    contactSubmissions: readContactSubmissions()
  }), [content, currentUser?.username]);

  const handleImportBackup = useCallback((rawData: Record<string, unknown>) => {
    if (!confirm('This will overwrite current admin-managed data. Continue?')) {
      return;
    }

    let importedContent: unknown = null;
    let importedUsers: unknown[] | null = null;
    let importedActivity: unknown[] | null = null;
    let importedContactSubmissions: unknown[] | null = null;
    let importedLanguage: string | null = null;

    if (isObjectRecord(rawData.en) && isObjectRecord(rawData.hy)) {
      importedContent = rawData;
    } else if (
      isObjectRecord(rawData.content) &&
      isObjectRecord(rawData.content.en) &&
      isObjectRecord(rawData.content.hy)
    ) {
      importedContent = rawData.content;
      importedUsers = Array.isArray(rawData.adminUsers) ? rawData.adminUsers : null;
      importedActivity = Array.isArray(rawData.adminActivity) ? rawData.adminActivity : null;
      importedContactSubmissions = Array.isArray(rawData.contactSubmissions) ? rawData.contactSubmissions : null;
      importedLanguage = typeof rawData.languagePreference === 'string' ? rawData.languagePreference : null;
    } else {
      alert('Unsupported backup format. Please import a valid backup JSON file.');
      return;
    }

    setContentData(importedContent as any);

    if (importedUsers) {
      localStorage.setItem('ppa_admin_users', JSON.stringify(importedUsers));
    }
    if (importedActivity) {
      localStorage.setItem('ppa_admin_activity', JSON.stringify(importedActivity));
    }
    if (importedContactSubmissions) {
      localStorage.setItem(CONTACT_SUBMISSION_STORAGE_KEY, JSON.stringify(importedContactSubmissions));
      setContactSubmissions(readContactSubmissions());
    }
    if (importedLanguage === 'en' || importedLanguage === 'hy') {
      localStorage.setItem('ppa-language', importedLanguage);
    }

    alert('Backup imported successfully. The admin panel will reload now.');
    window.location.reload();
  }, [setContentData, setContactSubmissions]);

  const handleCleanupData = useCallback(() => {
    if (!currentUser) {
      alert('Please login again to run cleanup.');
      return;
    }

    const enteredPassword = window.prompt(`Enter admin password for "${currentUser.username}" to run cleanup:`);
    if (enteredPassword === null) {
      return;
    }

    if (!verifyCurrentPassword(enteredPassword)) {
      alert('Invalid password. Cleanup canceled.');
      return;
    }

    if (!confirm('This will reset saved website content, clear admin activity logs, and remove contact requests. Continue?')) {
      return;
    }

    localStorage.removeItem('ppa-content-data');
    localStorage.removeItem('ppa_admin_activity');
    localStorage.removeItem(CONTACT_SUBMISSION_STORAGE_KEY);
    setContactSubmissions([]);

    alert('Cleanup completed. The page will reload with default content.');
    window.location.reload();
  }, [currentUser, verifyCurrentPassword, setContactSubmissions]);

  const handleAddAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnTitleEn('');
    setAnnTitleHy('');
    setAnnSummaryEn('');
    setAnnSummaryHy('');
    setAnnContentEn('');
    setAnnContentHy('');
    setAnnCategory('news');
    setAnnCategories(['news']);
    setAnnRelatedCourseId('');
    setAnnImage('');
    setAnnPinned(false);
    setAnnLanguage('both');
    setShowAnnouncementModal(true);
  };

  const handleEditAnnouncement = (announcement: any) => {
    const enAnn = content.en.announcements?.items.find(a => a.id === announcement.id);
    const hyAnn = content.hy.announcements?.items.find(a => a.id === announcement.id);
    const activeAnnouncement = enAnn || hyAnn || announcement;

    setEditingAnnouncement(activeAnnouncement);
    
    setAnnTitleEn(enAnn?.title || '');
    setAnnTitleHy(hyAnn?.title || '');
    setAnnSummaryEn(enAnn?.summary || '');
    setAnnSummaryHy(hyAnn?.summary || '');
    setAnnContentEn(enAnn?.content || '');
    setAnnContentHy(hyAnn?.content || '');
    setAnnCategory(activeAnnouncement.category || 'news');
    setAnnCategories(activeAnnouncement.categories || [activeAnnouncement.category || 'news']);
    setAnnRelatedCourseId(activeAnnouncement.relatedCourseId || '');
    setAnnImage(activeAnnouncement.image || '');
    setAnnPinned(activeAnnouncement.pinned || false);
    
    if (enAnn?.title && hyAnn?.title) {
      setAnnLanguage('both');
    } else if (enAnn?.title) {
      setAnnLanguage('en');
    } else {
      setAnnLanguage('hy');
    }
    
    setShowAnnouncementModal(true);
  };

  const handleSaveAnnouncement = () => {
    const newContent = { ...tempContent };
    
    if (!newContent.en.announcements) newContent.en.announcements = { items: [] };
    if (!newContent.hy.announcements) newContent.hy.announcements = { items: [] };
    
    if (editingAnnouncement) {
      const enIndex = newContent.en.announcements.items.findIndex(a => a.id === editingAnnouncement.id);
      const hyIndex = newContent.hy.announcements.items.findIndex(a => a.id === editingAnnouncement.id);
      const existingEn = enIndex !== -1 ? newContent.en.announcements.items[enIndex] : undefined;
      const existingHy = hyIndex !== -1 ? newContent.hy.announcements.items[hyIndex] : undefined;
      const slugSource =
        annTitleEn ||
        annTitleHy ||
        existingEn?.title ||
        existingHy?.title ||
        editingAnnouncement.slug ||
        'announcement';
      const slug = buildAnnouncementSlug(slugSource, `announcement-${editingAnnouncement.id}`);
      const publishedDate =
        existingEn?.publishedDate ||
        existingHy?.publishedDate ||
        editingAnnouncement.publishedDate ||
        new Date().toISOString().split('T')[0];
      
      if (annLanguage === 'both' || annLanguage === 'en') {
        const nextEn = {
          ...(existingEn || { id: editingAnnouncement.id }),
          title: annTitleEn,
          summary: annSummaryEn,
          content: annContentEn,
          slug,
          category: annCategories[0] || annCategory,
          categories: annCategories,
          relatedCourseId: annRelatedCourseId,
          image: annImage,
          pinned: annPinned,
          isVisible: existingEn?.isVisible ?? true,
          publishedDate
        };
        if (enIndex !== -1) {
          newContent.en.announcements.items[enIndex] = nextEn;
        } else {
          newContent.en.announcements.items.push(nextEn);
        }
      } else {
        if (enIndex !== -1) {
          newContent.en.announcements.items[enIndex] = {
            ...newContent.en.announcements.items[enIndex],
            title: '',
            summary: '',
            content: '',
            isVisible: false
          };
        }
      }
      
      if (annLanguage === 'both' || annLanguage === 'hy') {
        const nextHy = {
          ...(existingHy || { id: editingAnnouncement.id }),
          title: annTitleHy,
          summary: annSummaryHy,
          content: annContentHy,
          slug,
          category: annCategories[0] || annCategory,
          categories: annCategories,
          relatedCourseId: annRelatedCourseId,
          image: annImage,
          pinned: annPinned,
          isVisible: existingHy?.isVisible ?? true,
          publishedDate
        };
        if (hyIndex !== -1) {
          newContent.hy.announcements.items[hyIndex] = nextHy;
        } else {
          newContent.hy.announcements.items.push(nextHy);
        }
      } else {
        if (hyIndex !== -1) {
          newContent.hy.announcements.items[hyIndex] = {
            ...newContent.hy.announcements.items[hyIndex],
            title: '',
            summary: '',
            content: '',
            isVisible: false
          };
        }
      }
    } else {
      const newId = Date.now().toString();
      const slug = buildAnnouncementSlug(annTitleEn || annTitleHy, `announcement-${newId}`);
      
      const enAnn = {
        id: newId,
        title: annLanguage === 'en' || annLanguage === 'both' ? annTitleEn : '',
        summary: annLanguage === 'en' || annLanguage === 'both' ? annSummaryEn : '',
        content: annLanguage === 'en' || annLanguage === 'both' ? annContentEn : '',
        slug,
        category: annCategories[0] || annCategory,
        categories: annCategories,
        relatedCourseId: annRelatedCourseId,
        image: annImage,
        pinned: annPinned,
        isVisible: annLanguage === 'en' || annLanguage === 'both',
        publishedDate: new Date().toISOString().split('T')[0]
      };
      
      const hyAnn = {
        id: newId,
        title: annLanguage === 'hy' || annLanguage === 'both' ? annTitleHy : '',
        summary: annLanguage === 'hy' || annLanguage === 'both' ? annSummaryHy : '',
        content: annLanguage === 'hy' || annLanguage === 'both' ? annContentHy : '',
        slug,
        category: annCategories[0] || annCategory,
        categories: annCategories,
        relatedCourseId: annRelatedCourseId,
        image: annImage,
        pinned: annPinned,
        isVisible: annLanguage === 'hy' || annLanguage === 'both',
        publishedDate: new Date().toISOString().split('T')[0]
      };
      
      if (annPinned) {
        newContent.en.announcements.items.unshift(enAnn);
        newContent.hy.announcements.items.unshift(hyAnn);
      } else {
        newContent.en.announcements.items.push(enAnn);
        newContent.hy.announcements.items.push(hyAnn);
      }
    }
    
    newContent.en.announcements.items.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.publishedDate || '').getTime() - new Date(a.publishedDate || '').getTime();
    });
    newContent.hy.announcements.items.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.publishedDate || '').getTime() - new Date(a.publishedDate || '').getTime();
    });
    
    setTempContent(newContent);
    setContentData(newContent);
    setShowAnnouncementModal(false);
    alert('Announcement saved!');
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    
    const newContent = { ...tempContent };
    if (newContent.en.announcements) {
      newContent.en.announcements.items = newContent.en.announcements.items.filter(a => a.id !== id);
    }
    if (newContent.hy.announcements) {
      newContent.hy.announcements.items = newContent.hy.announcements.items.filter(a => a.id !== id);
    }
    
    setTempContent(newContent);
    setContentData(newContent);
    alert('Announcement deleted!');
  };

  const handleToggleAnnouncementVisibility = (id: string) => {
    const newContent = { ...tempContent };
    
    if (newContent.en.announcements) {
      const enItem = newContent.en.announcements.items.find(a => a.id === id);
      if (enItem) enItem.isVisible = !enItem.isVisible;
    }
    if (newContent.hy.announcements) {
      const hyItem = newContent.hy.announcements.items.find(a => a.id === id);
      if (hyItem) hyItem.isVisible = !hyItem.isVisible;
    }
    
    setTempContent(newContent);
    setContentData(newContent);
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setCourseTitleEn('');
    setCourseTitleHy('');
    setCourseDescEn('');
    setCourseDescHy('');
    setCourseLevel('beginner');
    setShowCourseModal(true);
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    const hyCourse = content.hy.courses.items.find(c => c.id === course.id);
    
    setCourseTitleEn(course.title || '');
    setCourseTitleHy(hyCourse?.title || '');
    setCourseDescEn(course.description || '');
    setCourseDescHy(hyCourse?.description || '');
    setCourseShortDescEn(course.shortDescription || '');
    setCourseShortDescHy(hyCourse?.shortDescription || '');
    setCourseDuration(course.duration || '');
    setCourseFormat(course.format || '');
    setCourseTarget(course.target || '');
    setCourseFeaturesEn(course.features || []);
    setCourseFeaturesHy(hyCourse?.features || []);
    setCourseDeliverablesEn(course.deliverables || []);
    setCourseDeliverablesHy(hyCourse?.deliverables || []);
    setCourseRequirementsEn(course.requirements || []);
    setCourseRequirementsHy(hyCourse?.requirements || []);
    setCourseOutcomesEn(course.outcomes || []);
    setCourseOutcomesHy(hyCourse?.outcomes || []);
    setCourseLevel(course.level || 'beginner');
    setShowCourseModal(true);
  };

  const handleSaveCourse = () => {
    const newContent = { ...tempContent };
    
    if (editingCourse) {
      const enIndex = newContent.en.courses.items.findIndex(c => c.id === editingCourse.id);
      const hyIndex = newContent.hy.courses.items.findIndex(c => c.id === editingCourse.id);
      
      if (enIndex !== -1) {
        newContent.en.courses.items[enIndex] = {
          ...newContent.en.courses.items[enIndex],
          title: courseTitleEn,
          description: courseDescEn,
          shortDescription: courseShortDescEn,
          duration: courseDuration,
          format: courseFormat,
          target: courseTarget,
          features: courseFeaturesEn,
          deliverables: courseDeliverablesEn,
          requirements: courseRequirementsEn,
          outcomes: courseOutcomesEn,
          level: courseLevel
        };
      }
      
      if (hyIndex !== -1) {
        newContent.hy.courses.items[hyIndex] = {
          ...newContent.hy.courses.items[hyIndex],
          title: courseTitleHy,
          description: courseDescHy,
          shortDescription: courseShortDescHy,
          duration: courseDuration,
          format: courseFormat,
          target: courseTarget,
          features: courseFeaturesHy,
          deliverables: courseDeliverablesHy,
          requirements: courseRequirementsHy,
          outcomes: courseOutcomesHy,
          level: courseLevel
        };
      }
    } else {
      const newId = Date.now().toString();
      const slug = courseTitleEn.toLowerCase().replace(/\s+/g, '-');
      const newCourse = {
        id: newId,
        title: courseTitleEn,
        description: courseDescEn,
        shortDescription: courseShortDescEn,
        duration: courseDuration || '8 weeks',
        format: courseFormat || 'Hybrid',
        target: courseTarget || '',
        features: courseFeaturesEn,
        deliverables: courseDeliverablesEn,
        requirements: courseRequirementsEn,
        outcomes: courseOutcomesEn,
        isVisible: true,
        slug,
        level: courseLevel
      };
      
      newContent.en.courses.items.push(newCourse);
      newContent.hy.courses.items.push({
        ...newCourse,
        title: courseTitleHy,
        description: courseDescHy,
        shortDescription: courseShortDescHy,
        features: courseFeaturesHy,
        deliverables: courseDeliverablesHy,
        requirements: courseRequirementsHy,
        outcomes: courseOutcomesHy
      });
    }
    
    setTempContent(newContent);
    setContentData(newContent);
    setShowCourseModal(false);
    alert('Course saved!');
  };

  const handleDeleteCourse = (id: string) => {
    if (!confirm('Delete this course?')) return;
    
    const newContent = { ...tempContent };
    newContent.en.courses.items = newContent.en.courses.items.filter(c => c.id !== id);
    newContent.hy.courses.items = newContent.hy.courses.items.filter(c => c.id !== id);
    
    setTempContent(newContent);
    setContentData(newContent);
    alert('Course deleted!');
  };

  const handleToggleCourseVisibility = (id: string) => {
    const newContent = { ...tempContent };
    const enCourse = newContent.en.courses.items.find(c => c.id === id);
    const hyCourse = newContent.hy.courses.items.find(c => c.id === id);
    if (enCourse) enCourse.isVisible = !enCourse.isVisible;
    if (hyCourse) hyCourse.isVisible = !hyCourse.isVisible;
    setTempContent(newContent);
    setContentData(newContent);
  };

  const handleAddFAQ = () => {
    setEditingFAQ(null);
    setFaqQuestionEn('');
    setFaqQuestionHy('');
    setFaqAnswerEn('');
    setFaqAnswerHy('');
    setShowFAQModal(true);
  };

  const handleEditFAQ = (faq: any) => {
    setEditingFAQ(faq);
    const hyFaq = content.hy.faq.questions.find(f => f.id === faq.id);
    setFaqQuestionEn(faq.question || '');
    setFaqQuestionHy(hyFaq?.question || '');
    setFaqAnswerEn(faq.answer || '');
    setFaqAnswerHy(hyFaq?.answer || '');
    setShowFAQModal(true);
  };

  const handleSaveFAQ = () => {
    const newContent = { ...tempContent };
    
    if (editingFAQ) {
      const enIndex = newContent.en.faq.questions.findIndex(f => f.id === editingFAQ.id);
      const hyIndex = newContent.hy.faq.questions.findIndex(f => f.id === editingFAQ.id);
      
      if (enIndex !== -1) {
        newContent.en.faq.questions[enIndex] = {
          ...newContent.en.faq.questions[enIndex],
          question: faqQuestionEn,
          answer: faqAnswerEn
        };
      }
      
      if (hyIndex !== -1) {
        newContent.hy.faq.questions[hyIndex] = {
          ...newContent.hy.faq.questions[hyIndex],
          question: faqQuestionHy,
          answer: faqAnswerHy
        };
      }
    } else {
      const newId = Date.now().toString();
      newContent.en.faq.questions.push({
        id: newId,
        question: faqQuestionEn,
        answer: faqAnswerEn
      });
      newContent.hy.faq.questions.push({
        id: newId,
        question: faqQuestionHy,
        answer: faqAnswerHy
      });
    }
    
    setTempContent(newContent);
    setContentData(newContent);
    setShowFAQModal(false);
    alert('FAQ saved!');
  };

  const handleDeleteFAQ = (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    const newContent = { ...tempContent };
    newContent.en.faq.questions = newContent.en.faq.questions.filter(f => f.id !== id);
    newContent.hy.faq.questions = newContent.hy.faq.questions.filter(f => f.id !== id);
    setTempContent(newContent);
    setContentData(newContent);
    alert('FAQ deleted!');
  };

  const handleLoadPages = useCallback(() => {
    if (hasUnsavedPageChanges && !confirmLeaveWithUnsavedPages('reload the current content')) {
      return;
    }

    const enFeatureMap = new Map(
      (content.en.features.items || []).map(item => [
        item.id,
        { id: item.id, title: item.title || '', description: item.description || '', icon: item.icon || 'Calculator' }
      ])
    );
    const hyFeatureMap = new Map(
      (content.hy.features.items || []).map(item => [
        item.id,
        { id: item.id, title: item.title || '', description: item.description || '', icon: item.icon || 'Calculator' }
      ])
    );
    const featureIds = Array.from(new Set([...enFeatureMap.keys(), ...hyFeatureMap.keys()]));
    const normalizedFeatureItemsEn = featureIds.map(id => {
      const enItem = enFeatureMap.get(id);
      const hyItem = hyFeatureMap.get(id);
      return {
        id,
        title: enItem?.title || '',
        description: enItem?.description || '',
        icon: enItem?.icon || hyItem?.icon || 'Calculator'
      };
    });
    const normalizedFeatureItemsHy = featureIds.map(id => {
      const enItem = enFeatureMap.get(id);
      const hyItem = hyFeatureMap.get(id);
      return {
        id,
        title: hyItem?.title || '',
        description: hyItem?.description || '',
        icon: hyItem?.icon || enItem?.icon || 'Calculator'
      };
    });

    setHeroTitleEn(content.en.hero.title || '');
    setHeroTitleHy(content.hy.hero.title || '');
    setHeroSubtitleEn(content.en.hero.subtitle || '');
    setHeroSubtitleHy(content.hy.hero.subtitle || '');
    setHeroDescEn(content.en.hero.description || '');
    setHeroDescHy(content.hy.hero.description || '');
    setHeroCtaPrimaryEn(content.en.hero.ctaPrimary || '');
    setHeroCtaPrimaryHy(content.hy.hero.ctaPrimary || '');
    setHeroCtaSecondaryEn(content.en.hero.ctaSecondary || '');
    setHeroCtaSecondaryHy(content.hy.hero.ctaSecondary || '');
    setHeroStudentsTrainedEn(content.en.hero.studentsTrained || '');
    setHeroStudentsTrainedHy(content.hy.hero.studentsTrained || '');
    setHeroImage(content.en.hero.image || '');

    setFeaturesTitleEn(content.en.features.title || '');
    setFeaturesTitleHy(content.hy.features.title || '');
    setFeaturesDescEn(content.en.features.description || '');
    setFeaturesDescHy(content.hy.features.description || '');
    setFeaturesCtaTitleEn(content.en.features.cta?.title || '');
    setFeaturesCtaTitleHy(content.hy.features.cta?.title || '');
    setFeaturesCtaDescEn(content.en.features.cta?.description || '');
    setFeaturesCtaDescHy(content.hy.features.cta?.description || '');
    setFeaturesCtaPrimaryLabelEn(content.en.features.cta?.primaryLabel || '');
    setFeaturesCtaPrimaryLabelHy(content.hy.features.cta?.primaryLabel || '');
    setFeaturesCtaSecondaryLabelEn(content.en.features.cta?.secondaryLabel || '');
    setFeaturesCtaSecondaryLabelHy(content.hy.features.cta?.secondaryLabel || '');
    setFeatureItemsEn(normalizedFeatureItemsEn);
    setFeatureItemsHy(normalizedFeatureItemsHy);

    setInstagramTitleEn(content.en.features.instagram?.title || '');
    setInstagramTitleHy(content.hy.features.instagram?.title || '');
    setInstagramSubtitleEn(content.en.features.instagram?.subtitle || '');
    setInstagramSubtitleHy(content.hy.features.instagram?.subtitle || '');
    setInstagramBadgeEn(content.en.features.instagram?.badge || '');
    setInstagramBadgeHy(content.hy.features.instagram?.badge || '');
    setInstagramHandleEn(content.en.features.instagram?.handle || '');
    setInstagramHandleHy(content.hy.features.instagram?.handle || '');
    setInstagramDescriptionEn(content.en.features.instagram?.description || '');
    setInstagramDescriptionHy(content.hy.features.instagram?.description || '');
    setInstagramButtonLabelEn(content.en.features.instagram?.buttonLabel || '');
    setInstagramButtonLabelHy(content.hy.features.instagram?.buttonLabel || '');
    setInstagramUrl(content.en.features.instagram?.url || '');

    setLinkedinBadgeEn(content.en.features.linkedin?.badge || '');
    setLinkedinBadgeHy(content.hy.features.linkedin?.badge || '');
    setLinkedinHandleEn(content.en.features.linkedin?.handle || '');
    setLinkedinHandleHy(content.hy.features.linkedin?.handle || '');
    setLinkedinDescriptionEn(content.en.features.linkedin?.description || '');
    setLinkedinDescriptionHy(content.hy.features.linkedin?.description || '');
    setLinkedinButtonLabelEn(content.en.features.linkedin?.buttonLabel || '');
    setLinkedinButtonLabelHy(content.hy.features.linkedin?.buttonLabel || '');
    setLinkedinUrl(content.en.features.linkedin?.url || '');

    setFacebookBadgeEn(content.en.features.facebook?.badge || '');
    setFacebookBadgeHy(content.hy.features.facebook?.badge || '');
    setFacebookHandleEn(content.en.features.facebook?.handle || '');
    setFacebookHandleHy(content.hy.features.facebook?.handle || '');
    setFacebookDescriptionEn(content.en.features.facebook?.description || '');
    setFacebookDescriptionHy(content.hy.features.facebook?.description || '');
    setFacebookButtonLabelEn(content.en.features.facebook?.buttonLabel || '');
    setFacebookButtonLabelHy(content.hy.features.facebook?.buttonLabel || '');
    setFacebookUrl(content.en.features.facebook?.url || '');

    setContactTitleEn(content.en.contact.title || '');
    setContactTitleHy(content.hy.contact.title || '');
    setContactDescriptionEn(content.en.contact.description || '');
    setContactDescriptionHy(content.hy.contact.description || '');
    setContactEmail(content.en.contact.email || '');
    setContactPhone(content.en.contact.phone || '');
    setContactAddressEn(content.en.contact.address || '');
    setContactAddressHy(content.hy.contact.address || '');
    setContactInstagram(content.en.contact.instagram || '');
    setFaqTeaserTitleEn(content.en.contact.faqTeaser?.title || '');
    setFaqTeaserTitleHy(content.hy.contact.faqTeaser?.title || '');
    setFaqTeaserDescEn(content.en.contact.faqTeaser?.description || '');
    setFaqTeaserDescHy(content.hy.contact.faqTeaser?.description || '');
    setFooterTaglineEn(content.en.footer.tagline || '');
    setFooterTaglineHy(content.hy.footer.tagline || '');
    setFooterDescEn(content.en.footer.description || '');
    setFooterDescHy(content.hy.footer.description || '');
    setFooterCopyright(content.en.footer.bottom?.copyright || '');
    setFooterNote(content.en.footer.bottom?.note || '');
    setFooterPrivacyLabelEn(content.en.footer.bottom?.privacyLabel || '');
    setFooterPrivacyLabelHy(content.hy.footer.bottom?.privacyLabel || '');
    setFooterInstagram(content.en.contact.socials?.instagram || '');
    setFooterLinkedin(content.en.contact.socials?.linkedin || '');
    setFooterFacebook(content.en.contact.socials?.facebook || '');

    setAnnouncementsTitleEn(content.en.announcements?.title || '');
    setAnnouncementsTitleHy(content.hy.announcements?.title || '');
    setAnnouncementsDescEn(content.en.announcements?.description || '');
    setAnnouncementsDescHy(content.hy.announcements?.description || '');
    setAnnouncementsEmptyTitleEn(content.en.announcements?.emptyStateTitle || '');
    setAnnouncementsEmptyTitleHy(content.hy.announcements?.emptyStateTitle || '');
    setAnnouncementsEmptyDescEn(content.en.announcements?.emptyStateDescription || '');
    setAnnouncementsEmptyDescHy(content.hy.announcements?.emptyStateDescription || '');

    setOfficeMonday(content.en.contact.officeHours?.monday || '9:00 AM - 6:00 PM');
    setOfficeTuesday(content.en.contact.officeHours?.tuesday || '9:00 AM - 6:00 PM');
    setOfficeWednesday(content.en.contact.officeHours?.wednesday || '9:00 AM - 6:00 PM');
    setOfficeThursday(content.en.contact.officeHours?.thursday || '9:00 AM - 6:00 PM');
    setOfficeFriday(content.en.contact.officeHours?.friday || '9:00 AM - 6:00 PM');
    setOfficeSaturday(content.en.contact.officeHours?.saturday || 'Closed');
    setOfficeSunday(content.en.contact.officeHours?.sunday || 'Closed');
    setAboutTitleEn(content.en.about.title || '');
    setAboutTitleHy(content.hy.about.title || '');
    setAboutMissionEn(content.en.about.mission || '');
    setAboutMissionHy(content.hy.about.mission || '');
    setAboutImagePrimary(content.en.about.imagePrimary || '');
    setAboutImageSecondary(content.en.about.imageSecondary || '');

    const enParas = content.en.about.missionParagraphs || [];
    const hyParas = content.hy.about.missionParagraphs || [];
    setMissionPara1En(enParas[0] || '');
    setMissionPara1Hy(hyParas[0] || '');
    setMissionPara2En(enParas[1] || '');
    setMissionPara2Hy(hyParas[1] || '');

    const enPoints = content.en.about.missionPoints || [];
    const hyPoints = content.hy.about.missionPoints || [];
    setMissionPoint1En(enPoints[0] || '');
    setMissionPoint1Hy(hyPoints[0] || '');
    setMissionPoint2En(enPoints[1] || '');
    setMissionPoint2Hy(hyPoints[1] || '');
    setMissionPoint3En(enPoints[2] || '');
    setMissionPoint3Hy(hyPoints[2] || '');

    const snapshot = {
      hero: {
        titleEn: content.en.hero.title || '',
        titleHy: content.hy.hero.title || '',
        subtitleEn: content.en.hero.subtitle || '',
        subtitleHy: content.hy.hero.subtitle || '',
        descriptionEn: content.en.hero.description || '',
        descriptionHy: content.hy.hero.description || '',
        ctaPrimaryEn: content.en.hero.ctaPrimary || '',
        ctaPrimaryHy: content.hy.hero.ctaPrimary || '',
        ctaSecondaryEn: content.en.hero.ctaSecondary || '',
        ctaSecondaryHy: content.hy.hero.ctaSecondary || '',
        studentsTrainedEn: content.en.hero.studentsTrained || '',
        studentsTrainedHy: content.hy.hero.studentsTrained || '',
        image: content.en.hero.image || ''
      },
      features: {
        titleEn: content.en.features.title || '',
        titleHy: content.hy.features.title || '',
        descriptionEn: content.en.features.description || '',
        descriptionHy: content.hy.features.description || '',
        ctaTitleEn: content.en.features.cta?.title || '',
        ctaTitleHy: content.hy.features.cta?.title || '',
        ctaDescriptionEn: content.en.features.cta?.description || '',
        ctaDescriptionHy: content.hy.features.cta?.description || '',
        ctaPrimaryLabelEn: content.en.features.cta?.primaryLabel || '',
        ctaPrimaryLabelHy: content.hy.features.cta?.primaryLabel || '',
        ctaSecondaryLabelEn: content.en.features.cta?.secondaryLabel || '',
        ctaSecondaryLabelHy: content.hy.features.cta?.secondaryLabel || '',
        itemsEn: normalizedFeatureItemsEn,
        itemsHy: normalizedFeatureItemsHy,
        instagram: {
          titleEn: content.en.features.instagram?.title || '',
          titleHy: content.hy.features.instagram?.title || '',
          subtitleEn: content.en.features.instagram?.subtitle || '',
          subtitleHy: content.hy.features.instagram?.subtitle || '',
          badgeEn: content.en.features.instagram?.badge || '',
          badgeHy: content.hy.features.instagram?.badge || '',
          handleEn: content.en.features.instagram?.handle || '',
          handleHy: content.hy.features.instagram?.handle || '',
          descriptionEn: content.en.features.instagram?.description || '',
          descriptionHy: content.hy.features.instagram?.description || '',
          buttonLabelEn: content.en.features.instagram?.buttonLabel || '',
          buttonLabelHy: content.hy.features.instagram?.buttonLabel || '',
          url: content.en.features.instagram?.url || ''
        },
        linkedin: {
          badgeEn: content.en.features.linkedin?.badge || '',
          badgeHy: content.hy.features.linkedin?.badge || '',
          handleEn: content.en.features.linkedin?.handle || '',
          handleHy: content.hy.features.linkedin?.handle || '',
          descriptionEn: content.en.features.linkedin?.description || '',
          descriptionHy: content.hy.features.linkedin?.description || '',
          buttonLabelEn: content.en.features.linkedin?.buttonLabel || '',
          buttonLabelHy: content.hy.features.linkedin?.buttonLabel || '',
          url: content.en.features.linkedin?.url || ''
        },
        facebook: {
          badgeEn: content.en.features.facebook?.badge || '',
          badgeHy: content.hy.features.facebook?.badge || '',
          handleEn: content.en.features.facebook?.handle || '',
          handleHy: content.hy.features.facebook?.handle || '',
          descriptionEn: content.en.features.facebook?.description || '',
          descriptionHy: content.hy.features.facebook?.description || '',
          buttonLabelEn: content.en.features.facebook?.buttonLabel || '',
          buttonLabelHy: content.hy.features.facebook?.buttonLabel || '',
          url: content.en.features.facebook?.url || ''
        }
      },
      contact: {
        titleEn: content.en.contact.title || '',
        titleHy: content.hy.contact.title || '',
        descriptionEn: content.en.contact.description || '',
        descriptionHy: content.hy.contact.description || '',
        email: content.en.contact.email || '',
        phone: content.en.contact.phone || '',
        addressEn: content.en.contact.address || '',
        addressHy: content.hy.contact.address || '',
        instagram: content.en.contact.instagram || '',
        officeHours: {
          monday: content.en.contact.officeHours?.monday || '9:00 AM - 6:00 PM',
          tuesday: content.en.contact.officeHours?.tuesday || '9:00 AM - 6:00 PM',
          wednesday: content.en.contact.officeHours?.wednesday || '9:00 AM - 6:00 PM',
          thursday: content.en.contact.officeHours?.thursday || '9:00 AM - 6:00 PM',
          friday: content.en.contact.officeHours?.friday || '9:00 AM - 6:00 PM',
          saturday: content.en.contact.officeHours?.saturday || 'Closed',
          sunday: content.en.contact.officeHours?.sunday || 'Closed'
        },
        faqTeaser: {
          titleEn: content.en.contact.faqTeaser?.title || '',
          titleHy: content.hy.contact.faqTeaser?.title || '',
          descriptionEn: content.en.contact.faqTeaser?.description || '',
          descriptionHy: content.hy.contact.faqTeaser?.description || ''
        }
      },
      footer: {
        taglineEn: content.en.footer.tagline || '',
        taglineHy: content.hy.footer.tagline || '',
        descriptionEn: content.en.footer.description || '',
        descriptionHy: content.hy.footer.description || '',
        copyright: content.en.footer.bottom?.copyright || '',
        note: content.en.footer.bottom?.note || '',
        privacyLabelEn: content.en.footer.bottom?.privacyLabel || '',
        privacyLabelHy: content.hy.footer.bottom?.privacyLabel || '',
        socials: {
          instagram: content.en.contact.socials?.instagram || '',
          linkedin: content.en.contact.socials?.linkedin || '',
          facebook: content.en.contact.socials?.facebook || ''
        }
      },
      announcements: {
        titleEn: content.en.announcements?.title || '',
        titleHy: content.hy.announcements?.title || '',
        descriptionEn: content.en.announcements?.description || '',
        descriptionHy: content.hy.announcements?.description || '',
        emptyTitleEn: content.en.announcements?.emptyStateTitle || '',
        emptyTitleHy: content.hy.announcements?.emptyStateTitle || '',
        emptyDescriptionEn: content.en.announcements?.emptyStateDescription || '',
        emptyDescriptionHy: content.hy.announcements?.emptyStateDescription || ''
      },
      about: {
        titleEn: content.en.about.title || '',
        titleHy: content.hy.about.title || '',
        missionEn: content.en.about.mission || '',
        missionHy: content.hy.about.mission || '',
        imagePrimary: content.en.about.imagePrimary || '',
        imageSecondary: content.en.about.imageSecondary || '',
        paragraph1En: enParas[0] || '',
        paragraph1Hy: hyParas[0] || '',
        paragraph2En: enParas[1] || '',
        paragraph2Hy: hyParas[1] || '',
        point1En: enPoints[0] || '',
        point1Hy: hyPoints[0] || '',
        point2En: enPoints[1] || '',
        point2Hy: hyPoints[1] || '',
        point3En: enPoints[2] || '',
        point3Hy: hyPoints[2] || ''
      }
    };

    setPagesLoadedSnapshot(JSON.stringify(snapshot));
    setPagesLoadedOnce(true);
  }, [confirmLeaveWithUnsavedPages, content, hasUnsavedPageChanges]);

  const handleSavePages = () => {
    const newContent = { ...tempContent };
    newContent.en.hero.title = heroTitleEn;
    newContent.hy.hero.title = heroTitleHy;
    newContent.en.hero.subtitle = heroSubtitleEn;
    newContent.hy.hero.subtitle = heroSubtitleHy;
    newContent.en.hero.description = heroDescEn;
    newContent.hy.hero.description = heroDescHy;
    newContent.en.hero.ctaPrimary = heroCtaPrimaryEn;
    newContent.hy.hero.ctaPrimary = heroCtaPrimaryHy;
    newContent.en.hero.ctaSecondary = heroCtaSecondaryEn;
    newContent.hy.hero.ctaSecondary = heroCtaSecondaryHy;
    newContent.en.hero.studentsTrained = heroStudentsTrainedEn;
    newContent.hy.hero.studentsTrained = heroStudentsTrainedHy;
    newContent.en.hero.image = heroImage;
    newContent.hy.hero.image = heroImage;
    
    newContent.en.features.title = featuresTitleEn;
    newContent.hy.features.title = featuresTitleHy;
    newContent.en.features.description = featuresDescEn;
    newContent.hy.features.description = featuresDescHy;
    if (!newContent.en.features.cta) newContent.en.features.cta = {} as any;
    if (!newContent.hy.features.cta) newContent.hy.features.cta = {} as any;
    newContent.en.features.cta.title = featuresCtaTitleEn;
    newContent.hy.features.cta.title = featuresCtaTitleHy;
    newContent.en.features.cta.description = featuresCtaDescEn;
    newContent.hy.features.cta.description = featuresCtaDescHy;
    newContent.en.features.cta.primaryLabel = featuresCtaPrimaryLabelEn;
    newContent.hy.features.cta.primaryLabel = featuresCtaPrimaryLabelHy;
    newContent.en.features.cta.secondaryLabel = featuresCtaSecondaryLabelEn;
    newContent.hy.features.cta.secondaryLabel = featuresCtaSecondaryLabelHy;
    newContent.en.features.items = featureItemsEn.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      icon: item.icon
    }));
    newContent.hy.features.items = featureItemsHy.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      icon: item.icon
    }));
    
    if (!newContent.en.features.instagram) newContent.en.features.instagram = {} as any;
    if (!newContent.hy.features.instagram) newContent.hy.features.instagram = {} as any;
    newContent.en.features.instagram.title = instagramTitleEn;
    newContent.hy.features.instagram.title = instagramTitleHy;
    newContent.en.features.instagram.subtitle = instagramSubtitleEn;
    newContent.hy.features.instagram.subtitle = instagramSubtitleHy;
    newContent.en.features.instagram.badge = instagramBadgeEn;
    newContent.hy.features.instagram.badge = instagramBadgeHy;
    newContent.en.features.instagram.handle = instagramHandleEn;
    newContent.hy.features.instagram.handle = instagramHandleHy;
    newContent.en.features.instagram.description = instagramDescriptionEn;
    newContent.hy.features.instagram.description = instagramDescriptionHy;
    newContent.en.features.instagram.buttonLabel = instagramButtonLabelEn;
    newContent.hy.features.instagram.buttonLabel = instagramButtonLabelHy;
    newContent.en.features.instagram.url = instagramUrl;
    newContent.hy.features.instagram.url = instagramUrl;
    
    if (!newContent.en.features.linkedin) newContent.en.features.linkedin = {} as any;
    if (!newContent.hy.features.linkedin) newContent.hy.features.linkedin = {} as any;
    newContent.en.features.linkedin.badge = linkedinBadgeEn;
    newContent.hy.features.linkedin.badge = linkedinBadgeHy;
    newContent.en.features.linkedin.handle = linkedinHandleEn;
    newContent.hy.features.linkedin.handle = linkedinHandleHy;
    newContent.en.features.linkedin.description = linkedinDescriptionEn;
    newContent.hy.features.linkedin.description = linkedinDescriptionHy;
    newContent.en.features.linkedin.buttonLabel = linkedinButtonLabelEn;
    newContent.hy.features.linkedin.buttonLabel = linkedinButtonLabelHy;
    newContent.en.features.linkedin.url = linkedinUrl;
    newContent.hy.features.linkedin.url = linkedinUrl;
    
    if (!newContent.en.features.facebook) newContent.en.features.facebook = {} as any;
    if (!newContent.hy.features.facebook) newContent.hy.features.facebook = {} as any;
    newContent.en.features.facebook.badge = facebookBadgeEn;
    newContent.hy.features.facebook.badge = facebookBadgeHy;
    newContent.en.features.facebook.handle = facebookHandleEn;
    newContent.hy.features.facebook.handle = facebookHandleHy;
    newContent.en.features.facebook.description = facebookDescriptionEn;
    newContent.hy.features.facebook.description = facebookDescriptionHy;
    newContent.en.features.facebook.buttonLabel = facebookButtonLabelEn;
    newContent.hy.features.facebook.buttonLabel = facebookButtonLabelHy;
    newContent.en.features.facebook.url = facebookUrl;
    newContent.hy.features.facebook.url = facebookUrl;
    newContent.en.contact.title = contactTitleEn;
    newContent.hy.contact.title = contactTitleHy;
    newContent.en.contact.description = contactDescriptionEn;
    newContent.hy.contact.description = contactDescriptionHy;
    newContent.en.contact.email = contactEmail;
    newContent.hy.contact.email = contactEmail;
    newContent.en.contact.phone = contactPhone;
    newContent.hy.contact.phone = contactPhone;
    newContent.en.contact.address = contactAddressEn;
    newContent.hy.contact.address = contactAddressHy;
    newContent.en.contact.instagram = contactInstagram;
    newContent.hy.contact.instagram = contactInstagram;
    
    if (!newContent.en.contact.faqTeaser) newContent.en.contact.faqTeaser = {} as any;
    if (!newContent.hy.contact.faqTeaser) newContent.hy.contact.faqTeaser = {} as any;
    newContent.en.contact.faqTeaser.title = faqTeaserTitleEn;
    newContent.hy.contact.faqTeaser.title = faqTeaserTitleHy;
    newContent.en.contact.faqTeaser.description = faqTeaserDescEn;
    newContent.hy.contact.faqTeaser.description = faqTeaserDescHy;
    
    if (!newContent.en.contact.officeHours) newContent.en.contact.officeHours = {} as any;
    if (!newContent.hy.contact.officeHours) newContent.hy.contact.officeHours = {} as any;
    newContent.en.contact.officeHours.monday = officeMonday;
    newContent.hy.contact.officeHours.monday = officeMonday;
    newContent.en.contact.officeHours.tuesday = officeTuesday;
    newContent.hy.contact.officeHours.tuesday = officeTuesday;
    newContent.en.contact.officeHours.wednesday = officeWednesday;
    newContent.hy.contact.officeHours.wednesday = officeWednesday;
    newContent.en.contact.officeHours.thursday = officeThursday;
    newContent.hy.contact.officeHours.thursday = officeThursday;
    newContent.en.contact.officeHours.friday = officeFriday;
    newContent.hy.contact.officeHours.friday = officeFriday;
    newContent.en.contact.officeHours.saturday = officeSaturday;
    newContent.hy.contact.officeHours.saturday = officeSaturday;
    newContent.en.contact.officeHours.sunday = officeSunday;
    newContent.hy.contact.officeHours.sunday = officeSunday;
    
    newContent.en.footer.tagline = footerTaglineEn;
    newContent.hy.footer.tagline = footerTaglineHy;
    newContent.en.footer.description = footerDescEn;
    newContent.hy.footer.description = footerDescHy;
    
    if (!newContent.en.footer.bottom) newContent.en.footer.bottom = {} as any;
    if (!newContent.hy.footer.bottom) newContent.hy.footer.bottom = {} as any;
    newContent.en.footer.bottom.copyright = footerCopyright;
    newContent.hy.footer.bottom.copyright = footerCopyright;
    newContent.en.footer.bottom.note = footerNote;
    newContent.hy.footer.bottom.note = footerNote;
    newContent.en.footer.bottom.privacyLabel = footerPrivacyLabelEn;
    newContent.hy.footer.bottom.privacyLabel = footerPrivacyLabelHy;
    
    if (!newContent.en.contact.socials) newContent.en.contact.socials = {};
    if (!newContent.hy.contact.socials) newContent.hy.contact.socials = {};
    newContent.en.contact.socials.instagram = footerInstagram;
    newContent.hy.contact.socials.instagram = footerInstagram;
    newContent.en.contact.socials.linkedin = footerLinkedin;
    newContent.hy.contact.socials.linkedin = footerLinkedin;
    newContent.en.contact.socials.facebook = footerFacebook;
    newContent.hy.contact.socials.facebook = footerFacebook;
    
    if (!newContent.en.announcements) newContent.en.announcements = { items: [] };
    if (!newContent.hy.announcements) newContent.hy.announcements = { items: [] };
    newContent.en.announcements.title = announcementsTitleEn;
    newContent.hy.announcements.title = announcementsTitleHy;
    newContent.en.announcements.description = announcementsDescEn;
    newContent.hy.announcements.description = announcementsDescHy;
    newContent.en.announcements.emptyStateTitle = announcementsEmptyTitleEn;
    newContent.hy.announcements.emptyStateTitle = announcementsEmptyTitleHy;
    newContent.en.announcements.emptyStateDescription = announcementsEmptyDescEn;
    newContent.hy.announcements.emptyStateDescription = announcementsEmptyDescHy;
    
    newContent.en.about.title = aboutTitleEn;
    newContent.hy.about.title = aboutTitleHy;
    newContent.en.about.mission = aboutMissionEn;
    newContent.hy.about.mission = aboutMissionHy;
    newContent.en.about.imagePrimary = aboutImagePrimary;
    newContent.hy.about.imagePrimary = aboutImagePrimary;
    newContent.en.about.imageSecondary = aboutImageSecondary;
    newContent.hy.about.imageSecondary = aboutImageSecondary;
    
    newContent.en.about.missionParagraphs = [missionPara1En, missionPara2En].filter(p => p.trim() !== '');
    newContent.hy.about.missionParagraphs = [missionPara1Hy, missionPara2Hy].filter(p => p.trim() !== '');
    
    newContent.en.about.missionPoints = [missionPoint1En, missionPoint2En, missionPoint3En].filter(p => p.trim() !== '');
    newContent.hy.about.missionPoints = [missionPoint1Hy, missionPoint2Hy, missionPoint3Hy].filter(p => p.trim() !== '');
    
    setTempContent(newContent);
    setContentData(newContent);
    setPagesLoadedSnapshot(pagesDraftSnapshot);
    setPagesLoadedOnce(true);
    alert('Pages updated successfully!');
  };

  useEffect(() => {
    if (!isAuthenticated || !hasPermission('edit_content') || pagesLoadedOnce) {
      return;
    }
    handleLoadPages();
  }, [content, handleLoadPages, hasPermission, isAuthenticated, pagesLoadedOnce]);

  const handleAddValue = () => {
    setEditingValue(null);
    setValueTitleEn('');
    setValueTitleHy('');
    setValueDescEn('');
    setValueDescHy('');
    setValueIcon('Star');
    setShowValueModal(true);
  };

  const handleEditValue = (value: any) => {
    setEditingValue(value);
    const hyValue = content.hy.about.values.find(v => v.id === value.id);
    setValueTitleEn(value.title || '');
    setValueTitleHy(hyValue?.title || '');
    setValueDescEn(value.description || '');
    setValueDescHy(hyValue?.description || '');
    setValueIcon(value.icon || 'Star');
    setShowValueModal(true);
  };

  const handleSaveValue = () => {
    const newContent = { ...tempContent };
    
    if (editingValue) {
      const enIndex = newContent.en.about.values.findIndex(v => v.id === editingValue.id);
      const hyIndex = newContent.hy.about.values.findIndex(v => v.id === editingValue.id);
      
      if (enIndex !== -1) {
        newContent.en.about.values[enIndex] = {
          ...newContent.en.about.values[enIndex],
          title: valueTitleEn,
          description: valueDescEn,
          icon: valueIcon
        };
      }
      
      if (hyIndex !== -1) {
        newContent.hy.about.values[hyIndex] = {
          ...newContent.hy.about.values[hyIndex],
          title: valueTitleHy,
          description: valueDescHy,
          icon: valueIcon
        };
      }
    } else {
      const newId = Date.now().toString();
      newContent.en.about.values.push({
        id: newId,
        title: valueTitleEn,
        description: valueDescEn,
        icon: valueIcon
      });
      newContent.hy.about.values.push({
        id: newId,
        title: valueTitleHy,
        description: valueDescHy,
        icon: valueIcon
      });
    }
    
    setTempContent(newContent);
    setContentData(newContent);
    setShowValueModal(false);
    alert('Value saved!');
  };

  const handleDeleteValue = (id: string) => {
    if (!confirm('Delete this value?')) return;
    const newContent = { ...tempContent };
    newContent.en.about.values = newContent.en.about.values.filter(v => v.id !== id);
    newContent.hy.about.values = newContent.hy.about.values.filter(v => v.id !== id);
    setTempContent(newContent);
    setContentData(newContent);
    alert('Value deleted!');
  };

  const handleAddStat = () => {
    setEditingStat(null);
    setStatLabelEn('');
    setStatLabelHy('');
    setStatNumber('');
    setShowStatModal(true);
  };

  const handleEditStat = (stat: any) => {
    setEditingStat(stat);
    const hyStat = content.hy.about.statsBoxes?.find(s => s.id === stat.id);
    setStatLabelEn(stat.label || '');
    setStatLabelHy(hyStat?.label || '');
    setStatNumber(stat.number || '');
    setShowStatModal(true);
  };

  const handleSaveStat = () => {
    const newContent = { ...tempContent };
    
    if (!newContent.en.about.statsBoxes) newContent.en.about.statsBoxes = [];
    if (!newContent.hy.about.statsBoxes) newContent.hy.about.statsBoxes = [];
    
    if (editingStat) {
      const enIndex = newContent.en.about.statsBoxes.findIndex(s => s.id === editingStat.id);
      const hyIndex = newContent.hy.about.statsBoxes.findIndex(s => s.id === editingStat.id);
      
      if (enIndex !== -1) {
        newContent.en.about.statsBoxes[enIndex] = {
          ...newContent.en.about.statsBoxes[enIndex],
          label: statLabelEn,
          number: statNumber
        };
      }
      
      if (hyIndex !== -1) {
        newContent.hy.about.statsBoxes[hyIndex] = {
          ...newContent.hy.about.statsBoxes[hyIndex],
          label: statLabelHy,
          number: statNumber
        };
      }
    } else {
      const newId = Date.now().toString();
      newContent.en.about.statsBoxes.push({
        id: newId,
        label: statLabelEn,
        number: statNumber
      });
      newContent.hy.about.statsBoxes.push({
        id: newId,
        label: statLabelHy,
        number: statNumber
      });
    }
    
    setTempContent(newContent);
    setContentData(newContent);
    setShowStatModal(false);
    alert('Statistic saved!');
  };

  const handleDeleteStat = (id: string) => {
    if (!confirm('Delete this statistic?')) return;
    const newContent = { ...tempContent };
    if (newContent.en.about.statsBoxes) {
      newContent.en.about.statsBoxes = newContent.en.about.statsBoxes.filter(s => s.id !== id);
    }
    if (newContent.hy.about.statsBoxes) {
      newContent.hy.about.statsBoxes = newContent.hy.about.statsBoxes.filter(s => s.id !== id);
    }
    setTempContent(newContent);
    setContentData(newContent);
    alert('Statistic deleted!');
  };

  const handleAddTeamMember = () => {
    setEditingTeamMember(null);
    setTeamNameEn('');
    setTeamNameHy('');
    setTeamRoleEn('');
    setTeamRoleHy('');
    setTeamBioEn('');
    setTeamBioHy('');
    setTeamExpertiseEn([]);
    setTeamExpertiseHy([]);
    setTeamImage('');
    setShowTeamModal(true);
  };

  const handleEditTeamMember = (member: any) => {
    setEditingTeamMember(member);
    const hyMember = content.hy.about.team.find(m => m.id === member.id);
    setTeamNameEn(member.name || '');
    setTeamNameHy(hyMember?.name || '');
    setTeamRoleEn(member.role || '');
    setTeamRoleHy(hyMember?.role || '');
    setTeamBioEn(member.bio || '');
    setTeamBioHy(hyMember?.bio || '');
    setTeamExpertiseEn(member.expertise || []);
    setTeamExpertiseHy(hyMember?.expertise || []);
    setTeamImage(member.image || '');
    setShowTeamModal(true);
  };

  const handleSaveTeamMember = () => {
    const newContent = { ...tempContent };
    
    if (editingTeamMember) {
      const enIndex = newContent.en.about.team.findIndex(m => m.id === editingTeamMember.id);
      const hyIndex = newContent.hy.about.team.findIndex(m => m.id === editingTeamMember.id);
      
      if (enIndex !== -1) {
        newContent.en.about.team[enIndex] = {
          ...newContent.en.about.team[enIndex],
          name: teamNameEn,
          role: teamRoleEn,
          bio: teamBioEn,
          expertise: teamExpertiseEn,
          image: teamImage
        };
      }
      
      if (hyIndex !== -1) {
        newContent.hy.about.team[hyIndex] = {
          ...newContent.hy.about.team[hyIndex],
          name: teamNameHy,
          role: teamRoleHy,
          bio: teamBioHy,
          expertise: teamExpertiseHy,
          image: teamImage
        };
      }
    } else {
      const newId = Date.now().toString();
      newContent.en.about.team.push({
        id: newId,
        name: teamNameEn,
        role: teamRoleEn,
        bio: teamBioEn,
        expertise: teamExpertiseEn,
        image: teamImage
      });
      newContent.hy.about.team.push({
        id: newId,
        name: teamNameHy,
        role: teamRoleHy,
        bio: teamBioHy,
        expertise: teamExpertiseHy,
        image: teamImage
      });
    }
    
    setTempContent(newContent);
    setContentData(newContent);
    setShowTeamModal(false);
    alert('Team member saved!');
  };

  const handleDeleteTeamMember = (id: string) => {
    if (!confirm('Delete this team member?')) return;
    const newContent = { ...tempContent };
    newContent.en.about.team = newContent.en.about.team.filter(m => m.id !== id);
    newContent.hy.about.team = newContent.hy.about.team.filter(m => m.id !== id);
    setTempContent(newContent);
    setContentData(newContent);
    alert('Team member deleted!');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Lock className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Admin Panel</CardTitle>
              <CardDescription className="mt-2">
                Sign in to manage your content
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasUsers ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Set up your first admin account.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="setup-username">Username</Label>
                  <Input
                    id="setup-username"
                    type="text"
                    value={setupUsername}
                    onChange={(e) => setSetupUsername(e.target.value)}
                    placeholder="admin"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup-email">Email</Label>
                  <Input
                    id="setup-email"
                    type="email"
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                    placeholder="admin@ppa.am"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup-password">Password</Label>
                  <Input
                    id="setup-password"
                    type="password"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup-confirm-password">Confirm Password</Label>
                  <Input
                    id="setup-confirm-password"
                    type="password"
                    value={setupConfirmPassword}
                    onChange={(e) => setSetupConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />
                </div>
                {setupError && <p className="text-sm text-destructive">{setupError}</p>}
                <Button onClick={handleInitializeAdmin} className="w-full" size="lg">
                  Create Admin Account
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter username"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />
                </div>
                {loginError && (
                  <p className="text-sm text-destructive">{loginError}</p>
                )}
                <Button onClick={handleLogin} className="w-full" size="lg">
                  Sign In
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Logo size="sm" showText />
              <Badge variant="outline">Admin Panel</Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex items-center gap-3 px-3 py-2 bg-muted rounded-lg">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-bold">
                    {currentUser?.username[0].toUpperCase()}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-medium">{currentUser?.username}</p>
                  <p className="text-xs text-muted-foreground capitalize">{currentUser?.role.replace('_', ' ')}</p>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Preview</span>
              </Button>

              <Button variant="outline" size="sm" onClick={handleOpenPasswordDialog}>
                <Lock className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Change Password</span>
              </Button>
              
              {hasPermission('edit_content') && (
                <>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setIsEditing(false);
                        setTempContent(content);
                      }}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => setIsEditing(true)}>
                      Edit Content
                    </Button>
                  )}
                </>
              )}

              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={switchAdminTab} className="space-y-6">
          <TabsList className="w-full h-auto p-1.5 bg-muted/50 rounded-lg flex flex-nowrap gap-1 overflow-x-auto justify-start">
            <TabsTrigger value="home" className="gap-2 shrink-0 min-w-[120px] justify-start">
              <FileText className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Home</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2 shrink-0 min-w-[120px] justify-start">
              <Megaphone className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Announcements</span>
            </TabsTrigger>
            <TabsTrigger value="contact-requests" className="gap-2 shrink-0 min-w-[140px] justify-start">
              <Mail className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Contact Requests</span>
            </TabsTrigger>
            {hasPermission('edit_courses') && (
              <TabsTrigger value="courses" className="gap-2 shrink-0 min-w-[120px] justify-start">
                <GraduationCap className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Courses</span>
              </TabsTrigger>
            )}
            {hasPermission('edit_faq') && (
              <TabsTrigger value="faq" className="gap-2 shrink-0 min-w-[120px] justify-start">
                <HelpCircle className="h-4 w-4" />
                <span className="text-xs sm:text-sm">FAQ</span>
              </TabsTrigger>
            )}
            {hasPermission('edit_content') && (
              <TabsTrigger value="pages" className="gap-2 shrink-0 min-w-[120px] justify-start">
                <Globe className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Pages</span>
                {hasUnsavedPageChanges && (
                  <span className="ml-1 inline-block h-2 w-2 rounded-full bg-destructive" aria-label="Unsaved changes" />
                )}
              </TabsTrigger>
            )}
            <TabsTrigger value="preview" className="gap-2 shrink-0 min-w-[120px] justify-start">
              <Eye className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Preview</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2 shrink-0 min-w-[120px] justify-start">
              <Download className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Export</span>
            </TabsTrigger>
            {hasPermission('all') && (
              <TabsTrigger value="users" className="gap-2 shrink-0 min-w-[120px] justify-start">
                <Users className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Users</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {currentUser?.username}! 👋</h2>
              <p className="text-muted-foreground">
                {hasPermission('all') 
                  ? 'Super Admin Dashboard - Full access to all features'
                  : 'Manage your content and monitor activity'
                }
              </p>
            </div>

            <QuickActions
              onActionClick={(action) => {
                switch (action) {
                  case 'new-announcement':
                    handleAddAnnouncement();
                    break;
                  case 'new-course':
                    handleAddCourse();
                    break;
                  case 'new-faq':
                    switchAdminTab('faq');
                    break;
                  case 'upload-image':
                    switchAdminTab('pages');
                    setPagesTab('home');
                    setPagesJumpTarget('home-hero-image');
                    break;
                  case 'contact-requests':
                    switchAdminTab('contact-requests');
                    break;
                  case 'preview-site':
                    handlePreview();
                    break;
                  case 'export-data':
                    switchAdminTab('export');
                    break;
                  case 'manage-users':
                    switchAdminTab('users');
                    break;
                }
              }}
            />

            {hasPermission('all') && (
              <ActivityTimeline activities={getActivityLog()} maxItems={10} />
            )}

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>All systems operational</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Website Status</span>
                    <Badge className="bg-green-500">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Backup</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Items</span>
                    <span className="text-sm font-semibold">
                      {(content.en.courses?.items.length || 0) +
                       (content.en.faq?.questions.length || 0) +
                       adminAnnouncementItems.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact-requests" className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Contact Requests</h2>
                <p className="text-muted-foreground">New submissions from the contact page</p>
              </div>
              <Badge variant="secondary">
                {filteredContactSubmissions.length} filtered / {contactSubmissions.length} total
              </Badge>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="contact-search">Search</Label>
                    <Input
                      id="contact-search"
                      value={contactSearchQuery}
                      onChange={(event) => setContactSearchQuery(event.target.value)}
                      placeholder="Name, email, phone, course, message..."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Status</Label>
                    <Select value={contactStatusFilter} onValueChange={(value) => setContactStatusFilter(value as ContactStatusFilter)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Sort</Label>
                    <Select value={contactSortOrder} onValueChange={(value) => setContactSortOrder(value as ContactSortOrder)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest first</SelectItem>
                        <SelectItem value="oldest">Oldest first</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {contactSubmissions.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <Mail className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="text-muted-foreground">No contact requests yet.</p>
                </CardContent>
              </Card>
            ) : filteredContactSubmissions.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <p className="text-muted-foreground">No requests match current filters.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredContactSubmissions.map((submission) => (
                  <button
                    key={submission.id}
                    type="button"
                    className="w-full rounded-lg border bg-card p-4 text-left transition-shadow hover:shadow-md"
                    onClick={() => setActiveContactSubmission(submission)}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {submission.firstName} {submission.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{submission.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(submission.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Badge variant={getContactStatusBadgeVariant(submission.status)}>
                          {getContactSubmissionStatusLabel(submission.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {submission.course || 'General inquiry'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="announcements" className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Announcements</h2>
                <p className="text-muted-foreground">Manage website announcements and news</p>
              </div>
              {hasPermission('add_announcements') && (
                <Button onClick={handleAddAnnouncement} className="w-full sm:w-auto">
                  <Megaphone className="h-4 w-4 mr-2" />
                  Add Announcement
                </Button>
              )}
            </div>

            {hasPermission('delete_announcements') && adminAnnouncementItems.length > 0 && (
              <BulkOperations
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onDeselectAll={() => setSelectedIds([])}
                onDelete={handleBulkDelete}
                onToggleVisibility={handleBulkToggleVisibility}
                onExport={handleBulkExport}
                totalItems={adminAnnouncementItems.length}
                itemType="announcements"
              />
            )}

            <div className="grid gap-4">
              {adminAnnouncementItems.map((announcement) => (
                <Card key={announcement.id} className={`hover:shadow-md transition-shadow ${announcement.pinned ? 'border-primary' : ''} ${announcement.isVisible === false ? 'opacity-50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {hasPermission('delete_announcements') && (
                          <BulkCheckbox
                            id={announcement.id}
                            checked={selectedIds.includes(announcement.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedIds([...selectedIds, announcement.id]);
                              } else {
                                setSelectedIds(selectedIds.filter(id => id !== announcement.id));
                              }
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{announcement.title}</h3>
                            <Badge>{announcement.category || 'news'}</Badge>
                            {announcement.pinned && <Badge variant="destructive" className="gap-1"><Pin className="h-3 w-3" /> Pinned</Badge>}
                            {announcement.isVisible === false && <Badge variant="secondary">Hidden</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{announcement.summary}</p>
                        </div>
                      </div>
                      {hasPermission('edit_announcements') && (
                        <div className="flex flex-wrap items-center gap-2 md:ml-4">
                          <Button 
                            variant={announcement.isVisible === false ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => handleToggleAnnouncementVisibility(announcement.id)}
                          >
                            {announcement.isVisible === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditAnnouncement(announcement)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {adminAnnouncementItems.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                    <p className="text-muted-foreground">No announcements yet. Click "Add Announcement" to create one.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {hasPermission('edit_courses') && (
            <TabsContent value="courses" className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Courses</h2>
                  <p className="text-muted-foreground">Manage course offerings</p>
                </div>
                <Button onClick={handleAddCourse} className="w-full sm:w-auto">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </div>

              <div className="grid gap-4">
                {content.en.courses.items.map((course) => (
                  <Card key={course.id} className={`hover:shadow-md transition-shadow ${course.isVisible === false ? 'opacity-50' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{course.title}</h3>
                            <Badge variant="outline" className="capitalize">{course.level || 'beginner'}</Badge>
                            {course.isVisible === false && <Badge variant="secondary">Hidden</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Duration: {course.duration || 'N/A'}</span>
                            <span>Price: {course.price || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 md:ml-4">
                          <Button 
                            variant={course.isVisible === false ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => handleToggleCourseVisibility(course.id)}
                          >
                            {course.isVisible === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditCourse(course)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {content.en.courses.items.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                      <p className="text-muted-foreground">No courses yet. Click "Add Course" to create one.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}

          {hasPermission('edit_faq') && (
            <TabsContent value="faq" className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">FAQ</h2>
                  <p className="text-muted-foreground">Manage frequently asked questions</p>
                </div>
                <Button onClick={handleAddFAQ} className="w-full sm:w-auto">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Add FAQ
                </Button>
              </div>

              <div className="grid gap-4">
                {content.en.faq.questions.map((faq) => (
                  <Card key={faq.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 md:ml-4">
                          <Button variant="outline" size="sm" onClick={() => handleEditFAQ(faq)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteFAQ(faq.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {content.en.faq.questions.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                      <p className="text-muted-foreground">No FAQ items yet. Click "Add FAQ" to create one.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}

          {hasPermission('edit_content') && (
            <TabsContent value="pages" className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">Pages Content</h2>
                    {hasUnsavedPageChanges && (
                      <Badge variant="destructive">Unsaved changes</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">Edit all website pages and sections</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="w-full sm:w-[280px]">
                    <Select value={pagesJumpTarget} onValueChange={jumpToPagesSection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Jump to section..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SECTION_JUMPS.map(item => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" onClick={handleLoadPages} className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Load Current
                  </Button>
                  <Button onClick={handleSavePages} className="w-full sm:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>

              <Tabs value={pagesTab} onValueChange={(value) => setPagesTab(value as PageEditorTab)} className="w-full">
                <TabsList className="w-full h-auto p-1.5 bg-muted/50 rounded-lg flex flex-nowrap gap-1 overflow-x-auto justify-start">
                  <TabsTrigger value="home" className="shrink-0 min-w-[120px]">Home</TabsTrigger>
                  <TabsTrigger value="about" className="shrink-0 min-w-[120px]">About</TabsTrigger>
                  <TabsTrigger value="contact" className="shrink-0 min-w-[120px]">Contact</TabsTrigger>
                  <TabsTrigger value="footer" className="shrink-0 min-w-[120px]">Footer</TabsTrigger>
                  <TabsTrigger value="courses" className="shrink-0 min-w-[120px]">Courses</TabsTrigger>
                  <TabsTrigger value="announcements" className="shrink-0 min-w-[120px]">Announcements</TabsTrigger>
                  <TabsTrigger value="faq-page" className="shrink-0 min-w-[120px]">FAQ</TabsTrigger>
                </TabsList>

                <TabsContent value="home" className="space-y-6 mt-6">
                  <div className="space-y-6">
                    <Card id="pages-home-hero">
                      <CardHeader>
                        <CardTitle>Hero Section</CardTitle>
                        <CardDescription>Main landing page hero content</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <MultilingualEditor
                          label="Title"
                          type="input"
                          enValue={heroTitleEn}
                          hyValue={heroTitleHy}
                          onEnChange={setHeroTitleEn}
                          onHyChange={setHeroTitleHy}
                          placeholder={{ en: 'Main hero title', hy: 'Գլխավոր վերնագիր' }}
                        />
                        <MultilingualEditor
                          label="Subtitle"
                          type="input"
                          enValue={heroSubtitleEn}
                          hyValue={heroSubtitleHy}
                          onEnChange={setHeroSubtitleEn}
                          onHyChange={setHeroSubtitleHy}
                          placeholder={{ en: 'Hero subtitle', hy: 'Ենթավերնագիր' }}
                        />
                        <MultilingualEditor
                          label="Description"
                          type="textarea"
                          enValue={heroDescEn}
                          hyValue={heroDescHy}
                          onEnChange={setHeroDescEn}
                          onHyChange={setHeroDescHy}
                          placeholder={{ en: 'Hero description', hy: 'Նկարագրություն' }}
                        />
                        <MultilingualEditor
                          label="Primary CTA Button"
                          type="input"
                          enValue={heroCtaPrimaryEn}
                          hyValue={heroCtaPrimaryHy}
                          onEnChange={setHeroCtaPrimaryEn}
                          onHyChange={setHeroCtaPrimaryHy}
                          placeholder={{ en: 'See Courses', hy: 'Դիտել դասընթացները' }}
                        />
                        <MultilingualEditor
                          label="Secondary CTA Button"
                          type="input"
                          enValue={heroCtaSecondaryEn}
                          hyValue={heroCtaSecondaryHy}
                          onEnChange={setHeroCtaSecondaryEn}
                          onHyChange={setHeroCtaSecondaryHy}
                          placeholder={{ en: 'Contact Us', hy: 'Կապվել մեզ հետ' }}
                        />
                        <MultilingualEditor
                          label="Students Trained Text"
                          type="input"
                          enValue={heroStudentsTrainedEn}
                          hyValue={heroStudentsTrainedHy}
                          onEnChange={setHeroStudentsTrainedEn}
                          onHyChange={setHeroStudentsTrainedHy}
                          placeholder={{ en: '150+ students trained', hy: '150+ ուսանող' }}
                        />
                      </CardContent>
                    </Card>

                    <Card id="pages-home-hero-image">
                      <CardHeader>
                        <CardTitle>Hero Image</CardTitle>
                        <CardDescription>Main hero section image</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {heroImage && (
                            <div className="relative w-full aspect-video border rounded-lg overflow-hidden">
                              <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setHeroImage('')}
                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-destructive/90"
                              >
                                ×
                              </button>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('hero-image-upload')?.click()}
                              className="flex-1"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {heroImage ? 'Change Image' : 'Upload Image'}
                            </Button>
                            <input
                              id="hero-image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  await processSelectedImage(file, setHeroImage);
                                }
                                e.currentTarget.value = '';
                              }}
                            />
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">Or paste URL</span>
                            </div>
                          </div>
                          <Input
                            value={heroImage.startsWith('data:') ? '' : heroImage}
                            onChange={(e) => setHeroImage(e.target.value)}
                            placeholder="https://example.com/hero-image.jpg"
                            disabled={heroImage.startsWith('data:')}
                          />
                          <p className="text-xs text-muted-foreground">
                            Upload an image file or paste an image URL
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card id="pages-home-features">
                      <CardHeader>
                        <CardTitle>Features Section</CardTitle>
                        <CardDescription>Features section title and description</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <MultilingualEditor
                          label="Section Title"
                          type="input"
                          enValue={featuresTitleEn}
                          hyValue={featuresTitleHy}
                          onEnChange={setFeaturesTitleEn}
                          onHyChange={setFeaturesTitleHy}
                          placeholder={{ en: 'What Makes Us Different', hy: 'Ինչով ենք տարբերվում' }}
                        />
                        <MultilingualEditor
                          label="Section Description"
                          type="textarea"
                          enValue={featuresDescEn}
                          hyValue={featuresDescHy}
                          onEnChange={setFeaturesDescEn}
                          onHyChange={setFeaturesDescHy}
                          placeholder={{ en: 'Features description...', hy: 'Հատկանիշների նկարագրություն...' }}
                        />
                      </CardContent>
                    </Card>

                    <Card id="pages-home-feature-cards">
                      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <CardTitle>Feature Cards</CardTitle>
                          <CardDescription>Manage feature cards shown in the Home features grid</CardDescription>
                        </div>
                        <Button type="button" onClick={handleAddFeatureItem} className="w-full sm:w-auto">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Feature
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {featureItemsEn.map((enItem, index) => {
                          const hyItem = featureItemsHy.find(item => item.id === enItem.id) || {
                            id: enItem.id,
                            title: '',
                            description: '',
                            icon: enItem.icon
                          };
                          return (
                            <div key={enItem.id} className="rounded-lg border p-4 space-y-4">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <p className="font-semibold text-sm">Feature #{index + 1}</p>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteFeatureItem(enItem.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </div>

                              <div>
                                <Label>Icon</Label>
                                <Select value={enItem.icon || 'Calculator'} onValueChange={(value) => handleFeatureIconChange(enItem.id, value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select icon" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {FEATURE_ICON_OPTIONS.map(icon => (
                                      <SelectItem key={icon} value={icon}>
                                        {icon}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <MultilingualEditor
                                label="Title"
                                type="input"
                                enValue={enItem.title}
                                hyValue={hyItem.title}
                                onEnChange={(value) => updateFeatureItemField('en', enItem.id, 'title', value)}
                                onHyChange={(value) => updateFeatureItemField('hy', enItem.id, 'title', value)}
                                placeholder={{ en: 'Feature title', hy: 'Feature title' }}
                              />
                              <MultilingualEditor
                                label="Description"
                                type="textarea"
                                enValue={enItem.description}
                                hyValue={hyItem.description}
                                onEnChange={(value) => updateFeatureItemField('en', enItem.id, 'description', value)}
                                onHyChange={(value) => updateFeatureItemField('hy', enItem.id, 'description', value)}
                                placeholder={{ en: 'Feature description', hy: 'Feature description' }}
                              />
                            </div>
                          );
                        })}
                        {featureItemsEn.length === 0 && (
                          <p className="text-sm text-muted-foreground">No feature cards yet. Click "Add Feature".</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card id="pages-home-features-cta">
                      <CardHeader>
                        <CardTitle>Features Call-to-Action</CardTitle>
                        <CardDescription>CTA block in features section</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <MultilingualEditor
                          label="CTA Title"
                          type="input"
                          enValue={featuresCtaTitleEn}
                          hyValue={featuresCtaTitleHy}
                          onEnChange={setFeaturesCtaTitleEn}
                          onHyChange={setFeaturesCtaTitleHy}
                          placeholder={{ en: 'Ready to Start Your Journey?', hy: 'Պատրա՞ստ եք սկսել' }}
                        />
                        <MultilingualEditor
                          label="CTA Description"
                          type="textarea"
                          enValue={featuresCtaDescEn}
                          hyValue={featuresCtaDescHy}
                          onEnChange={setFeaturesCtaDescEn}
                          onHyChange={setFeaturesCtaDescHy}
                          placeholder={{ en: 'Join our program...', hy: 'Միացեք մեր ծրագրին...' }}
                        />
                        <MultilingualEditor
                          label="Primary Button Label"
                          type="input"
                          enValue={featuresCtaPrimaryLabelEn}
                          hyValue={featuresCtaPrimaryLabelHy}
                          onEnChange={setFeaturesCtaPrimaryLabelEn}
                          onHyChange={setFeaturesCtaPrimaryLabelHy}
                          placeholder={{ en: 'See Course Details', hy: 'Տեսնել դասընթացները' }}
                        />
                        <MultilingualEditor
                          label="Secondary Button Label"
                          type="input"
                          enValue={featuresCtaSecondaryLabelEn}
                          hyValue={featuresCtaSecondaryLabelHy}
                          onEnChange={setFeaturesCtaSecondaryLabelEn}
                          onHyChange={setFeaturesCtaSecondaryLabelHy}
                          placeholder={{ en: 'Contact Us', hy: 'Կապվել մեզ հետ' }}
                        />
                      </CardContent>
                    </Card>

                    <Card id="pages-home-social">
                      <CardHeader>
                        <CardTitle>Social Media Links</CardTitle>
                        <CardDescription>Instagram, LinkedIn, Facebook</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                          <h4 className="font-semibold flex items-center gap-2">
                            Instagram
                          </h4>
                          <MultilingualEditor
                            label="Section Title"
                            type="input"
                            enValue={instagramTitleEn}
                            hyValue={instagramTitleHy}
                            onEnChange={setInstagramTitleEn}
                            onHyChange={setInstagramTitleHy}
                            placeholder={{ en: 'Follow Our Journey', hy: 'Հետևեք մեր ճամփորդությանը' }}
                          />
                          <MultilingualEditor
                            label="Subtitle"
                            type="input"
                            enValue={instagramSubtitleEn}
                            hyValue={instagramSubtitleHy}
                            onEnChange={setInstagramSubtitleEn}
                            onHyChange={setInstagramSubtitleHy}
                            placeholder={{ en: 'See student success stories', hy: 'Տեսեք ուսանողների հաջողությունները' }}
                          />
                          <MultilingualEditor
                            label="Handle"
                            type="input"
                            enValue={instagramHandleEn}
                            hyValue={instagramHandleHy}
                            onEnChange={setInstagramHandleEn}
                            onHyChange={setInstagramHandleHy}
                            placeholder={{ en: '@penandpaperaccounting', hy: '@penandpaperaccounting' }}
                          />
                          <MultilingualEditor
                            label="Badge Text"
                            type="input"
                            enValue={instagramBadgeEn}
                            hyValue={instagramBadgeHy}
                            onEnChange={setInstagramBadgeEn}
                            onHyChange={setInstagramBadgeHy}
                            placeholder={{ en: 'IG', hy: 'IG' }}
                          />
                          <MultilingualEditor
                            label="Description"
                            type="textarea"
                            enValue={instagramDescriptionEn}
                            hyValue={instagramDescriptionHy}
                            onEnChange={setInstagramDescriptionEn}
                            onHyChange={setInstagramDescriptionHy}
                            placeholder={{ en: 'Follow us on Instagram...', hy: 'Հետևեք մեզ Instagram-ում...' }}
                          />
                          <MultilingualEditor
                            label="Button Label"
                            type="input"
                            enValue={instagramButtonLabelEn}
                            hyValue={instagramButtonLabelHy}
                            onEnChange={setInstagramButtonLabelEn}
                            onHyChange={setInstagramButtonLabelHy}
                            placeholder={{ en: 'View Instagram Feed', hy: 'View Instagram Feed' }}
                          />
                          <div>
                            <Label>Instagram URL</Label>
                            <Input 
                              value={instagramUrl} 
                              onChange={(e) => setInstagramUrl(e.target.value)} 
                              placeholder="https://www.instagram.com/..."
                            />
                          </div>
                        </div>

                        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                          <h4 className="font-semibold flex items-center gap-2">
                            LinkedIn
                          </h4>
                          <MultilingualEditor
                            label="Badge Text"
                            type="input"
                            enValue={linkedinBadgeEn}
                            hyValue={linkedinBadgeHy}
                            onEnChange={setLinkedinBadgeEn}
                            onHyChange={setLinkedinBadgeHy}
                            placeholder={{ en: 'IN', hy: 'IN' }}
                          />
                          <MultilingualEditor
                            label="Handle"
                            type="input"
                            enValue={linkedinHandleEn}
                            hyValue={linkedinHandleHy}
                            onEnChange={setLinkedinHandleEn}
                            onHyChange={setLinkedinHandleHy}
                            placeholder={{ en: 'Pen & Paper Accounting', hy: 'Pen & Paper Accounting' }}
                          />
                          <MultilingualEditor
                            label="Description"
                            type="textarea"
                            enValue={linkedinDescriptionEn}
                            hyValue={linkedinDescriptionHy}
                            onEnChange={setLinkedinDescriptionEn}
                            onHyChange={setLinkedinDescriptionHy}
                            placeholder={{ en: 'Follow us on LinkedIn...', hy: 'Հետևեք մեզ LinkedIn-ում...' }}
                          />
                          <MultilingualEditor
                            label="Button Label"
                            type="input"
                            enValue={linkedinButtonLabelEn}
                            hyValue={linkedinButtonLabelHy}
                            onEnChange={setLinkedinButtonLabelEn}
                            onHyChange={setLinkedinButtonLabelHy}
                            placeholder={{ en: 'View LinkedIn Page', hy: 'View LinkedIn Page' }}
                          />
                          <div>
                            <Label>LinkedIn URL</Label>
                            <Input 
                              value={linkedinUrl} 
                              onChange={(e) => setLinkedinUrl(e.target.value)} 
                              placeholder="https://www.linkedin.com/..."
                            />
                          </div>
                        </div>

                        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                          <h4 className="font-semibold flex items-center gap-2">
                            Facebook
                          </h4>
                          <MultilingualEditor
                            label="Badge Text"
                            type="input"
                            enValue={facebookBadgeEn}
                            hyValue={facebookBadgeHy}
                            onEnChange={setFacebookBadgeEn}
                            onHyChange={setFacebookBadgeHy}
                            placeholder={{ en: 'FB', hy: 'FB' }}
                          />
                          <MultilingualEditor
                            label="Handle"
                            type="input"
                            enValue={facebookHandleEn}
                            hyValue={facebookHandleHy}
                            onEnChange={setFacebookHandleEn}
                            onHyChange={setFacebookHandleHy}
                            placeholder={{ en: 'PPA on Facebook', hy: 'PPA Facebook-ում' }}
                          />
                          <MultilingualEditor
                            label="Description"
                            type="textarea"
                            enValue={facebookDescriptionEn}
                            hyValue={facebookDescriptionHy}
                            onEnChange={setFacebookDescriptionEn}
                            onHyChange={setFacebookDescriptionHy}
                            placeholder={{ en: 'Follow us on Facebook...', hy: 'Հետևեք մեզ Facebook-ում...' }}
                          />
                          <MultilingualEditor
                            label="Button Label"
                            type="input"
                            enValue={facebookButtonLabelEn}
                            hyValue={facebookButtonLabelHy}
                            onEnChange={setFacebookButtonLabelEn}
                            onHyChange={setFacebookButtonLabelHy}
                            placeholder={{ en: 'View Facebook Page', hy: 'View Facebook Page' }}
                          />
                          <div>
                            <Label>Facebook URL</Label>
                            <Input 
                              value={facebookUrl} 
                              onChange={(e) => setFacebookUrl(e.target.value)} 
                              placeholder="https://www.facebook.com/..."
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="about" className="space-y-6 mt-6">
                  <Card id="pages-about-header">
                    <CardHeader>
                      <CardTitle>About Page Content</CardTitle>
                      <CardDescription>Main title and mission statement</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <MultilingualEditor
                        label="Page Title"
                        type="input"
                        enValue={aboutTitleEn}
                        hyValue={aboutTitleHy}
                        onEnChange={setAboutTitleEn}
                        onHyChange={setAboutTitleHy}
                        placeholder={{ en: 'About Us', hy: 'Մեր մասին' }}
                      />
                      <MultilingualEditor
                        label="Mission Statement (Short)"
                        type="textarea"
                        enValue={aboutMissionEn}
                        hyValue={aboutMissionHy}
                        onEnChange={setAboutMissionEn}
                        onHyChange={setAboutMissionHy}
                        placeholder={{ en: 'Our mission...', hy: 'Մեր առաքելությունը...' }}
                      />
                    </CardContent>
                  </Card>

                  <Card id="pages-about-mission">
                    <CardHeader>
                      <CardTitle>Mission Details</CardTitle>
                      <CardDescription>Detailed mission paragraphs and key points</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                        <h4 className="font-semibold">Mission Paragraphs</h4>
                        <MultilingualEditor
                          label="Paragraph 1"
                          type="textarea"
                          enValue={missionPara1En}
                          hyValue={missionPara1Hy}
                          onEnChange={setMissionPara1En}
                          onHyChange={setMissionPara1Hy}
                          placeholder={{ 
                            en: 'PPA was founded to bridge the gap...', 
                            hy: 'PPA-ն հիմնադրվել է...' 
                          }}
                        />
                        <MultilingualEditor
                          label="Paragraph 2"
                          type="textarea"
                          enValue={missionPara2En}
                          hyValue={missionPara2Hy}
                          onEnChange={setMissionPara2En}
                          onHyChange={setMissionPara2Hy}
                          placeholder={{ 
                            en: 'Our approach combines theoretical knowledge...', 
                            hy: 'Մեր մոտեցումը համատեղում է...' 
                          }}
                        />
                      </div>

                      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                        <h4 className="font-semibold">Key Mission Points</h4>
                        <MultilingualEditor
                          label="Point 1"
                          type="input"
                          enValue={missionPoint1En}
                          hyValue={missionPoint1Hy}
                          onEnChange={setMissionPoint1En}
                          onHyChange={setMissionPoint1Hy}
                          placeholder={{ 
                            en: 'Hands-on training with real US business data', 
                            hy: 'Գործնական ուսուցում...' 
                          }}
                        />
                        <MultilingualEditor
                          label="Point 2"
                          type="input"
                          enValue={missionPoint2En}
                          hyValue={missionPoint2Hy}
                          onEnChange={setMissionPoint2En}
                          onHyChange={setMissionPoint2Hy}
                          placeholder={{ 
                            en: 'Direct experience with industry-standard software', 
                            hy: 'Ուղղակի փորձ...' 
                          }}
                        />
                        <MultilingualEditor
                          label="Point 3"
                          type="input"
                          enValue={missionPoint3En}
                          hyValue={missionPoint3Hy}
                          onEnChange={setMissionPoint3En}
                          onHyChange={setMissionPoint3Hy}
                          placeholder={{ 
                            en: 'Freelance guidance and client communication skills', 
                            hy: 'Ֆրիլանս ուղեցույց...' 
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card id="pages-about-images">
                    <CardHeader>
                      <CardTitle>About Page Images</CardTitle>
                      <CardDescription>Upload images for About page sections</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label>Primary Image</Label>
                        <div className="space-y-3 mt-2">
                          {aboutImagePrimary && (
                            <div className="relative w-full aspect-video border rounded-lg overflow-hidden">
                              <img src={aboutImagePrimary} alt="Primary" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setAboutImagePrimary('')}
                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-destructive/90"
                              >
                                ×
                              </button>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('about-image-primary')?.click()}
                              className="flex-1"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {aboutImagePrimary ? 'Change Image' : 'Upload Image'}
                            </Button>
                            <input
                              id="about-image-primary"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  await processSelectedImage(file, setAboutImagePrimary);
                                }
                                e.currentTarget.value = '';
                              }}
                            />
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">Or paste URL</span>
                            </div>
                          </div>
                          <Input
                            value={aboutImagePrimary.startsWith('data:') ? '' : aboutImagePrimary}
                            onChange={(e) => setAboutImagePrimary(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            disabled={aboutImagePrimary.startsWith('data:')}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Secondary Image</Label>
                        <div className="space-y-3 mt-2">
                          {aboutImageSecondary && (
                            <div className="relative w-full aspect-video border rounded-lg overflow-hidden">
                              <img src={aboutImageSecondary} alt="Secondary" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setAboutImageSecondary('')}
                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-destructive/90"
                              >
                                ×
                              </button>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('about-image-secondary')?.click()}
                              className="flex-1"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {aboutImageSecondary ? 'Change Image' : 'Upload Image'}
                            </Button>
                            <input
                              id="about-image-secondary"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  await processSelectedImage(file, setAboutImageSecondary);
                                }
                                e.currentTarget.value = '';
                              }}
                            />
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">Or paste URL</span>
                            </div>
                          </div>
                          <Input
                            value={aboutImageSecondary.startsWith('data:') ? '' : aboutImageSecondary}
                            onChange={(e) => setAboutImageSecondary(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            disabled={aboutImageSecondary.startsWith('data:')}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card id="pages-about-team">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>Manage team members displayed on About page</CardDescription>
                      </div>
                      <Button onClick={handleAddTeamMember} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Team Member
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {content.en.about.team.map((member) => (
                          <div key={member.id} className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-semibold">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{member.bio}</p>
                              {member.expertise && member.expertise.length > 0 && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  {member.expertise.map((exp, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">{exp}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 md:ml-4">
                              <Button variant="outline" size="sm" onClick={() => handleEditTeamMember(member)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteTeamMember(member.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {content.en.about.team.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">No team members yet. Click "Add Team Member" to create one.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card id="pages-about-values">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle>Company Values</CardTitle>
                        <CardDescription>Core values displayed on About page</CardDescription>
                      </div>
                      <Button onClick={handleAddValue} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Value
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {content.en.about.values.map((value) => (
                          <div key={value.id} className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{value.icon === 'Star' ? '⭐' : value.icon === 'Target' ? '🎯' : value.icon === 'Heart' ? '❤️' : '✨'}</span>
                                <h4 className="font-semibold">{value.title}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{value.description}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 md:ml-4">
                              <Button variant="outline" size="sm" onClick={() => handleEditValue(value)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteValue(value.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {content.en.about.values.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">No values yet. Click "Add Value" to create one.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card id="pages-about-stats">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle>Company Statistics</CardTitle>
                        <CardDescription>Key numbers displayed on About page</CardDescription>
                      </div>
                      <Button onClick={handleAddStat} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Statistic
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(content.en.about.statsBoxes || []).map((stat) => (
                          <div key={stat.id} className="p-4 border rounded-lg">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex-1">
                                <div className="text-3xl font-bold text-primary mb-1">{stat.number}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                              </div>
                              <div className="flex items-center gap-1 sm:ml-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditStat(stat)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteStat(stat.id)}>
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!content.en.about.statsBoxes || content.en.about.statsBoxes.length === 0) && (
                          <div className="col-span-full text-center py-8 text-muted-foreground border rounded-lg">
                            <p>No statistics yet. Click "Add Statistic" to create one.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contact" className="space-y-6 mt-6">
                  <Card id="pages-contact-header">
                    <CardHeader>
                      <CardTitle>Contact Page Header</CardTitle>
                      <CardDescription>Main title and description shown at the top of the contact page</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <MultilingualEditor
                        label="Page Title"
                        type="input"
                        enValue={contactTitleEn}
                        hyValue={contactTitleHy}
                        onEnChange={setContactTitleEn}
                        onHyChange={setContactTitleHy}
                        placeholder={{ en: 'Contact Us', hy: 'Կապ' }}
                      />
                      <MultilingualEditor
                        label="Page Description"
                        type="textarea"
                        enValue={contactDescriptionEn}
                        hyValue={contactDescriptionHy}
                        onEnChange={setContactDescriptionEn}
                        onHyChange={setContactDescriptionHy}
                        placeholder={{ en: 'Get in touch with us...', hy: 'Կապվեք մեզ հետ...' }}
                      />
                    </CardContent>
                  </Card>

                  <Card id="pages-contact-info">
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                      <CardDescription>Contact details displayed across the website</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Email</Label>
                        <Input 
                          value={contactEmail} 
                          onChange={(e) => setContactEmail(e.target.value)} 
                          placeholder="info@ppa.am"
                          type="email"
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input 
                          value={contactPhone} 
                          onChange={(e) => setContactPhone(e.target.value)} 
                          placeholder="+374 33 52 70 70"
                          type="tel"
                        />
                      </div>
                      <MultilingualEditor
                        label="Address"
                        type="input"
                        enValue={contactAddressEn}
                        hyValue={contactAddressHy}
                        onEnChange={setContactAddressEn}
                        onHyChange={setContactAddressHy}
                        placeholder={{ en: 'Hakob Hakobyan St, Yerevan', hy: 'Հակոբ Հակոբյան, Երևան' }}
                      />
                      <div>
                        <Label>Instagram Handle</Label>
                        <Input 
                          value={contactInstagram} 
                          onChange={(e) => setContactInstagram(e.target.value)} 
                          placeholder="@penandpaperaccounting"
                          type="text"
                        />
                      </div>
                      
                      <div className="border-t pt-4 mt-4">
                        <Label className="text-lg font-semibold mb-4 block">Office Hours</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Monday</Label>
                            <Input value={officeMonday} onChange={(e) => setOfficeMonday(e.target.value)} placeholder="9:00 AM - 6:00 PM" />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Tuesday</Label>
                            <Input value={officeTuesday} onChange={(e) => setOfficeTuesday(e.target.value)} placeholder="9:00 AM - 6:00 PM" />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Wednesday</Label>
                            <Input value={officeWednesday} onChange={(e) => setOfficeWednesday(e.target.value)} placeholder="9:00 AM - 6:00 PM" />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Thursday</Label>
                            <Input value={officeThursday} onChange={(e) => setOfficeThursday(e.target.value)} placeholder="9:00 AM - 6:00 PM" />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Friday</Label>
                            <Input value={officeFriday} onChange={(e) => setOfficeFriday(e.target.value)} placeholder="9:00 AM - 6:00 PM" />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Saturday</Label>
                            <Input value={officeSaturday} onChange={(e) => setOfficeSaturday(e.target.value)} placeholder="Closed" />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Sunday</Label>
                            <Input value={officeSunday} onChange={(e) => setOfficeSunday(e.target.value)} placeholder="Closed" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card id="pages-contact-faq-teaser">
                    <CardHeader>
                      <CardTitle>FAQ Teaser Section</CardTitle>
                      <CardDescription>Call-to-action section at the bottom of the contact page linking to FAQ</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <MultilingualEditor
                        label="Section Title"
                        type="input"
                        enValue={faqTeaserTitleEn}
                        hyValue={faqTeaserTitleHy}
                        onEnChange={setFaqTeaserTitleEn}
                        onHyChange={setFaqTeaserTitleHy}
                        placeholder={{ en: 'Have Questions?', hy: 'Հարցեր ունե՞ք' }}
                      />
                      <MultilingualEditor
                        label="Description"
                        type="textarea"
                        enValue={faqTeaserDescEn}
                        hyValue={faqTeaserDescHy}
                        onEnChange={setFaqTeaserDescEn}
                        onHyChange={setFaqTeaserDescHy}
                        placeholder={{ en: 'Check out our frequently asked questions...', hy: 'Ստուգեք մեր հաճախ տրվող հարցերը...' }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="footer" className="space-y-6 mt-6">
                  <Card id="pages-footer-main">
                    <CardHeader>
                      <CardTitle>Footer Content</CardTitle>
                      <CardDescription>Footer tagline, description, and social links</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <MultilingualEditor
                        label="Tagline"
                        type="input"
                        enValue={footerTaglineEn}
                        hyValue={footerTaglineHy}
                        onEnChange={setFooterTaglineEn}
                        onHyChange={setFooterTaglineHy}
                        placeholder={{ en: 'American Accounting Training in Armenia', hy: 'Ամերիկյան հաշվապահություն Հայաստանում' }}
                      />
                      <MultilingualEditor
                        label="Description"
                        type="textarea"
                        enValue={footerDescEn}
                        hyValue={footerDescHy}
                        onEnChange={setFooterDescEn}
                        onHyChange={setFooterDescHy}
                        placeholder={{ en: 'Footer description', hy: 'Ֆութերի նկարագրություն' }}
                      />
                      
                      <div className="border-t pt-4 mt-4">
                        <Label className="text-lg font-semibold mb-4 block">Social Links</Label>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Instagram</Label>
                            <Input 
                              value={footerInstagram} 
                              onChange={(e) => setFooterInstagram(e.target.value)} 
                              placeholder="https://instagram.com/yourpage"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">LinkedIn</Label>
                            <Input 
                              value={footerLinkedin} 
                              onChange={(e) => setFooterLinkedin(e.target.value)} 
                              placeholder="https://linkedin.com/company/yourpage"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Facebook</Label>
                            <Input 
                              value={footerFacebook} 
                              onChange={(e) => setFooterFacebook(e.target.value)} 
                              placeholder="https://facebook.com/yourpage"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4 mt-4">
                        <Label className="text-lg font-semibold mb-4 block">Bottom Bar</Label>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Copyright</Label>
                            <Input 
                              value={footerCopyright} 
                              onChange={(e) => setFooterCopyright(e.target.value)} 
                              placeholder="© 2025 Pen & Paper Accounting. All rights reserved."
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Note</Label>
                            <Input 
                              value={footerNote} 
                              onChange={(e) => setFooterNote(e.target.value)} 
                              placeholder="This site is informational. No payments through site."
                            />
                          </div>
                          <MultilingualEditor
                            label="Privacy Label"
                            type="input"
                            enValue={footerPrivacyLabelEn}
                            hyValue={footerPrivacyLabelHy}
                            onEnChange={setFooterPrivacyLabelEn}
                            onHyChange={setFooterPrivacyLabelHy}
                            placeholder={{ en: 'Privacy Policy', hy: 'Գաղտնիության քաղաքականություն' }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card id="pages-footer-links">
                    <CardHeader>
                      <CardTitle>Footer Links - Company Section</CardTitle>
                      <CardDescription>
                        Manage company links in footer (Note: Courses section is auto-generated from visible courses)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm text-muted-foreground">
                            Company section links (About, FAQ, Contact, etc.)
                          </p>
                          <Button
                            onClick={() => {
                              setEditingFooterLink(null);
                              setFooterLinkLabelEn('');
                              setFooterLinkLabelHy('');
                              setFooterLinkHref('');
                              setShowFooterLinkModal(true);
                            }}
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Link
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {(() => {
                            const tempContent = { ...content };
                            const companySection = tempContent.en.footer.links.find(s => s.id === 'company');
                            if (!companySection || !companySection.links) return <p className="text-sm text-muted-foreground">No company links found.</p>;
                            
                            return companySection.links.map((link: any) => (
                              <div key={link.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{link.label}</p>
                                  <p className="text-xs text-muted-foreground">{link.href}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingFooterLink(link);
                                      const hySection = tempContent.hy.footer.links.find(s => s.id === 'company');
                                      const hyLink = hySection?.links.find(l => l.id === link.id);
                                      setFooterLinkLabelEn(link.label || '');
                                      setFooterLinkLabelHy(hyLink?.label || '');
                                      setFooterLinkHref(link.href || '');
                                      setShowFooterLinkModal(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm('Delete this footer link?')) {
                                        const newContent = { ...tempContent };
                                        const enSection = newContent.en.footer.links.find(s => s.id === 'company');
                                        const hySection = newContent.hy.footer.links.find(s => s.id === 'company');
                                        if (enSection) enSection.links = enSection.links.filter(l => l.id !== link.id);
                                        if (hySection) hySection.links = hySection.links.filter(l => l.id !== link.id);
                                        setContentData(newContent);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="courses" className="space-y-6 mt-6">
                  <Card id="pages-courses-settings">
                    <CardHeader>
                      <CardTitle>Courses Page Settings</CardTitle>
                      <CardDescription>Configure courses page display (Course content managed in Courses tab)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Course content is managed in the <strong>Courses</strong> tab.</p>
                        <p className="text-sm mt-2">This section is reserved for future course page settings.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="announcements" className="space-y-6 mt-6">
                  <Card id="pages-announcements-header">
                    <CardHeader>
                      <CardTitle>Announcements Page Header</CardTitle>
                      <CardDescription>Main title and description shown at the top of the announcements page</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <MultilingualEditor
                        label="Page Title"
                        type="input"
                        enValue={announcementsTitleEn}
                        hyValue={announcementsTitleHy}
                        onEnChange={setAnnouncementsTitleEn}
                        onHyChange={setAnnouncementsTitleHy}
                        placeholder={{ en: 'Announcements', hy: 'Հայտարարություններ' }}
                      />
                      <MultilingualEditor
                        label="Page Description"
                        type="textarea"
                        enValue={announcementsDescEn}
                        hyValue={announcementsDescHy}
                        onEnChange={setAnnouncementsDescEn}
                        onHyChange={setAnnouncementsDescHy}
                        placeholder={{ en: 'Stay updated with the latest news...', hy: 'Մնացեք տեղեկացված...' }}
                      />
                    </CardContent>
                  </Card>

                  <Card id="pages-announcements-empty">
                    <CardHeader>
                      <CardTitle>Empty State Messages</CardTitle>
                      <CardDescription>Messages shown when no announcements are available</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <MultilingualEditor
                        label="Empty State Title"
                        type="input"
                        enValue={announcementsEmptyTitleEn}
                        hyValue={announcementsEmptyTitleHy}
                        onEnChange={setAnnouncementsEmptyTitleEn}
                        onHyChange={setAnnouncementsEmptyTitleHy}
                        placeholder={{ en: 'No announcements yet', hy: 'Հայտարարություններ դեռ չկան' }}
                      />
                      <MultilingualEditor
                        label="Empty State Description"
                        type="textarea"
                        enValue={announcementsEmptyDescEn}
                        hyValue={announcementsEmptyDescHy}
                        onEnChange={setAnnouncementsEmptyDescEn}
                        onHyChange={setAnnouncementsEmptyDescHy}
                        placeholder={{ en: 'Check back soon for updates...', hy: 'Վերադարձեք շուտով...' }}
                      />
                    </CardContent>
                  </Card>

                  <Card id="pages-announcements-manage">
                    <CardHeader>
                      <CardTitle>Manage Content</CardTitle>
                      <CardDescription>Add, edit, or delete announcements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-6 text-muted-foreground border rounded-lg bg-muted/20">
                        <Bell className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Announcement content is managed in the <strong>Announcements</strong> tab.</p>
                        <p className="text-sm mt-1">Go to the main Announcements tab to add, edit, or delete announcements.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="faq-page" className="space-y-6 mt-6">
                  <Card id="pages-faq-settings">
                    <CardHeader>
                      <CardTitle>FAQ Page Settings</CardTitle>
                      <CardDescription>Configure FAQ page display (FAQ content managed in FAQ tab)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>FAQ content is managed in the <strong>FAQ</strong> tab.</p>
                        <p className="text-sm mt-2">This section is reserved for future FAQ page settings.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
          )}

          <TabsContent value="preview">
            <PreviewMode content={tempContent} />
          </TabsContent>

          <TabsContent value="export">
            <ExportImport
              getExportData={getBackupPayload}
              onImport={handleImportBackup}
              onCleanup={hasPermission('all') ? handleCleanupData : undefined}
            />
          </TabsContent>

          {hasPermission('all') && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {hasPermission('edit_content') && activeTab === 'pages' && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <div className="rounded-lg border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85 shadow-lg p-2">
            {hasUnsavedPageChanges && (
              <Badge variant="destructive" className="mb-2">
                Unsaved changes
              </Badge>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleLoadPages}>
                Load
              </Button>
              <Button className="flex-1" onClick={handleSavePages}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={showPasswordDialog}
        onOpenChange={(open) => {
          setShowPasswordDialog(open);
          if (!open) {
            resetPasswordDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Update your admin password.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password-change">Current Password</Label>
              <Input
                id="current-password-change"
                type="password"
                value={currentPasswordValue}
                onChange={(event) => setCurrentPasswordValue(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <Label htmlFor="new-password-change">New Password</Label>
              <Input
                id="new-password-change"
                type="password"
                value={newPasswordValue}
                onChange={(event) => setNewPasswordValue(event.target.value)}
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password-change">Confirm New Password</Label>
              <Input
                id="confirm-password-change"
                type="password"
                value={confirmNewPasswordValue}
                onChange={(event) => setConfirmNewPasswordValue(event.target.value)}
                autoComplete="new-password"
                placeholder="Re-enter new password"
              />
            </div>
            {passwordChangeError && <p className="text-sm text-destructive">{passwordChangeError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePasswordChange}>Save Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAnnouncementModal} onOpenChange={setShowAnnouncementModal}>
        <DialogContent className="w-[95vw] sm:w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}</DialogTitle>
            <DialogDescription>Create or update an announcement for your website</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 pt-1 space-y-5">
            <div className="bg-muted/50 p-4 rounded-lg">
              <Label>Language</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button 
                  type="button"
                  variant={annLanguage === 'both' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setAnnLanguage('both')}
                >
                  🇺🇸 & 🇦🇲 Both Languages
                </Button>
                <Button 
                  type="button"
                  variant={annLanguage === 'en' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setAnnLanguage('en')}
                >
                  🇺🇸 English Only
                </Button>
                <Button 
                  type="button"
                  variant={annLanguage === 'hy' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setAnnLanguage('hy')}
                >
                  🇦🇲 Հայերեն Only
                </Button>
              </div>
            </div>

            {annLanguage !== 'hy' && (
              <>
                <div className="space-y-2">
                  <Label className="block">Title (English)</Label>
                  <Input value={annTitleEn} onChange={(e) => setAnnTitleEn(e.target.value)} placeholder="Enter English title" />
                </div>
                <div className="space-y-2">
                  <Label className="block">Summary (English)</Label>
                  <Textarea value={annSummaryEn} onChange={(e) => setAnnSummaryEn(e.target.value)} placeholder="Enter English summary" rows={2} />
                </div>
                <div className="space-y-3">
                  <Label className="block">Body (English)</Label>
                  <RichTextEditor value={annContentEn} onChange={setAnnContentEn} height="200px" />
                </div>
              </>
            )}

            {annLanguage !== 'en' && (
              <>
                <div className="space-y-2">
                  <Label className="block">Վերնագիր (Հայերեն)</Label>
                  <Input value={annTitleHy} onChange={(e) => setAnnTitleHy(e.target.value)} placeholder="Մուտքագրեք հայերեն վերնագիր" />
                </div>
                <div className="space-y-2">
                  <Label className="block">Ամփոփում (Հայերեն)</Label>
                  <Textarea value={annSummaryHy} onChange={(e) => setAnnSummaryHy(e.target.value)} placeholder="Մուտքագրեք հայերեն ամփոփում" rows={2} />
                </div>
                <div className="space-y-3">
                  <Label className="block">Բովանդակություն (Հայերեն)</Label>
                  <RichTextEditor value={annContentHy} onChange={setAnnContentHy} height="200px" />
                </div>
              </>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="block">Categories (Select Multiple)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['news', 'courses', 'jobs', 'event', 'update'].map(cat => (
                    <label key={cat} className="flex items-center space-x-2 cursor-pointer border rounded-lg px-3 py-2 hover:bg-muted">
                      <input 
                        type="checkbox" 
                        checked={annCategories.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAnnCategories([...annCategories, cat]);
                          } else {
                            setAnnCategories(annCategories.filter(c => c !== cat));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm capitalize">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {annCategories.includes('courses') && (
                <div className="space-y-2">
                  <Label className="block">Related Course</Label>
                  <Select value={annRelatedCourseId || 'none'} onValueChange={(val) => setAnnRelatedCourseId(val === 'none' ? '' : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (No specific course)</SelectItem>
                      {content.en.courses.items.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Link this announcement to a specific course</p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="block">Cover Image</Label>
                <div className="space-y-3">
                  {annImage && (
                    <div className="relative w-full aspect-video border rounded-lg overflow-hidden">
                      <img src={annImage} alt="Announcement preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAnnImage('')}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-destructive/90"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('ann-image-upload')?.click()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {annImage ? 'Change Image' : 'Upload Image'}
                    </Button>
                    <input
                      id="ann-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          await processSelectedImage(file, setAnnImage);
                        }
                        e.currentTarget.value = '';
                      }}
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or paste URL</span>
                    </div>
                  </div>
                  
                  <Input 
                    value={annImage.startsWith('data:') ? '' : annImage} 
                    onChange={(e) => setAnnImage(e.target.value)} 
                    placeholder="https://example.com/image.jpg"
                    disabled={annImage.startsWith('data:')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload an image file or paste an image URL (optional)
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={annPinned} 
                    onChange={(e) => setAnnPinned(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Pin to top</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAnnouncementModal(false)}>Cancel</Button>
            <Button type="button" onClick={handleSaveAnnouncement}>
              {editingAnnouncement ? 'Save Changes' : 'Add Announcement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
        <DialogContent className="w-[95vw] sm:w-full max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
            <DialogDescription>Create or update a course offering with full details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto pr-2">
            <MultilingualEditor
              label="Title"
              type="input"
              enValue={courseTitleEn}
              hyValue={courseTitleHy}
              onEnChange={setCourseTitleEn}
              onHyChange={setCourseTitleHy}
              placeholder={{ en: 'Enter English title', hy: 'Մուտքագրեք հայերեն վերնագիր' }}
            />
            <MultilingualEditor
              label="Description (Full)"
              type="textarea"
              enValue={courseDescEn}
              hyValue={courseDescHy}
              onEnChange={setCourseDescEn}
              onHyChange={setCourseDescHy}
              placeholder={{ en: 'Enter English description', hy: 'Մուտքագրեք հայերեն նկարագրություն' }}
            />
            <MultilingualEditor
              label="Short Description"
              type="input"
              enValue={courseShortDescEn}
              hyValue={courseShortDescHy}
              onEnChange={setCourseShortDescEn}
              onHyChange={setCourseShortDescHy}
              placeholder={{ en: 'Brief summary', hy: 'Համառոտ նկարագրություն' }}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Level</Label>
                <Select value={courseLevel} onValueChange={setCourseLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duration</Label>
                <Input value={courseDuration} onChange={(e) => setCourseDuration(e.target.value)} placeholder="e.g. 8 weeks" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Format</Label>
                <Input value={courseFormat} onChange={(e) => setCourseFormat(e.target.value)} placeholder="e.g. Hybrid, Online, In-person" />
              </div>
              <div>
                <Label>Target Audience</Label>
                <Input value={courseTarget} onChange={(e) => setCourseTarget(e.target.value)} placeholder="e.g. Accountants, Beginners" />
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-lg font-semibold">Features</Label>
              <p className="text-sm text-muted-foreground mb-2">Enter one per line</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">English</Label>
                  <Textarea 
                    value={courseFeaturesEn.join('\n')} 
                    onChange={(e) => setCourseFeaturesEn(e.target.value.split('\n').filter(f => f.trim()))} 
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                    rows={4}
                  />
                </div>
                <div>
                  <Label className="text-xs">Հայերեն</Label>
                  <Textarea 
                    value={courseFeaturesHy.join('\n')} 
                    onChange={(e) => setCourseFeaturesHy(e.target.value.split('\n').filter(f => f.trim()))} 
                    placeholder="Հատկանիշ 1&#10;Հատկանիշ 2"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-lg font-semibold">Deliverables</Label>
              <p className="text-sm text-muted-foreground mb-2">What students will receive</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">English</Label>
                  <Textarea 
                    value={courseDeliverablesEn.join('\n')} 
                    onChange={(e) => setCourseDeliverablesEn(e.target.value.split('\n').filter(f => f.trim()))} 
                    placeholder="Certificate&#10;Portfolio"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-xs">Հայերեն</Label>
                  <Textarea 
                    value={courseDeliverablesHy.join('\n')} 
                    onChange={(e) => setCourseDeliverablesHy(e.target.value.split('\n').filter(f => f.trim()))} 
                    placeholder="Վկայական&#10;Պորտֆոլիո"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-lg font-semibold">Requirements</Label>
              <p className="text-sm text-muted-foreground mb-2">Prerequisites for enrollment</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">English</Label>
                  <Textarea 
                    value={courseRequirementsEn.join('\n')} 
                    onChange={(e) => setCourseRequirementsEn(e.target.value.split('\n').filter(f => f.trim()))} 
                    placeholder="Basic accounting knowledge&#10;Computer access"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-xs">Հայերեն</Label>
                  <Textarea 
                    value={courseRequirementsHy.join('\n')} 
                    onChange={(e) => setCourseRequirementsHy(e.target.value.split('\n').filter(f => f.trim()))} 
                    placeholder="Հաշվապահության հիմունքներ"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-lg font-semibold">Learning Outcomes</Label>
              <p className="text-sm text-muted-foreground mb-2">What students will be able to do</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">English</Label>
                  <Textarea 
                    value={courseOutcomesEn.join('\n')} 
                    onChange={(e) => setCourseOutcomesEn(e.target.value.split('\n').filter(f => f.trim()))} 
                    placeholder="Use QuickBooks&#10;Manage US books"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-xs">Հայերեն</Label>
                  <Textarea 
                    value={courseOutcomesHy.join('\n')} 
                    onChange={(e) => setCourseOutcomesHy(e.target.value.split('\n').filter(f => f.trim()))} 
                    placeholder="Օգտագործել QuickBooks"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCourseModal(false)}>Cancel</Button>
            <Button onClick={handleSaveCourse}>
              {editingCourse ? 'Save Changes' : 'Add Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFAQModal} onOpenChange={setShowFAQModal}>
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
            <DialogDescription>Create or update a frequently asked question</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <MultilingualEditor
              label="Question"
              type="input"
              enValue={faqQuestionEn}
              hyValue={faqQuestionHy}
              onEnChange={setFaqQuestionEn}
              onHyChange={setFaqQuestionHy}
              placeholder={{ en: 'Enter English question', hy: 'Մուտքագրեք հայերեն հարց' }}
            />
            <MultilingualEditor
              label="Answer"
              type="textarea"
              enValue={faqAnswerEn}
              hyValue={faqAnswerHy}
              onEnChange={setFaqAnswerEn}
              onHyChange={setFaqAnswerHy}
              placeholder={{ en: 'Enter English answer', hy: 'Մուտքագրեք հայերեն պատասխան' }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFAQModal(false)}>Cancel</Button>
            <Button onClick={handleSaveFAQ}>
              {editingFAQ ? 'Save Changes' : 'Add FAQ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          <Dialog open={showValueModal} onOpenChange={setShowValueModal}>
            <DialogContent className="w-[95vw] sm:w-full max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingValue ? 'Edit Value' : 'Add New Value'}</DialogTitle>
                <DialogDescription>Create or update a company value</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <MultilingualEditor
                  label="Title"
                  type="input"
                  enValue={valueTitleEn}
                  hyValue={valueTitleHy}
                  onEnChange={setValueTitleEn}
                  onHyChange={setValueTitleHy}
                  placeholder={{ en: 'Value title', hy: 'Արժեքի վերնագիր' }}
                />
                <MultilingualEditor
                  label="Description"
                  type="textarea"
                  enValue={valueDescEn}
                  hyValue={valueDescHy}
                  onEnChange={setValueDescEn}
                  onHyChange={setValueDescHy}
                  placeholder={{ en: 'Value description', hy: 'Արժեքի նկարագրություն' }}
                />
                
                <div>
                  <Label>Icon</Label>
                  <Select value={valueIcon} onValueChange={setValueIcon}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Star">⭐ Star</SelectItem>
                      <SelectItem value="Target">🎯 Target</SelectItem>
                      <SelectItem value="Heart">❤️ Heart</SelectItem>
                      <SelectItem value="Sparkle">✨ Sparkle</SelectItem>
                      <SelectItem value="Trophy">🏆 Trophy</SelectItem>
                      <SelectItem value="Rocket">🚀 Rocket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowValueModal(false)}>Cancel</Button>
                <Button onClick={handleSaveValue}>
                  {editingValue ? 'Save Changes' : 'Add Value'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showStatModal} onOpenChange={setShowStatModal}>
            <DialogContent className="w-[95vw] sm:w-full max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingStat ? 'Edit Statistic' : 'Add New Statistic'}</DialogTitle>
                <DialogDescription>Create or update a company statistic</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Number</Label>
                  <Input 
                    value={statNumber} 
                    onChange={(e) => setStatNumber(e.target.value)} 
                    placeholder="50+ or 90% or 5 Years"
                  />
                  <p className="text-xs text-muted-foreground mt-1">The main number/value (e.g., 50+, 90%, $1M)</p>
                </div>
                
                <MultilingualEditor
                  label="Label"
                  type="input"
                  enValue={statLabelEn}
                  hyValue={statLabelHy}
                  onEnChange={setStatLabelEn}
                  onHyChange={setStatLabelHy}
                  placeholder={{ en: 'Students Trained', hy: 'Ուսանողներ' }}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowStatModal(false)}>Cancel</Button>
                <Button onClick={handleSaveStat}>
                  {editingStat ? 'Save Changes' : 'Add Statistic'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showTeamModal} onOpenChange={setShowTeamModal}>
            <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{editingTeamMember ? 'Edit Team Member' : 'Add New Team Member'}</DialogTitle>
                <DialogDescription>Create or update a team member for About page</DialogDescription>
              </DialogHeader>
          <div className="space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto pr-2">
            <MultilingualEditor
              label="Name"
              type="input"
              enValue={teamNameEn}
              hyValue={teamNameHy}
              onEnChange={setTeamNameEn}
              onHyChange={setTeamNameHy}
              placeholder={{ en: 'Full name', hy: 'Անուն Ազգանուն' }}
            />
            <MultilingualEditor
              label="Role"
              type="input"
              enValue={teamRoleEn}
              hyValue={teamRoleHy}
              onEnChange={setTeamRoleEn}
              onHyChange={setTeamRoleHy}
              placeholder={{ en: 'Job title', hy: 'Պաշտոն' }}
            />
            <MultilingualEditor
              label="Bio"
              type="textarea"
              enValue={teamBioEn}
              hyValue={teamBioHy}
              onEnChange={setTeamBioEn}
              onHyChange={setTeamBioHy}
              placeholder={{ en: 'Short biography', hy: 'Կարճ կենսագրություն' }}
            />

            <div>
              <Label>Image</Label>
              <div className="space-y-3">
                {teamImage && (
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                    <img src={teamImage} alt="Team member preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setTeamImage('')}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-destructive/90"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('team-image-upload')?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {teamImage ? 'Change Image' : 'Upload Image'}
                  </Button>
                  <input
                    id="team-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        await processSelectedImage(file, setTeamImage);
                      }
                      e.currentTarget.value = '';
                    }}
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or paste URL</span>
                  </div>
                </div>
                
                <Input 
                  value={teamImage.startsWith('data:') ? '' : teamImage} 
                  onChange={(e) => setTeamImage(e.target.value)} 
                  placeholder="https://example.com/image.jpg"
                  disabled={teamImage.startsWith('data:')}
                />
                <p className="text-xs text-muted-foreground">
                  Upload an image file or paste an image URL
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <Label className="text-lg font-semibold">Expertise</Label>
              <p className="text-sm text-muted-foreground mb-2">Enter one per line</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">English</Label>
                  <Textarea 
                    value={teamExpertiseEn.join('\n')} 
                    onChange={(e) => setTeamExpertiseEn(e.target.value.split('\n').filter(f => f.trim()))} 
                    placeholder="QuickBooks&#10;US Tax"
                    rows={4}
                  />
                </div>
                <div>
                  <Label className="text-xs">Հայերեն</Label>
                  <Textarea 
                    value={teamExpertiseHy.join('\n')} 
                    onChange={(e) => setTeamExpertiseHy(e.target.value.split('\n').filter(f => f.trim()))} 
                    placeholder="QuickBooks&#10;ԱՄՆ հարկեր"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTeamModal(false)}>Cancel</Button>
            <Button onClick={handleSaveTeamMember}>
              {editingTeamMember ? 'Save Changes' : 'Add Team Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFooterLinkModal} onOpenChange={setShowFooterLinkModal}>
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingFooterLink ? 'Edit Footer Link' : 'Add New Footer Link'}</DialogTitle>
            <DialogDescription>Add or edit a link in the footer Company section</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <MultilingualEditor
              label="Link Label"
              type="input"
              enValue={footerLinkLabelEn}
              hyValue={footerLinkLabelHy}
              onEnChange={setFooterLinkLabelEn}
              onHyChange={setFooterLinkLabelHy}
              placeholder={{ en: 'About', hy: 'Մեր մասին' }}
            />
            <div>
              <Label>Link URL (Path)</Label>
              <Input 
                value={footerLinkHref} 
                onChange={(e) => setFooterLinkHref(e.target.value)} 
                placeholder="/about or /faq or /contact"
              />
              <p className="text-xs text-muted-foreground mt-1">Use relative path (e.g., /about)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFooterLinkModal(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!footerLinkLabelEn || !footerLinkHref) {
                alert('Please fill in all required fields');
                return;
              }

              const newContent = { ...content };
              const enSection = newContent.en.footer.links.find(s => s.id === 'company');
              const hySection = newContent.hy.footer.links.find(s => s.id === 'company');

              if (!enSection || !hySection) {
                alert('Company section not found in footer');
                return;
              }

              if (editingFooterLink) {
                const enLink = enSection.links.find(l => l.id === editingFooterLink.id);
                const hyLink = hySection.links.find(l => l.id === editingFooterLink.id);
                if (enLink) {
                  enLink.label = footerLinkLabelEn;
                  enLink.href = footerLinkHref;
                }
                if (hyLink) {
                  hyLink.label = footerLinkLabelHy;
                  hyLink.href = footerLinkHref;
                }
              } else {
                const newId = `link-${Date.now()}`;
                enSection.links.push({
                  id: newId,
                  label: footerLinkLabelEn,
                  href: footerLinkHref
                });
                hySection.links.push({
                  id: newId,
                  label: footerLinkLabelHy,
                  href: footerLinkHref
                });
              }

              setContentData(newContent);
              setShowFooterLinkModal(false);
              setEditingFooterLink(null);
              setFooterLinkLabelEn('');
              setFooterLinkLabelHy('');
              setFooterLinkHref('');
            }}>
              {editingFooterLink ? 'Save Changes' : 'Add Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(activeContactSubmission)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveContactSubmission(null);
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Request Details</DialogTitle>
            <DialogDescription>
              Review the request and update follow-up status.
            </DialogDescription>
          </DialogHeader>

          {activeContactSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <p className="font-medium">
                    {activeContactSubmission.firstName} {activeContactSubmission.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium break-all">{activeContactSubmission.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="font-medium">{activeContactSubmission.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Interested Course</Label>
                  <p className="font-medium">{activeContactSubmission.course || 'General inquiry'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Preferred Start Date</Label>
                  <p className="font-medium">{activeContactSubmission.startDate || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Submitted At</Label>
                  <p className="font-medium">
                    {new Date(activeContactSubmission.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Message</Label>
                <p className="rounded-md border bg-muted/40 p-3 text-sm whitespace-pre-wrap">
                  {activeContactSubmission.message || 'No message provided.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={activeContactSubmission.status}
                    onValueChange={(value) =>
                      handleContactStatusChange(activeContactSubmission.id, value as ContactSubmissionStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Last Status Update</Label>
                  <p className="font-medium mt-2">
                    {new Date(activeContactSubmission.statusUpdatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveContactSubmission(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAdvanced;

