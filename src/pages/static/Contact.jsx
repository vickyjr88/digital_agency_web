export default function Contact() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Dexter</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our team is ready to help. Reach out with product questions, partnership ideas, or press inquiries.
          </p>
        </header>

        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Jane Doe"
              />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="jane@brand.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option>Product Questions</option>
                  <option>Partnerships</option>
                  <option>Media/Press</option>
                  <option>Support</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                rows="6"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Tell us how we can help..."
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3 text-center">
          {[
            {
              title: 'Support',
              detail: 'support@dexter.ai'
            },
            {
              title: 'Sales',
              detail: 'sales@dexter.ai'
            },
            {
              title: 'Press',
              detail: 'press@dexter.ai'
            }
          ].map((item) => (
            <div key={item.title} className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
              <p className="text-indigo-600 font-medium mt-2">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
