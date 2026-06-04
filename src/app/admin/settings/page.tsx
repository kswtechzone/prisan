"use client"

import { useState, useEffect } from "react"
import { Building2, Smartphone, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { getPaymentConfig, updatePaymentConfig } from "@/lib/actions"

export default function AdminSettingsPage() {
  const [config, setConfig] = useState({
    bankName: "",
    bankAccount: "",
    bankHolder: "",
    esewaNumber: "",
    khaltiNumber: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getPaymentConfig().then((data) => {
      setConfig({
        bankName: data.bankName || "",
        bankAccount: data.bankAccount || "",
        bankHolder: data.bankHolder || "",
        esewaNumber: data.esewaNumber || "",
        khaltiNumber: data.khaltiNumber || "",
      })
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    await updatePaymentConfig(config)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-luxury-charcoal">
          Payment Settings
        </h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-luxury-gold" />
              <h2 className="font-display font-semibold text-lg">
                Bank Transfer
              </h2>
            </div>
            <Input
              label="Bank Name"
              placeholder="e.g. NMB Bank"
              value={config.bankName}
              onChange={(e) =>
                setConfig({ ...config, bankName: e.target.value })
              }
            />
            <Input
              label="Account Number"
              placeholder="e.g. 1234567890"
              value={config.bankAccount}
              onChange={(e) =>
                setConfig({ ...config, bankAccount: e.target.value })
              }
            />
            <Input
              label="Account Holder"
              placeholder="e.g. Prisan Beauty"
              value={config.bankHolder}
              onChange={(e) =>
                setConfig({ ...config, bankHolder: e.target.value })
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="w-5 h-5 text-luxury-gold" />
              <h2 className="font-display font-semibold text-lg">
                Mobile Payments
              </h2>
            </div>
            <Input
              label="eSewa Number"
              placeholder="e.g. 98XXXXXXXX"
              value={config.esewaNumber}
              onChange={(e) =>
                setConfig({ ...config, esewaNumber: e.target.value })
              }
            />
            <Input
              label="Khalti Number"
              placeholder="e.g. 98XXXXXXXX"
              value={config.khaltiNumber}
              onChange={(e) =>
                setConfig({ ...config, khaltiNumber: e.target.value })
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
