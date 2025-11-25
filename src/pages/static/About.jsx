export default function About() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Dexter</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Dexter helps marketing teams stay ahead of trends and produce engaging content faster than ever before. We are a
            distributed team of strategists, engineers, and creatives obsessed with unlocking brand growth.
          </p>
        </header>

        <section className="space-y-12">
          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              We believe every brand deserves the power of a world-class marketing team. Dexter combines generative AI with
              human insight so teams can create consistent, on-brand content for every platform.
            </p>
          </article>

          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Team</h2>
            <p className="text-gray-600 leading-relaxed">
              Founded by former agency leaders, Dexter brings together experts in data science, design, and storytelling. We
              operate remotely across North America and Europe to support global campaigns around the clock.
            </p>
          </article>

          <article className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join Us</h2>
            <p className="text-gray-600 leading-relaxed">
              We're hiring! If you are passionate about building the future of marketing, check out current openings on our
              careers page.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
