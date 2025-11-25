export default function Integrations() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Integrations</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Connect Dexter with the tools your agency already loves. Automate content workflows across analytics, publishing,
            and collaboration systems.
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-2">
          {[
            {
              title: 'Social Platforms',
              description: 'Publish directly to Twitter, Instagram, Facebook, LinkedIn, and TikTok with scheduling support.'
            },
            {
              title: 'Analytics Suites',
              description: 'Sync performance metrics from Google Analytics, Looker, and Tableau to measure impact.'
            },
            {
              title: 'Collaboration',
              description: 'Push content drafts to Notion, Airtable, Asana, and Slack so teams can iterate quickly.'
            },
            {
              title: 'Custom Automations',
              description: 'Use webhooks and our API to connect any internal system or automation platform.'
            }
          ].map((integration) => (
            <article
              key={integration.title}
              className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">{integration.title}</h2>
              <p className="text-gray-600 leading-relaxed">{integration.description}</p>
              <button className="mt-6 inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700">
                Explore Use Cases →
              </button>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
