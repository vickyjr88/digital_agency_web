import { Plug, CheckCircle } from 'lucide-react';

export default function Integrations() {
  const integrations = [
    {
      name: 'Instagram',
      logo: '📸',
      description: 'Connect your Instagram account for seamless content sharing and analytics',
      status: 'Available'
    },
    {
      name: 'TikTok',
      logo: '🎵',
      description: 'Track TikTok campaign performance and audience insights',
      status: 'Available'
    },
    {
      name: 'YouTube',
      logo: '▶️',
      description: 'Integrate YouTube for video campaign tracking and monetization',
      status: 'Available'
    },
    {
      name: 'Twitter/X',
      logo: '🐦',
      description: 'Manage Twitter campaigns and engagement metrics',
      status: 'Available'
    },
    {
      name: 'Facebook',
      logo: '👥',
      description: 'Connect Facebook pages for comprehensive social media management',
      status: 'Available'
    },
    {
      name: 'LinkedIn',
      logo: '💼',
      description: 'Professional network integration for B2B campaigns',
      status: 'Coming Soon'
    },
    {
      name: 'Shopify',
      logo: '🛍️',
      description: 'Sync products and track affiliate sales directly',
      status: 'Coming Soon'
    },
    {
      name: 'Google Analytics',
      logo: '📊',
      description: 'Advanced analytics and conversion tracking',
      status: 'Available'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Plug className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Integrations</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Connect Dexter with your favorite tools and platforms to streamline your workflow
            and maximize campaign performance.
          </p>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Available Integrations
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{integration.logo}</div>
                  {integration.status === 'Available' ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {integration.status}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                      {integration.status}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{integration.name}</h3>
                <p className="text-gray-600">{integration.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why Integrate?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Save Time</h3>
              <p className="text-gray-600">
                Automate data syncing and eliminate manual work by connecting all your platforms in one place.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Better Insights</h3>
              <p className="text-gray-600">
                Get comprehensive analytics by combining data from multiple sources for smarter decisions.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Streamline Workflow</h3>
              <p className="text-gray-600">
                Manage campaigns, content, and analytics from a single dashboard without switching tools.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Scale Faster</h3>
              <p className="text-gray-600">
                Grow your campaigns efficiently with automated processes and real-time synchronization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Integrations */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Need a Custom Integration?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Our API makes it easy to build custom integrations for your specific needs.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/api"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View API Docs
            </a>
            <a
              href="/contact"
              className="px-8 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
