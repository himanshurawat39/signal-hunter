import { LegalPage } from "@/components/legal-page";

export default function ShippingDeliveryPage() {
  return (
    <LegalPage
      title="Shipping and Delivery"
      description="How access is delivered for this digital SaaS product."
    >
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Digital service only</h2>
        <p>
          Signal Hunter is a software service. No physical goods are shipped. Access is delivered
          digitally through your account after sign-in and, for paid plans, after payment
          confirmation from the payment provider.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Delivery timing</h2>
        <p>
          Free access is available immediately after authentication. Paid plan upgrades are usually
          reflected shortly after successful payment and webhook confirmation.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Delays</h2>
        <p>
          If your plan does not update after payment, contact support with your account email and
          payment reference so we can verify the billing event and resolve the issue.
        </p>
      </section>
    </LegalPage>
  );
}
