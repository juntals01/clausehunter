"use client"

import { useState } from "react"
import { Clock, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/lib/api"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSending(true)
    try {
      await api.post("/contact", { name, email, subject, message })
      setSubmitted(true)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setName("")
    setEmail("")
    setSubject("")
    setMessage("")
    setError("")
  }

  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="bg-[#FFFBF5] px-5 sm:px-8 lg:px-[120px] py-12 lg:py-20 border-b border-[#E7E5E4]">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-[#EA580C] mb-2">Get in Touch</p>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-[#1C1917] mb-4">
            Contact Us
          </h1>
          <p className="text-[#78716C] text-base lg:text-lg leading-relaxed">
            Have a question, feedback, or need help? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-5 sm:px-8 lg:px-[120px] py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Contact Info */}
          <div className="flex flex-col gap-8 lg:w-[360px] shrink-0">
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FFF7ED] shrink-0">
                  <Clock className="w-5 h-5 text-[#EA580C]" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-display text-sm font-semibold text-[#1C1917]">Response Time</h3>
                  <p className="text-sm text-[#57534E]">We typically respond within 24 hours</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] p-6">
              <h3 className="font-display text-sm font-semibold text-[#1C1917] mb-2">Need urgent help?</h3>
              <p className="text-sm text-[#57534E] leading-relaxed">
                If you&apos;re facing an urgent issue with a contract renewal deadline, please include &quot;URGENT&quot; in your subject line and we&apos;ll prioritize your request.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="flex-1 max-w-xl">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#FFF7ED]">
                  <Send className="w-7 h-7 text-[#EA580C]" />
                </div>
                <h2 className="font-display text-2xl font-bold text-[#1C1917]">Message Sent!</h2>
                <p className="text-[#78716C] max-w-sm">
                  Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="mt-4 rounded-xl border-[#E7E5E4] text-[#57534E] hover:bg-[#FAFAF9]"
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us more about your question or issue..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="flex w-full rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-sm placeholder:text-[#A8A29E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]/20 focus-visible:border-[#EA580C] transition-colors resize-none"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto bg-[#EA580C] hover:bg-[#DC4A04] text-white rounded-xl py-3.5 h-auto text-sm font-semibold px-8 disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
