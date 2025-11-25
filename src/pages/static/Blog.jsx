export default function Blog() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dexter Insider</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Explore insights on AI-powered marketing, social strategy, and brand storytelling. New posts drop weekly.
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-2">
          {[
            {
              title: 'The Playbook for Trend-Driven Content',
              excerpt:
                'Learn how the top social teams identify opportunities and launch high-impact campaigns in hours instead of weeks.',
              category: 'Strategy'
            },
            {
              title: 'Writing in Your Brand Voice with AI',
              excerpt:
                'A practical guide to configuring Dexter so every generated post is on-brand, compliant, and ready for publishing.',
              category: 'AI Workflows'
            },
            {
              title: 'Creative Testing at Scale',
              excerpt:
                'How agencies iterate faster by pairing AI copy generation with structured creative briefs and testing frameworks.',
              category: 'Operations'
            },
            {
              title: '2025 Trend Forecast',
              excerpt:
                'The trends, formats, and platforms poised to dominate audiences in 2025 and how to react in real time.',
              category: 'Trends'
            }
          ].map((post) => (
            <article
              key={post.title}
              className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{post.category}</span>
              <h2 className="text-2xl font-semibold text-gray-900 mt-3 mb-2">{post.title}</h2>
              <p className="text-gray-600 leading-relaxed">{post.excerpt}</p>
              <button className="mt-6 inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700">
                Read Article →
              </button>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
