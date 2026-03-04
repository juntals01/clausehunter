import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms governing your use of Expiration Reminder AI's HIPAA-compliant, AI-powered document analysis and deadline tracking service.",
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
            Last updated: February 27, 2026
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
              Expiration Reminder AI is a document analysis and deadline tracking platform that uses AI to extract key dates, clauses, and renewal terms from your documents. The service includes document upload, OCR processing, AI-powered extraction, manual reminder entry, and automated email notifications to help you stay ahead of deadlines.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">3. User Accounts</h2>
            <p className="text-[#57534E] leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information when creating an account. You are responsible for all activity that occurs under your account. Notify us immediately of any unauthorized use.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">4. HIPAA Compliance &amp; Protected Health Information</h2>
            <p className="text-[#57534E] leading-relaxed">
              Expiration Reminder AI is designed to comply with the Health Insurance Portability and Accountability Act (HIPAA). If you are a Covered Entity or Business Associate under HIPAA and you upload documents containing Protected Health Information (PHI), the following terms apply:
            </p>
            <ul className="list-disc list-inside text-[#57534E] leading-relaxed ml-2 flex flex-col gap-2 mt-1">
              <li><strong>Business Associate Agreement (BAA):</strong> We will enter into a BAA with you upon request, establishing the permitted uses and disclosures of PHI, safeguards we will implement, and our breach notification obligations.</li>
              <li><strong>Minimum Necessary Standard:</strong> We access only the minimum amount of PHI necessary to provide the services you have engaged us to perform.</li>
              <li><strong>Safeguards:</strong> We implement administrative, physical, and technical safeguards to ensure the confidentiality, integrity, and availability of PHI, including AES-256 encryption at rest, TLS 1.3 encryption in transit, role-based access controls, and comprehensive audit logging.</li>
              <li><strong>Subcontractors:</strong> Any subcontractors or third-party vendors who may access PHI are bound by BAAs and are required to implement equivalent safeguards.</li>
              <li><strong>Breach Notification:</strong> In the event of a breach of unsecured PHI, we will notify you without unreasonable delay and no later than 60 days from discovery, in compliance with the HIPAA Breach Notification Rule (45 CFR §§ 164.400–414).</li>
              <li><strong>Data Return/Destruction:</strong> Upon termination of the BAA, we will return or destroy all PHI in our possession, as specified in the agreement.</li>
            </ul>
            <p className="text-[#57534E] leading-relaxed mt-2">
              To request a BAA or for questions about our HIPAA compliance program, contact{" "}
              <a href="mailto:compliance@expirationreminderai.com" className="text-[#EA580C] hover:underline">
                compliance@expirationreminderai.com
              </a>.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">5. Acceptable Use</h2>
            <p className="text-[#57534E] leading-relaxed">
              You agree to use Expiration Reminder AI only for lawful purposes and in accordance with these terms. You may not upload documents that you do not have the legal right to process. You may not attempt to reverse-engineer, decompile, or disassemble any part of the service.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">6. Data Security</h2>
            <p className="text-[#57534E] leading-relaxed">
              We implement industry-leading security measures to protect your data. All documents are encrypted at rest (AES-256) and in transit (TLS 1.3). AI processing occurs in isolated, secure environments. We maintain comprehensive audit logs, perform regular security assessments, and our infrastructure is hosted on SOC 2 certified platforms. Your documents are never shared with, sold to, or used by third parties for any purpose outside the scope of providing our services.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">7. Intellectual Property</h2>
            <p className="text-[#57534E] leading-relaxed">
              You retain all ownership rights to the documents you upload. Expiration Reminder AI does not claim any ownership over your content. The service itself, including its design, features, and code, is the intellectual property of Expiration Reminder AI and is protected by applicable laws.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">8. Disclaimer of Warranties</h2>
            <p className="text-[#57534E] leading-relaxed">
              Expiration Reminder AI is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. While we strive for accuracy in data extraction and deadline detection, we do not guarantee that the AI analysis will be error-free. You should always verify extracted information against your original documents. Expiration Reminder AI is not a substitute for professional legal, medical, or compliance advice.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">9. Limitation of Liability</h2>
            <p className="text-[#57534E] leading-relaxed">
              To the maximum extent permitted by law, Expiration Reminder AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. This includes, but is not limited to, damages arising from missed deadlines, inaccurate data extraction, or failure to deliver notifications.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">10. Termination</h2>
            <p className="text-[#57534E] leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these terms. You may terminate your account at any time by contacting us. Upon termination, your right to use the service will cease immediately, and we will delete your data in accordance with our privacy policy and any applicable BAA.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">11. Changes to Terms</h2>
            <p className="text-[#57534E] leading-relaxed">
              We may modify these terms at any time. We will provide notice of material changes by posting the updated terms on our website. Your continued use of Expiration Reminder AI after changes are posted constitutes your acceptance of the revised terms.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">12. Contact</h2>
            <p className="text-[#57534E] leading-relaxed">
              For questions about these terms, please contact us at{" "}
              <a href="mailto:legal@expirationreminderai.com" className="text-[#EA580C] hover:underline">
                legal@expirationreminderai.com
              </a>. For HIPAA compliance inquiries, contact{" "}
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
