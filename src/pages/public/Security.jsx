import { Shield, Lock, Eye, Server, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Security() {
  const measures = [
    {
      icon: Lock,
      title: 'Data Encryption',
      description: 'All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.'
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      description: 'Our platform runs on enterprise-grade cloud infrastructure with regular security audits and updates.'
    },
    {
      icon: Eye,
      title: 'Access Controls',
      description: 'Role-based access controls and multi-factor authentication protect your account.'
    },
    {
      icon: CheckCircle2,
      title: 'Payment Security',
      description: 'PCI-DSS compliant payment processing through Paystack ensures your financial data is secure.'
    },
    {
      icon: AlertTriangle,
      title: 'Fraud Detection',
      description: 'Advanced monitoring systems detect and prevent suspicious activities in real-time.'
    },
    {
      icon: Shield,
      title: 'Regular Audits',
      description: 'We conduct regular security assessments and penetration testing to identify vulnerabilities.'
    }
  ];

  const practices = [
    'Data backups performed daily',
    'Security patches applied promptly',
    'Employee security training',
    'Incident response procedures',
    'Privacy by design principles',
    'GDPR compliance for EU users'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Security at Dexter</h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Your data security and privacy are our top priorities. Learn how we protect your information.
          </p>
        </div>
      </section>

      {/* Security Measures */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How We Protect You
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {measures.map((measure, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <measure.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{measure.title}</h3>
                <p className="text-gray-600">{measure.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Security Best Practices</h2>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <p className="text-gray-600 mb-6">
              Our comprehensive security program includes:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {practices.map((practice, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{practice}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Security Tips */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Protect Your Account</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Use a strong password</h3>
                <p className="text-gray-600">Create a unique password with letters, numbers, and symbols.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Enable two-factor authentication</h3>
                <p className="text-gray-600">Add an extra layer of security to your account.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Be cautious of phishing</h3>
                <p className="text-gray-600">We'll never ask for your password via email or phone.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Monitor account activity</h3>
                <p className="text-gray-600">Review your account regularly and report suspicious activity immediately.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Security Issues */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Found a Security Vulnerability?</h2>
          <p className="text-gray-300 mb-8">
            We take security seriously. If you discover a security issue, please report it responsibly.
          </p>
          <a
            href="mailto:security@dexter.co"
            className="inline-block px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Report Security Issue
          </a>
        </div>
      </section>
    </div>
  );
}
