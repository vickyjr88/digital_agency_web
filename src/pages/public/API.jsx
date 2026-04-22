import { Code, Book, Zap, Shield } from 'lucide-react';
import SEO from '../../components/SEO';

export default function API() {
  const features = [
    {
      icon: Zap,
      title: 'RESTful API',
      description: 'Clean, predictable REST endpoints for easy integration'
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'OAuth 2.0 and API key authentication options'
    },
    {
      icon: Code,
      title: 'Comprehensive SDKs',
      description: 'Client libraries for popular programming languages'
    },
    {
      icon: Book,
      title: 'Detailed Documentation',
      description: 'Complete guides, examples, and interactive API explorer'
    }
  ];

  const endpoints = [
    { method: 'GET', path: '/api/campaigns', description: 'List all campaigns' },
    { method: 'POST', path: '/api/campaigns', description: 'Create a new campaign' },
    { method: 'GET', path: '/api/influencers', description: 'Search influencers' },
    { method: 'GET', path: '/api/analytics', description: 'Fetch campaign analytics' },
    { method: 'GET', path: '/api/external/download/{id}', description: 'Secure digital product download (X-Access-Key auth)' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Dexter API Documentation - Build Custom Marketing Tools"
        description="Integrate Dexter's powerful AI influencer matching and analytics into your own applications. Explore our comprehensive API documentation, SDKs, and code samples."
        keywords="Dexter API, influencer marketing API, developer documentation, marketing SDK, build marketing tools"
        type="website"
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Code className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Dexter API</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Build powerful integrations with the Dexter platform. Access campaign management,
            influencer search, and analytics programmatically.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Powerful API Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Start</h2>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <p className="text-gray-600 mb-6">
              Get started with the Dexter API in minutes:
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Get your API key</h3>
                <p className="text-gray-600 mb-3">Sign up for a Dexter account and generate your API key from the dashboard.</p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  curl https://api.dexter.co/auth/keys
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Make your first request</h3>
                <p className="text-gray-600 mb-3">Use your API key to authenticate requests:</p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  {`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.dexter.co/campaigns`}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Explore the docs</h3>
                <p className="text-gray-600">
                  Visit our full API documentation for detailed guides, code examples, and interactive testing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Example Endpoints */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">API Endpoints</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {endpoints.map((endpoint, index) => (
              <div
                key={index}
                className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-md text-sm font-mono font-semibold ${
                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-gray-900 font-mono">{endpoint.path}</code>
                </div>
                <p className="text-gray-600 text-sm mt-2 ml-20">{endpoint.description}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 mt-6">
            ...and many more endpoints in our full documentation
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Access complete API documentation and start integrating today
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/signup"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get API Key
            </a>
            <a
              href="/contact"
              className="px-8 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
