import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Expiration Reminder AI collects, uses, and protects your data. Your contract documents are encrypted and never shared with third parties.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="bg-[#FFFBF5] px-5 sm:px-8 lg:px-[120px] py-12 lg:py-20 border-b border-[#E7E5E4]">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-[#EA580C] mb-2">Legal</p>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-[#1C1917] mb-4">
            Privacy Policy
          </h1>
          <p className="text-[#78716C] text-base lg:text-lg leading-relaxed">
            Last updated: February 13, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-5 sm:px-8 lg:px-[120px] py-12 lg:py-16">
        <div className="max-w-3xl flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">1. Information We Collect</h2>
            <p className="text-[#57534E] leading-relaxed">
              When you use Expiration Reminder AI, we collect information you provide directly, including your name, email address, company name, and the contract documents you upload for analysis. We also collect usage data such as log data, device information, and how you interact with our service.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">2. How We Use Your Information</h2>
            <p className="text-[#57534E] leading-relaxed">
              We use the information we collect to provide, maintain, and improve Expiration Reminder AI&apos;s services. This includes processing your contracts for clause extraction, sending renewal alerts, providing customer support, and communicating updates about the service.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">3. Document Security</h2>
            <p className="text-[#57534E] leading-relaxed">
              Your contract documents are encrypted at rest and in transit. We use industry-standard security measures to protect your data. Documents are processed using AI for clause extraction and are not shared with third parties. You retain full ownership of all uploaded documents.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">4. Data Retention</h2>
            <p className="text-[#57534E] leading-relaxed">
              We retain your account information and uploaded documents for as long as your account is active. You can request deletion of your data at any time by contacting us. Upon account deletion, all associated documents and extracted data will be permanently removed within 30 days.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">5. Third-Party Services</h2>
            <p className="text-[#57534E] leading-relaxed">
              Expiration Reminder AI uses third-party services for hosting, analytics, and AI processing. These services are bound by their own privacy policies and our data processing agreements. We do not sell your personal information to third parties.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">6. Cookies</h2>
            <p className="text-[#57534E] leading-relaxed">
              We use essential cookies to maintain your session and preferences. We may also use analytics cookies to understand how you use our service. You can control cookie preferences through your browser settings.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">7. Your Rights</h2>
            <p className="text-[#57534E] leading-relaxed">
              You have the right to access, correct, or delete your personal data. You may also request a copy of your data in a portable format. To exercise these rights, please contact us at privacy@expirationreminderai.com.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">8. Changes to This Policy</h2>
            <p className="text-[#57534E] leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;last updated&quot; date. Continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">9. Contact Us</h2>
            <p className="text-[#57534E] leading-relaxed">
              If you have questions about this privacy policy, please contact us at{" "}
              <a href="mailto:privacy@expirationreminderai.com" className="text-[#EA580C] hover:underline">
                privacy@expirationreminderai.com
              </a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
