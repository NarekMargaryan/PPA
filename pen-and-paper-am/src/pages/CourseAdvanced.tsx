import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Clock, 
  Users, 
  Award, 
  BookOpen, 
  CheckCircle,
  ArrowRight,
  Globe,
  Briefcase,
  Target,
  Zap,
  Mail,
  Phone
} from "lucide-react";

const CourseAdvanced = () => {
  const syllabus = [
    {
      stage: 1,
      title: "Zoho Books Mastery",
      duration: "4 weeks",
      description: "Deep dive into Zoho Books with US-oriented workflows and best practices",
      topics: [
        "Company setup and chart of accounts configuration",
        "Invoicing and payment processing workflows",
        "Expense management and categorization",
        "Bank reconciliation and cash flow management",
        "US tax compliance and transaction norms",
        "Advanced reporting and analytics"
      ],
      deliverables: [
        "Complete Zoho Books setup for sample US business",
        "Monthly reconciliation practice",
        "Custom report creation"
      ]
    },
    {
      stage: 2,
      title: "QuickBooks Online (QBO) Expertise",
      duration: "4 weeks", 
      description: "Master the industry-leading US accounting platform",
      topics: [
        "QBO company setup and configuration",
        "Recurring transactions and automation",
        "Payroll basics and employee management",
        "Third-party integrations and apps",
        "Advanced reporting and dashboards",
        "Multi-currency and international transactions"
      ],
      deliverables: [
        "QBO certification preparation",
        "Integration setup with banking systems",
        "Custom dashboard creation"
      ]
    },
    {
      stage: 3,
      title: "Practical Application Stage",
      duration: "4 weeks",
      description: "Real-world practice with US business datasets and scenarios",
      topics: [
        "Month-end close procedures",
        "Financial statement preparation",
        "Tax preparation support",
        "Client communication and reporting",
        "Error detection and correction",
        "Workflow optimization"
      ],
      deliverables: [
        "Complete month-end close for 3 different business types",
        "Financial statement package creation",
        "Client presentation skills"
      ]
    },
    {
      stage: 4,
      title: "Freelance Business Development",
      duration: "2 weeks",
      description: "Build your freelance career and client base",
      topics: [
        "Upwork and Fiverr profile optimization",
        "Service pricing and proposal writing",
        "Client onboarding and management",
        "Contract negotiation and legal considerations",
        "Marketing and business development",
        "Long-term client relationship building"
      ],
      deliverables: [
        "Professional freelance profiles",
        "Service packages and pricing strategy",
        "Client proposal templates"
      ]
    }
  ];

  const bonusFeatures = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "2-Day English Class",
      description: "Accounting vocabulary and client communication skills"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Certificate of Completion",
      description: "Official certification for your professional portfolio"
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Portfolio Development",
      description: "Build a showcase of your work with real project examples"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Ongoing Support",
      description: "6 months of mentorship and job placement assistance"
    }
  ];

  const requirements = [
    "2+ years of accounting experience",
    "Basic understanding of financial statements",
    "Intermediate English proficiency",
    "Access to computer with internet connection",
    "Commitment to 14-week program"
  ];

  const outcomes = [
    "Master both Zoho Books and QuickBooks Online",
    "Handle real US business accounting workflows",
    "Build a successful freelance practice",
    "Communicate effectively with US clients",
    "Earn 3-5x more than local accounting rates"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-12 lg:py-20 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="accent" className="mb-4 text-primary">
              Advanced Track
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Advanced American Accounting
            </h1>
            <p className="text-xl opacity-90 leading-relaxed mb-8">
              For professional accountants who want to work with US businesses and clients. 
              Master industry-standard software and build a successful freelance practice.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>14 weeks</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Small class sizes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>In-person or online</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>Certification included</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Course Overview</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                This intensive program is designed for working accountants who want to expand 
                their skills to serve US clients. You'll master both Zoho Books and QuickBooks 
                Online while building practical experience with real US business scenarios.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                The course combines technical training with business development skills, 
                preparing you to start or grow a freelance practice serving US clients.
              </p>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">What You'll Achieve:</h3>
                <ul className="space-y-3">
                  {outcomes.map((outcome, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <Card className="bg-gradient-accent text-accent-foreground">
              <CardHeader>
                <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
                <CardDescription className="text-accent-foreground/90">
                  Join our next cohort and start building your US client base
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Next Start Date:</span>
                    <span className="font-semibold">March 15, 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Class Size:</span>
                    <span className="font-semibold">Max 12 students</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Format:</span>
                    <span className="font-semibold">Weekend sessions</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent" asChild>
                  <Link to="/contact">Request Syllabus & Schedule</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Syllabus */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Course Syllabus</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four comprehensive stages designed to take you from Zoho Books basics to 
              running a successful freelance accounting practice.
            </p>
          </div>
          
          <div className="space-y-8">
            {syllabus.map((stage, index) => (
              <Card key={index} className="group hover:shadow-elegant transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-primary">
                      Stage {stage.stage}
                    </Badge>
                    <Badge variant="secondary">
                      {stage.duration}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{stage.title}</CardTitle>
                  <CardDescription className="text-lg">
                    {stage.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Target className="h-4 w-4 mr-2 text-primary" />
                        Topics Covered:
                      </h4>
                      <ul className="space-y-2">
                        {stage.topics.map((topic, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-accent" />
                        Key Deliverables:
                      </h4>
                      <ul className="space-y-2">
                        {stage.deliverables.map((deliverable, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm">
                            <ArrowRight className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                            <span>{deliverable}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Requirements</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                This advanced track is designed for working professionals. Here's what you need to succeed:
              </p>
              <ul className="space-y-4">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-6">Bonus Features</h2>
              <div className="space-y-6">
                {bonusFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Advance Your Career?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join our next cohort and start building your US client base. Limited seats available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="lg" asChild>
              <Link to="/contact">Request Syllabus & Schedule Call</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary-foreground bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link to="/faq">View FAQ</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CourseAdvanced;
