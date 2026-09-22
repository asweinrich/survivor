export const metadata = {
  title: 'Privacy Policy | Survivor Fantasy',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-900 text-white px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-lostIsland uppercase tracking-wider text-3xl md:text-4xl mb-2 text-center">
          Privacy Policy
        </h1>
        <p className="text-center text-stone-400 text-sm mb-10 font-inter">
          Last updated: September 22, 2026
        </p>

        <div className="space-y-6 font-inter text-stone-200 leading-relaxed">
          <p>
            Survivor Fantasy (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates this
            fantasy league application. This Privacy Policy explains what
            information we collect from you and how we use it.
          </p>

          <section>
            <h2 className="font-lostIsland uppercase tracking-wider text-xl mb-2">
              Information We Collect
            </h2>
            <ul className="list-disc list-inside space-y-1 text-stone-300">
              <li>Name</li>
              <li>Phone number</li>
              <li>Email address (if provided)</li>
              <li>Tribe/draft selections and fantasy league activity</li>
            </ul>
          </section>

          <section>
            <h2 className="font-lostIsland uppercase tracking-wider text-xl mb-2">
              How We Use Your Information
            </h2>
            <p>
              We use your phone number to verify your identity via one-time
              SMS passcodes, to send you tribe draft confirmations, weekly
              pick&apos;em reminders, and payment-related messages related to
              your participation in Survivor Fantasy. We use your name and
              draft selections solely to operate the fantasy league
              (standings, scoring, and tribe display).
            </p>
          </section>

          <section className="border border-stone-700 rounded-lg p-4 bg-stone-800/50">
            <p className="font-semibold">
              We do not sell or share your SMS opt-in data or personal
              information with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-lostIsland uppercase tracking-wider text-xl mb-2">
              SMS Messaging
            </h2>
            <p>
              Message frequency varies. Message and data rates may apply.
              You may reply STOP at any time to a text message to opt out
              of future messages, or HELP for assistance.
            </p>
          </section>

          <section>
            <h2 className="font-lostIsland uppercase tracking-wider text-xl mb-2">
              Contact
            </h2>
            <p>
              If you have questions about this Privacy Policy or your data,
              contact me{' '}
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