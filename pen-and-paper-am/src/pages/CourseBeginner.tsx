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
  Phone,
  GraduationCap
} from "lucide-react";

const CourseBeginner = () => {
  const syllabus = [
    {
      stage: 1,
      title: "Accounting Fundamentals + Zoho Books",
      duration: "5 weeks",
      description: "Start from the basics and learn to apply theory using Zoho Books",
      topics: [
        "Accounting principles and concepts (debits/credits)",
        "Chart of accounts and account classification",
        "Financial statements (P&L, Balance Sheet, Cash Flow)",
        "Zoho Books setup and navigation",
        "Basic transactions and journal entries",
        "Introduction to US accounting standards"
      ],
      deliverables: [
        "Complete accounting cycle practice",
        "Zoho Books company setup",
        "Basic financial statement preparation"
      ]
    },
    {
      stage: 2,
      title: "QuickBooks Online Introduction",
      duration: "4 weeks", 
      description: "Learn the industry standard with guided practice",
      topics: [
        "QBO interface and navigation",
        "Company setup and configuration",
        "Customer and vendor management",
        "Invoicing and payment processing",
        "Basic reporting and dashboards",
        "Bank reconciliation fundamentals"
      ],
      deliverables: [
        "QBO company setup from scratch",
        "Complete invoicing workflow",
        "Basic reconciliation practice"
      ]
    },
    {
      stage: 3,
      title: "Practical Application Stage",
      duration: "5 weeks",
      description: "Apply your knowledge with real-world US business scenarios",
      topics: [
        "Month-end closing procedures",
        "Financial statement analysis",
        "Error detection and correction",
        "Client communication basics",
        "File organization and documentation",
        "Quality control and review processes"
      ],
      deliverables: [
        "Complete month-end close for sample business",
        "Financial analysis report",
        "Client presentation practice"
      ]
    },
    {
      stage: 4,
      title: "Career Development & Freelance Guide",
      duration: "2 weeks",
      description: "Learn how to find and manage remote accounting work",
      topics: [
        "Resume and portfolio development",
        "Upwork and Fiverr profile creation",
        "Service pricing and proposal writing",
        "Client onboarding and management",
        "Time management and productivity",
        "Building long-term client relationships"
      ],
      deliverables: [
        "Professional resume and portfolio",
        "Freelance platform profiles",
        "Service packages and pricing"
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
      title: "Job Placement Support",
      description: "6 months of mentorship and job search assistance"
    }
  ];

  const requirements = [
    "No prior accounting experience required",
    "Basic computer skills",
    "Willingness to learn and practice",
    "Access to computer with internet connection",
    "Commitment to 16-week program"
  ];

  const outcomes = [
    "Master accounting fundamentals and principles",
    "Use both Zoho Books and QuickBooks Online confidently",
    "Handle real US business accounting tasks",
    "Build a professional portfolio",
    "Start your freelance accounting career"
  ];

  const learningPath = [
    {
      week: "Weeks 1-5",
      title: "Foundation Building",
      description: "Learn accounting basics and get comfortable with Zoho Books"
    },
    {
      week: "Weeks 6-9", 
      title: "Software Mastery",
      description: "Master QuickBooks Online with guided practice"
    },
    {
      week: "Weeks 10-14",
      title: "Real-World Practice",
      description: "Apply skills with actual US business scenarios"
    },
    {
      week: "Weeks 15-16",
      title: "Career Launch",
      description: "Build your freelance practice and find clients"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-12 lg:py-20 bg-gradient-accent text-accent-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 text-accent-foreground bg-accent-foreground/20">
              Beginner Track
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Beginner American Accounting
            </h1>
            <p className="text-xl opacity-90 leading-relaxed mb-8">
              Start from the basics and progress to US accounting tools. Perfect for complete 
              beginners who want to build a career in accounting with a focus on the US market.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>16 weeks</span>
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
                <GraduationCap className="h-4 w-4" />
                <span>No experience required</span>
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
              <h2 className="text-3xl font-bold mb-6">Perfect for Complete Beginners</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                This comprehensive program starts with accounting fundamentals and gradually 
                builds your skills to work with US clients. No prior experience needed - 
                we'll teach you everything from the ground up.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                By the end of the course, you'll be ready to start freelancing and earning 
                with US clients, even if you've never worked in accounting before.
              </p>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">What You'll Achieve:</h3>
                <ul className="space-y-3">
                  {outcomes.map((outcome, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <Card className="bg-gradient-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-2xl">Ready to Start Your Journey?</CardTitle>
                <CardDescription className="text-primary-foreground/90">
                  Join our next beginner cohort and build your accounting career
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
                    <span className="font-semibold">Max 15 students</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Format:</span>
                    <span className="font-semibold">Weekend sessions</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                  <Link to="/contact">Ask About Next Cohort</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Your Learning Journey</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A structured 16-week path from complete beginner to freelance-ready accountant
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningPath.map((phase, index) => (
              <Card key={index} className="text-center group hover:shadow-elegant transition-all duration-300">
                <CardHeader>
                  <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                    <span className="text-2xl font-bold">{index + 1}</span>
                  </div>
                  <Badge variant="outline" className="mb-2">{phase.week}</Badge>
                  <CardTitle className="text-lg">{phase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{phase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Syllabus */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Course Syllabus</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four comprehensive stages designed to take you from complete beginner to 
              confident freelance accountant.
            </p>
          </div>
          
          <div className="space-y-8">
            {syllabus.map((stage, index) => (
              <Card key={index} className="group hover:shadow-elegant transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-accent">
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
                        <Target className="h-4 w-4 mr-2 text-accent" />
                        Topics Covered:
                      </h4>
                      <ul className="space-y-2">
                        {stage.topics.map((topic, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-primary" />
                        Key Deliverables:
                      </h4>
                      <ul className="space-y-2">
                        {stage.deliverables.map((deliverable, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm">
                            <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
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
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Requirements</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                This beginner track is designed for anyone interested in accounting. 
                Here's what you need to get started:
              </p>
              <ul className="space-y-4">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
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
                    <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center text-accent flex-shrink-0">
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
      <section className="py-16 bg-gradient-accent text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Accounting Career?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            No experience needed - we'll teach you everything from the ground up. 
            Join our next beginner cohort and start building your future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent" asChild>
              <Link to="/contact">Ask About Next Cohort</Link>
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-accent-foreground/20 text-accent-foreground hover:bg-accent-foreground hover:text-accent"
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

export default CourseBeginner;
