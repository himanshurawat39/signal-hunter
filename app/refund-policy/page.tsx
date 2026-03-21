import { LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/lib/site-config";

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund and Cancellation Policy"
      description="How cancellations, refunds, and billing disputes are handled for Signal Hunter subscriptions."
    >
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Subscription cancellation</h2>
        <p>
          You may cancel your subscription before the next billing cycle to avoid future recurring
          charges. Access to paid plan benefits remains available until the end of the already paid
          billing period unless otherwise stated.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Refunds</h2>
        <p>
          Subscription fees are generally non-refundable once billed because the service provides
          immediate access to software and usage allowances. If you believe you were charged in
          error, contact support and we will review the request in good faith.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Duplicate or accidental charges</h2>
        <p>
          If you encounter a duplicate or accidental charge, contact {siteConfig.supportEmail} with
          the payment reference and account email so we can investigate promptly.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Chargebacks</h2>
        <p>
          Before initiating a chargeback, please contact us so we have a fair opportunity to resolve
          the issue. Fraudulent or abusive chargebacks may result in suspension of service.
        </p>
      </section>
    </LegalPage>
  );
}
