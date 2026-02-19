import { Users, Target, Zap, Award } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To empower businesses and influencers to create authentic, data-driven marketing campaigns that drive real results.'
    },
    {
      icon: Users,
      title: 'Our Team',
      description: 'A diverse group of marketers, developers, and content creators passionate about revolutionizing digital marketing.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We leverage AI and cutting-edge technology to make marketing smarter, faster, and more effective.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We are committed to delivering exceptional experiences for both brands and influencers on our platform.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Dexter</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            We're building the future of influencer marketing and content commerce,
            connecting brands with authentic voices and enabling seamless collaboration.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="prose prose-lg text-gray-600">
            <p className="mb-4">
              Dexter was born from a simple observation: the influencer marketing industry
              was fragmented, inefficient, and lacked transparency. Brands struggled to find
              the right influencers, track campaign performance, and measure ROI. Meanwhile,
              influencers faced payment delays, unclear expectations, and limited opportunities.
            </p>
            <p className="mb-4">
              We set out to change that. By combining AI-powered matching, transparent
              analytics, and seamless payment systems, Dexter brings together brands and
              influencers in a marketplace built on trust, data, and results.
            </p>
            <p>
              Today, Dexter powers thousands of successful campaigns, helping brands grow
              their reach and enabling influencers to monetize their authentic voice.
            </p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What Drives Us
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Influencers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Brand Partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">$2M+</div>
              <div className="text-gray-600">Paid to Creators</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of brands and influencers already using Dexter
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/signup"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign Up Now
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
