import { LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/lib/site-config";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The terms that govern access to and use of Signal Hunter."
    >
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Use of service</h2>
        <p>
          Signal Hunter provides software tools for discovering public buyer-intent signals. You
          agree to use the service lawfully and not misuse, resell, reverse engineer, or disrupt
          the platform.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Accounts</h2>
        <p>
          You are responsible for maintaining the security of your account and for all activities
          performed through it. We may suspend or terminate access for abuse, fraud, or violation
          of these terms.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Subscriptions</h2>
        <p>
          Paid plans are billed on a recurring basis unless cancelled. Features and search limits
          vary by plan. We may update pricing or plan structure with reasonable notice.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">No guarantee of outcomes</h2>
        <p>
          Signal Hunter helps identify opportunities, but we do not guarantee revenue, clients,
          conversions, or business outcomes from use of the platform.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Contact</h2>
        <p>
          Questions about these terms can be sent to {siteConfig.supportEmail}. Business address:
          {" "}{siteConfig.companyAddress}.
        </p>
      </section>
    </LegalPage>
  );
}
