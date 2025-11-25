export default function Security() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Security</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            We design security into every layer of the Dexter platform so your brand data stays protected.
          </p>
        </header>

        <section className="space-y-12">
          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Secure Infrastructure</h2>
            <p className="text-gray-600 leading-relaxed">
              Dexter is hosted on SOC 2 compliant infrastructure with network-level protections, automated backups, and
              redundancy across multiple availability zones.
            </p>
          </article>

          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Protection</h2>
            <p className="text-gray-600 leading-relaxed">
              All data in transit is encrypted via TLS 1.3. Sensitive information such as tokens and secrets is encrypted at
              rest using AES-256 and rotated regularly.
            </p>
          </article>

          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Best Practices</h2>
            <p className="text-gray-600 leading-relaxed">
              We run regular penetration tests, maintain a vulnerability disclosure program, and enforce strict access
              controls for our internal teams. Contact security@dexter.ai for security-related questions.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
