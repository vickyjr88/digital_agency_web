import { Shield } from 'lucide-react';
import SEO from '../../components/SEO';

export default function Privacy() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect information that you provide directly to us, including:

• Account information (name, email, password)
• Profile information (bio, social media handles, audience demographics)
• Payment information (processed securely through third-party processors)
• Campaign and content data
• Communications between users on the platform`
    },
    {
      title: '2. How We Use Your Information',
      content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Process transactions and send related information
• Send technical notices, updates, and support messages
• Respond to your comments and questions
• Analyze usage patterns and optimize user experience
• Detect and prevent fraud and abuse`
    },
    {
      title: '3. Information Sharing',
      content: `We do not sell your personal information. We may share your information:

• With service providers who assist in our operations
• When required by law or to respond to legal process
• To protect the rights and safety of Dexter and our users
• With your consent or at your direction
• In connection with a merger, acquisition, or sale of assets`
    },
    {
      title: '4. Data Security',
      content: `We implement appropriate technical and organizational measures to protect your personal information, including:

• Encryption of data in transit and at rest
• Regular security assessments and updates
• Access controls and authentication
• Secure payment processing through PCI-compliant providers
• Employee training on data protection`
    },
    {
      title: '5. Your Rights',
      content: `You have the right to:

• Access your personal information
• Correct inaccurate data
• Request deletion of your data
• Object to processing of your information
• Export your data in a portable format
• Withdraw consent at any time

To exercise these rights, please contact us at privacy@dexter.co`
    },
    {
      title: '6. Cookies and Tracking',
      content: `We use cookies and similar technologies to:

• Keep you signed in
• Remember your preferences
• Analyze site traffic and usage
• Provide personalized content

You can control cookies through your browser settings.`
    },
    {
      title: '7. Third-Party Services',
      content: `Our platform integrates with third-party services like:

• Social media platforms (for profile verification)
• Payment processors (Paystack for secure payments)
• Analytics tools (to understand user behavior)

These services have their own privacy policies governing their data practices.`
    },
    {
      title: '8. Data Retention',
      content: `We retain your information for as long as your account is active or as needed to provide services. We may also retain information to comply with legal obligations, resolve disputes, and enforce our agreements.`
    },
    {
      title: '9. Children\'s Privacy',
      content: `Our services are not directed to individuals under 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us.`
    },
    {
      title: '10. Changes to This Policy',
      content: `We may update this privacy policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last Updated" date.`
    },
    {
      title: '11. Contact Us',
      content: `If you have questions about this privacy policy, please contact us at:

Email: privacy@dexter.co
Address: Nairobi, Kenya

For EU users, our Data Protection Officer can be reached at dpo@dexter.co`
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Privacy Policy - Dexter Platform"
        description="Read Dexter's privacy policy to understand how we collect, use, and protect your personal information. We prioritize data security and transparency."
        keywords="privacy policy, data protection, user privacy, Dexter security, GDPR compliance"
        type="website"
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Privacy Policy</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto text-center">
            Last Updated: February 20, 2025
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-8">
              At Dexter, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our platform.
            </p>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index} className="border-b border-gray-200 pb-8 last:border-b-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                  <div className="text-gray-600 whitespace-pre-line">{section.content}</div>
                </div>
              ))}
            </div>

            {/* Summary Box */}
            <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">In Summary</h3>
              <ul className="space-y-2 text-blue-800">
                <li>✓ We collect only necessary information to provide our services</li>
                <li>✓ We never sell your personal data</li>
                <li>✓ You have full control over your data</li>
                <li>✓ We use industry-standard security measures</li>
                <li>✓ You can delete your account and data at any time</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
