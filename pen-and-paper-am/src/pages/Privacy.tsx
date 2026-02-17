import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy"
        description="Privacy policy for Pen & Paper Accounting website."
        url="/privacy"
      />
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <article className="prose max-w-3xl">
          <h1>Privacy Policy</h1>
          <p>Last updated: February 16, 2026</p>
          <p>
            This website is informational. We may store non-sensitive website preferences in your
            browser, including language and content settings for the admin interface.
          </p>
          <h2>Analytics</h2>
          <p>
            Google Analytics is loaded only after your explicit consent. You can decline analytics
            at any time by clearing browser storage for this site.
          </p>
          <h2>Admin Data</h2>
          <p>
            Admin and content data are stored in browser localStorage in the current version of
            this project. Data is not shared across devices or browsers.
          </p>
          <h2>Contact</h2>
          <p>
            For privacy-related questions, contact us via the details on the Contact page.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
