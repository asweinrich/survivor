export const metadata = {
  title: 'Terms & Conditions | Survivor Fantasy',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-stone-900 text-white px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-lostIsland uppercase tracking-wider text-3xl md:text-4xl mb-2 text-center">
          Terms &amp; Conditions
        </h1>
        <p className="text-center text-stone-400 text-sm mb-10 font-inter">
          Last updated: September 22, 2026
        </p>

        <div className="space-y-6 font-inter text-stone-200 leading-relaxed">
          <p>
            These Terms &amp; Conditions (&quot;Terms&quot;) govern your use
            of Survivor Fantasy (the &quot;Service&quot;). By participating
            in the Service, you agree to these Terms.
          </p>

          <section>
            <h2 className="font-lostIsland uppercase tracking-wider text-xl mb-2">
              General Use
            </h2>
            <p>
              Survivor Fantasy is a private fantasy league application for
              tracking tribe drafts, pick&apos;em predictions, and league
              standings among invited participants. The Service is provided
              for entertainment purposes only.
            </p>
          </section>

          <section className="border border-stone-700 rounded-lg p-4 bg-stone-800/50">
            <h2 className="font-lostIsland uppercase tracking-wider text-xl mb-3">
              SMS Terms
            </h2>
            <p className="mb-3">
              By providing your phone number and opting in, you consent to
              receive SMS text messages from Survivor Fantasy, including
              one-time verification codes, tribe draft confirmations,
              weekly pick&apos;em reminders, and payment-related messages.
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-300">
              <li>Message frequency varies based on league activity.</li>
              <li className="font-semibold text-white">
                Message and data rates may apply.
              </li>
              <li>You may reply STOP at any time to opt out of future messages.</li>
              <li>You may reply HELP for assistance.</li>
              <li>
                Consent to receive SMS messages is not a condition of
                purchase or participation in the Service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-lostIsland uppercase tracking-wider text-xl mb-2">
              Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. Continued use of
              the Service after changes are posted constitutes acceptance
              of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="font-lostIsland uppercase tracking-wider text-xl mb-2">
              Contact
            </h2>
            <p>
              If you have questions about these Terms, contact me{' '}
              <a
                href="mailto:asweinrich@gmail.com"
                className="text-orange-400 hover:text-orange-300 underline"
              >
                here
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}