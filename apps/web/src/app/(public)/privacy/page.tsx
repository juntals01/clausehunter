import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Expiration Reminder AI collects, uses, and protects your data with HIPAA-compliant infrastructure. Your documents are encrypted and never shared.",
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
            Last updated: February 27, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-5 sm:px-8 lg:px-[120px] py-12 lg:py-16">
        <div className="max-w-3xl flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">1. Information We Collect</h2>
            <p className="text-[#57534E] leading-relaxed">
              When you use Expiration Reminder AI, we collect information you provide directly, including your name, email address, company name, and the documents you upload for analysis. We also collect usage data such as log data, device information, and how you interact with our service.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">2. How We Use Your Information</h2>
            <p className="text-[#57534E] leading-relaxed">
              We use the information we collect to provide, maintain, and improve Expiration Reminder AI&apos;s services. This includes processing your documents for data extraction, sending renewal and expiration alerts, providing customer support, and communicating updates about the service.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">3. HIPAA Compliance</h2>
            <p className="text-[#57534E] leading-relaxed">
              Expiration Reminder AI is fully compliant with the Health Insurance Portability and Accountability Act (HIPAA). We implement administrative, physical, and technical safeguards to protect Protected Health Information (PHI) as required under the HIPAA Privacy Rule and Security Rule. Key measures include:
            </p>
            <ul className="list-disc list-inside text-[#57534E] leading-relaxed ml-2 flex flex-col gap-2 mt-1">
              <li>Business Associate Agreements (BAAs) with all third-party vendors who may access PHI</li>
              <li>Role-based access controls limiting data access to authorized personnel only</li>
              <li>Comprehensive audit logs tracking all access to and modifications of sensitive data</li>
              <li>Encryption of PHI at rest (AES-256) and in transit (TLS 1.3)</li>
              <li>Regular risk assessments and security training for all team members</li>
              <li>Incident response procedures for prompt breach notification as required by the HIPAA Breach Notification Rule</li>
            </ul>
            <p className="text-[#57534E] leading-relaxed mt-2">
              If you are a Covered Entity or Business Associate, we are prepared to enter into a Business Associate Agreement (BAA) upon request. Contact us at{" "}
              <a href="mailto:compliance@expirationreminderai.com" className="text-[#EA580C] hover:underline">
                compliance@expirationreminderai.com
              </a>.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">4. Document Security</h2>
            <p className="text-[#57534E] leading-relaxed">
              Your documents are encrypted at rest using AES-256 encryption and in transit using TLS 1.3. We use industry-leading security measures to protect your data, including isolated processing environments for AI extraction. Documents are not shared with third parties and are never used for model training. You retain full ownership of all uploaded documents.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">5. Data Retention</h2>
            <p className="text-[#57534E] leading-relaxed">
              We retain your account information and uploaded documents for as long as your account is active. You can request deletion of your data at any time by contacting us. Upon account deletion, all associated documents and extracted data will be permanently removed within 30 days. For HIPAA-covered data, we follow retention requirements as specified in your BAA or as required by applicable law.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">6. Third-Party Services</h2>
            <p className="text-[#57534E] leading-relaxed">
              Expiration Reminder AI uses third-party services for hosting, analytics, and AI processing. All third-party vendors are vetted for security compliance and bound by data processing agreements. Where PHI is involved, we maintain signed Business Associate Agreements (BAAs) with all applicable vendors. We do not sell your personal information to third parties.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">7. Cookies</h2>
            <p className="text-[#57534E] leading-relaxed">
              We use essential cookies to maintain your session and preferences. We may also use analytics cookies to understand how you use our service. You can control cookie preferences through your browser settings.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">8. Your Rights</h2>
            <p className="text-[#57534E] leading-relaxed">
              You have the right to access, correct, or delete your personal data. You may also request a copy of your data in a portable format. For HIPAA-covered individuals, you have the right to request an accounting of disclosures of your PHI, request restrictions on uses and disclosures, and receive confidential communications. To exercise these rights, please contact us at{" "}
              <a href="mailto:privacy@expirationreminderai.com" className="text-[#EA580C] hover:underline">
                privacy@expirationreminderai.com
              </a>.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">9. Breach Notification</h2>
            <p className="text-[#57534E] leading-relaxed">
              In the event of a data breach involving unsecured PHI, we will notify affected individuals, the U.S. Department of Health and Human Services (HHS), and, where required, the media, in accordance with the HIPAA Breach Notification Rule. Notification will be provided without unreasonable delay and no later than 60 days from the discovery of the breach.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">10. Changes to This Policy</h2>
            <p className="text-[#57534E] leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;last updated&quot; date. Continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">11. Contact Us</h2>
            <p className="text-[#57534E] leading-relaxed">
              If you have questions about this privacy policy or our HIPAA compliance practices, please contact us at{" "}
              <a href="mailto:privacy@expirationreminderai.com" className="text-[#EA580C] hover:underline">
                privacy@expirationreminderai.com
              </a>{" "}
              or our compliance team at{" "}
              <a href="mailto:compliance@expirationreminderai.com" className="text-[#EA580C] hover:underline">
                compliance@expirationreminderai.com
              </a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
