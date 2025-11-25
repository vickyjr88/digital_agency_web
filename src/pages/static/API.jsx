export default function API() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dexter API</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Automate trend detection and content generation by integrating Dexter directly into your workflows.
          </p>
        </header>

        <section className="space-y-12">
          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Authentication</h2>
            <p className="text-gray-600 leading-relaxed">
              The API uses token-based authentication. Create a personal token in your dashboard and attach it via the
              `Authorization: Bearer YOUR_TOKEN` header. For security, rotate tokens regularly and never share them publicly.
            </p>
          </article>

          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Endpoints</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                <strong>/v1/trends</strong> – Retrieve the latest trending topics filtered by industry, geography, and sentiment.
              </li>
              <li>
                <strong>/v1/brands/{'{brandId}'}/content</strong> – Generate content variations for your configured brand profiles.
              </li>
              <li>
                <strong>/v1/schedule</strong> – Push approved content to your publishing calendar or external scheduler.
              </li>
            </ul>
          </article>

          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Rate Limits</h2>
            <p className="text-gray-600 leading-relaxed">
              Each workspace receives 500 requests per hour by default. Contact sales@dexter.ai if your automations require
              elevated access.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
