import { LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/lib/site-config";

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact"
      description="How to reach Signal Hunter for support, billing, or compliance questions."
    >
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Support</h2>
        <p>Email: {siteConfig.supportEmail}</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Business details</h2>
        <p>Company: {siteConfig.companyName}</p>
        <p>Address: {siteConfig.companyAddress}</p>
        <p>Website: {siteConfig.websiteUrl}</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Response times</h2>
        <p>
          We aim to respond to product, billing, and compliance queries within a reasonable business
          timeframe.
        </p>
      </section>
    </LegalPage>
  );
}
