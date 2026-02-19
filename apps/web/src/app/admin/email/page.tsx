"use client"

import { useState } from "react"
import { Mail, Send, Users, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { UserDropdown } from "@/components/user-dropdown"
import api from "@/lib/api"

export default function AdminEmailPage() {
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [targetRole, setTargetRole] = useState("all")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ queued: number; total: number; message: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSend = async () => {
    setShowConfirm(false)
    setSending(true)
    setError(null)
    setResult(null)

    try {
      const res = await api.post("/admin/email/broadcast", {
        subject,
        body,
        targetRole: targetRole === "all" ? undefined : targetRole,
      })
      setResult(res.data)
      setSubject("")
      setBody("")
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to send broadcast email")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl font-bold text-[#1E1B4B]">Bulk Email</h1>
          <p className="text-sm text-[#64748B]">Compose and send emails to your users</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="w-9 h-9 bg-[#4F46E5] rounded-lg flex items-center justify-center">
                <Mail className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#1E1B4B]">Compose Broadcast</h2>
                <p className="text-xs text-[#64748B]">Send an email to all users or a specific group</p>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Target Audience */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-[#374151]">Target Audience</Label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: "all", label: "All Users", icon: Users },
                    { value: "user", label: "Users Only", icon: Users },
                    { value: "admin", label: "Admins Only", icon: Users },
                    { value: "editor", label: "Editors Only", icon: Users },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTargetRole(opt.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        targetRole === opt.value
                          ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                          : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#4F46E5] hover:text-[#4F46E5]"
                      }`}
                    >
                      <opt.icon className="w-4 h-4" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="subject" className="text-sm font-medium text-[#374151]">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Important Update from ExpirationReminderAI"
                  className="h-11"
                />
              </div>

              {/* Body */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="body" className="text-sm font-medium text-[#374151]">
                  Email Body <span className="text-xs text-[#9CA3AF] font-normal">(HTML supported)</span>
                </Label>
                <textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your email content here. You can use HTML tags for formatting."
                  rows={10}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                />
              </div>

              {/* Result / Error */}
              {result && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">{result.message}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {result.queued} of {result.total} email(s) queued for delivery via Gmail SMTP.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Confirm Dialog */}
              {showConfirm && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium text-amber-800 mb-3">
                    Are you sure you want to send this email to{" "}
                    <strong>{targetRole === "all" ? "all active users" : `all ${targetRole}s`}</strong>?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSend}
                      className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm"
                    >
                      <Send className="w-4 h-4 mr-1.5" />
                      Yes, Send Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirm(false)}
                      className="text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Send Button */}
              {!showConfirm && (
                <Button
                  onClick={() => {
                    if (!subject.trim() || !body.trim()) {
                      setError("Please fill in both subject and body.")
                      return
                    }
                    setError(null)
                    setResult(null)
                    setShowConfirm(true)
                  }}
                  disabled={sending}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white h-11 text-sm font-semibold"
                >
                  {sending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1.5" />
                      Review & Send
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 p-4 bg-[#EEF2FF] rounded-xl border border-[#C7D2FE]">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#4F46E5] mt-0.5 shrink-0" />
              <div className="text-sm text-[#4338CA]">
                <p className="font-medium mb-1">Gmail SMTP Rate Limits</p>
                <p className="text-[#6366F1]">
                  Gmail allows ~500 emails/day with an App Password. Emails are queued and sent at a controlled rate to stay within limits. For higher volumes, consider upgrading to a transactional email service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
