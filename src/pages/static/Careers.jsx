export default function Careers() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Careers at Dexter</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Help build the future of AI-assisted marketing. We're a remote-first team shipping fast, learning faster.
          </p>
        </header>

        <section className="space-y-12">
          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Dexter</h2>
            <p className="text-gray-600 leading-relaxed">
              We offer competitive compensation, equity, flexible schedules, and an allowance for learning. Every teammate
              contributes to product direction with a bias for action and experimentation.
            </p>
          </article>

          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Open Roles</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  title: 'Senior Frontend Engineer',
                  location: 'Remote - North America',
                  type: 'Full-time'
                },
                {
                  title: 'Product Marketing Manager',
                  location: 'Remote - Europe',
                  type: 'Full-time'
                },
                {
                  title: 'AI Prompt Engineer',
                  location: 'Remote',
                  type: 'Contract'
                },
                {
                  title: 'Customer Success Lead',
                  location: 'Remote',
                  type: 'Full-time'
                }
              ].map((role) => (
                <div key={role.title} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">{role.title}</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    {role.location} · {role.type}
                  </p>
                  <button className="mt-4 text-indigo-600 font-semibold hover:text-indigo-700">
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Don't See the Right Fit?</h2>
            <p className="text-gray-600 leading-relaxed">
              We love meeting curious builders. Share your portfolio with careers@dexter.ai.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
