import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms governing your use of Expiration Reminder AI's AI-powered contract analysis and renewal tracking service.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="bg-[#FFFBF5] px-5 sm:px-8 lg:px-[120px] py-12 lg:py-20 border-b border-[#E7E5E4]">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-[#EA580C] mb-2">Legal</p>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-[#1C1917] mb-4">
            Terms of Service
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
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">1. Acceptance of Terms</h2>
            <p className="text-[#57534E] leading-relaxed">
              By accessing or using Expiration Reminder AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the service. These terms apply to all users, including visitors, registered users, and administrators.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">2. Description of Service</h2>
            <p className="text-[#57534E] leading-relaxed">
              Expiration Reminder AI is a contract analysis platform that uses AI to extract key clauses, identify renewal dates, and send automated alerts to help you avoid unwanted auto-renewals. The service includes document upload, OCR processing, AI-powered extraction, and email notifications.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">3. User Accounts</h2>
            <p className="text-[#57534E] leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information when creating an account. You are responsible for all activity that occurs under your account. Notify us immediately of any unauthorized use.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">4. Acceptable Use</h2>
            <p className="text-[#57534E] leading-relaxed">
              You agree to use Expiration Reminder AI only for lawful purposes and in accordance with these terms. You may not upload documents that you do not have the legal right to process. You may not attempt to reverse-engineer, decompile, or disassemble any part of the service.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">5. Intellectual Property</h2>
            <p className="text-[#57534E] leading-relaxed">
              You retain all ownership rights to the documents you upload. Expiration Reminder AI does not claim any ownership over your content. The service itself, including its design, features, and code, is the intellectual property of Expiration Reminder AI and is protected by applicable laws.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">6. Disclaimer of Warranties</h2>
            <p className="text-[#57534E] leading-relaxed">
              Expiration Reminder AI is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. While we strive for accuracy in clause extraction and renewal date detection, we do not guarantee that the AI analysis will be error-free. You should always verify extracted information against your original documents.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">7. Limitation of Liability</h2>
            <p className="text-[#57534E] leading-relaxed">
              To the maximum extent permitted by law, Expiration Reminder AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. This includes, but is not limited to, damages arising from missed renewal deadlines or inaccurate clause extraction.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">8. Termination</h2>
            <p className="text-[#57534E] leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these terms. You may terminate your account at any time by contacting us. Upon termination, your right to use the service will cease immediately, and we will delete your data in accordance with our privacy policy.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">9. Changes to Terms</h2>
            <p className="text-[#57534E] leading-relaxed">
              We may modify these terms at any time. We will provide notice of material changes by posting the updated terms on our website. Your continued use of Expiration Reminder AI after changes are posted constitutes your acceptance of the revised terms.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">10. Contact</h2>
            <p className="text-[#57534E] leading-relaxed">
              For questions about these terms, please contact us at{" "}
              <a href="mailto:legal@expirationreminderai.com" className="text-[#EA580C] hover:underline">
                legal@expirationreminderai.com
              </a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
