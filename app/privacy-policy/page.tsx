import { LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/lib/site-config";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How Signal Hunter collects, uses, and protects account and product-usage information."
    >
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Information we collect</h2>
        <p>
          We collect account information such as your email address and authentication details
          through Supabase Auth. We also store product usage data such as searches performed,
          plan status, and billing-related identifiers needed to operate the service.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">How we use your information</h2>
        <p>
          We use your information to provide the service, authenticate your account, enforce
          plan limits, process subscriptions, improve product quality, and communicate support
          or billing updates.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Payments and third parties</h2>
        <p>
          Payment processing is handled by third-party payment providers such as Razorpay. We do
          not store full card details on our servers. Authentication and user data are handled
          using Supabase and selected infrastructure providers.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Data security</h2>
        <p>
          We use reasonable technical and operational safeguards to protect user data. No method
          of transmission or storage is completely secure, so we cannot guarantee absolute
          security.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Contact</h2>
        <p>
          For privacy-related questions, contact {siteConfig.companyName} at {siteConfig.supportEmail}.
        </p>
      </section>
    </LegalPage>
  );
}
