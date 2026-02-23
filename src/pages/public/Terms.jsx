import { FileText } from 'lucide-react';
import SEO from '../../components/SEO';

export default function Terms() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing and using Dexter, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.`
    },
    {
      title: '2. User Accounts',
      content: `2.1 Registration: You must provide accurate, complete information when creating an account.

2.2 Account Types: We offer accounts for Brands and Influencers, each with specific features and responsibilities.

2.3 Account Security: You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized access.

2.4 Age Requirement: You must be at least 18 years old to use our platform.`
    },
    {
      title: '3. Platform Services',
      content: `3.1 Marketplace: Our platform connects brands with influencers for marketing campaigns.

3.2 Campaign Management: We provide tools for creating, managing, and tracking campaigns.

3.3 Payment Processing: We facilitate payments between brands and influencers through secure third-party processors.

3.4 Analytics: We provide performance tracking and reporting tools.`
    },
    {
      title: '4. User Responsibilities',
      content: `4.1 Brands Must:
• Provide accurate campaign requirements
• Pay influencers as agreed
• Review deliverables in a timely manner
• Not request prohibited content

4.2 Influencers Must:
• Deliver work as agreed
• Maintain authentic audience engagement
• Disclose sponsored content per regulations
• Not use fake followers or engagement`
    },
    {
      title: '5. Payments and Fees',
      content: `5.1 Platform Fees: Dexter charges a service fee on transactions (see Pricing page).

5.2 Payment Terms: Brands pay upfront; influencers receive payment after campaign completion and approval.

5.3 Disputes: Payment disputes must be raised within 30 days of campaign completion.

5.4 Refunds: Refund eligibility is determined based on campaign deliverables and our dispute resolution process.`
    },
    {
      title: '6. Intellectual Property',
      content: `6.1 Platform Content: Dexter's logos, trademarks, and platform content are our property.

6.2 User Content: You retain ownership of content you create, but grant us license to use it for platform operations.

6.3 Campaign Content: Rights to campaign content are determined by agreements between brands and influencers.`
    },
    {
      title: '7. Prohibited Conduct',
      content: `You may not:
• Violate laws or regulations
• Engage in fraudulent activities
• Use fake accounts or bots
• Harass or abuse other users
• Share confidential information
• Reverse engineer our platform
• Use our platform for unauthorized commercial purposes`
    },
    {
      title: '8. Content Guidelines',
      content: `Content on our platform must not:
• Violate intellectual property rights
• Contain false or misleading information
• Promote illegal activities
• Include hate speech or discrimination
• Contain explicit or inappropriate material
• Violate advertising standards or disclosure requirements`
    },
    {
      title: '9. Termination',
      content: `9.1 By You: You may close your account at any time.

9.2 By Us: We reserve the right to suspend or terminate accounts that violate these terms.

9.3 Effect: Upon termination, you lose access to the platform. Pending obligations (payments, deliverables) remain in effect.`
    },
    {
      title: '10. Disclaimers',
      content: `10.1 Platform Availability: We provide our platform "as is" and do not guarantee uninterrupted access.

10.2 Third-Party Conduct: We are not responsible for user conduct or campaign outcomes.

10.3 External Links: We are not responsible for third-party websites linked from our platform.`
    },
    {
      title: '11. Limitation of Liability',
      content: `To the maximum extent permitted by law, Dexter shall not be liable for:
• Indirect, incidental, or consequential damages
• Loss of profits, data, or business opportunities
• Damages exceeding amounts paid to Dexter in the past 12 months

This limitation applies even if we've been advised of possible damages.`
    },
    {
      title: '12. Indemnification',
      content: `You agree to indemnify and hold Dexter harmless from claims, damages, and expenses arising from:
• Your use of the platform
• Your violation of these terms
• Your violation of third-party rights
• Content you submit to the platform`
    },
    {
      title: '13. Dispute Resolution',
      content: `13.1 Internal Resolution: We encourage users to resolve disputes through our support team first.

13.2 Arbitration: Disputes not resolved internally may be subject to binding arbitration.

13.3 Governing Law: These terms are governed by the laws of Kenya.`
    },
    {
      title: '14. Changes to Terms',
      content: `We may modify these terms at any time. Material changes will be notified via email or platform notification. Continued use after changes constitutes acceptance.`
    },
    {
      title: '15. Contact Information',
      content: `For questions about these terms, contact us at:

Email: legal@dexter.co
Address: Nairobi, Kenya`
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Terms of Service - Dexter Platform"
        description="Review Dexter's terms of service. Understand your rights and responsibilities when using our influencer marketing platform."
        keywords="terms of service, user agreement, platform rules, Dexter terms, legal terms"
        type="website"
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <FileText className="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Terms of Service</h1>
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
              Please read these Terms of Service carefully before using the Dexter platform.
              These terms govern your access to and use of our services.
            </p>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index} className="border-b border-gray-200 pb-8 last:border-b-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                  <div className="text-gray-600 whitespace-pre-line">{section.content}</div>
                </div>
              ))}
            </div>

            {/* Important Notice */}
            <div className="mt-12 p-6 bg-red-50 border border-red-200 rounded-xl">
              <h3 className="text-xl font-semibold text-red-900 mb-3">Important Notice</h3>
              <p className="text-red-800">
                By using Dexter, you agree to these terms in their entirety. If you do not agree,
                you must not use our platform. These terms include important limitations on our
                liability and your legal rights.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
