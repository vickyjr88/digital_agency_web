export default function Terms() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            These Terms govern your access to and use of the Dexter platform. By creating an account or using our services,
            you agree to the following terms.
          </p>
        </header>

        <section className="space-y-12">
          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Using Dexter</h2>
            <p className="text-gray-600 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account. You may not use Dexter for unlawful
              or unauthorized purposes. We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </article>

          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              All content, designs, and technology on the platform belong to Dexter or our licensors. You retain ownership of
              content your team produces, but grant us permission to process it for service delivery.
            </p>
          </article>

          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              Dexter is provided "as is" without warranties. Our liability is limited to the amount you paid in the preceding
              12 months. Some jurisdictions do not allow exclusions, so these may not apply to you.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
