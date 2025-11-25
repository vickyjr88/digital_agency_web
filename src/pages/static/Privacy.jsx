export default function Privacy() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            We take your privacy seriously and are committed to protecting your personal information. This page outlines
            how Dexter collects, uses, and safeguards data.
          </p>
        </header>

        <section className="space-y-12">
          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed">
              We collect information that you provide directly when creating an account, configuring brand profiles, or
              communicating with our team. This may include your name, email, billing details, and brand preferences. We also
              automatically collect usage data, such as log files, device information, and analytics metrics, to improve our
              services and ensure platform security.
            </p>
          </article>

          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Data</h2>
            <p className="text-gray-600 leading-relaxed">
              Data enables Dexter to deliver AI-powered content, personalize experiences, and communicate updates. We do not
              sell personal information. We may share limited data with trusted providers who help us operate the platform, and
              only under strict confidentiality agreements.
            </p>
          </article>

          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights & Choices</h2>
            <p className="text-gray-600 leading-relaxed">
              You can access, update, or delete your data at any time by contacting support. You may also adjust email
              preferences or opt-out of analytics tracking in your account settings. For more details, reach out to
              privacy@dexter.ai.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
