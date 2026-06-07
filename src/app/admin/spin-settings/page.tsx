"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { getSpinConfig, updateSpinConfig } from "@/lib/actions"
import { Settings, Save } from "lucide-react"

interface SpinConfigData {
  id: string
  dailySpinLimit: number
  weeklyClaimPeriodDays: number
  antiSpamCooldownMs: number
  stalePendingMinutes: number
}

export default function AdminSpinSettingsPage() {
  const [config, setConfig] = useState<SpinConfigData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      const data = await getSpinConfig()
      setConfig(data as SpinConfigData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!config) return
    setSaving(true)
    setSaved(false)
    try {
      await updateSpinConfig({
        dailySpinLimit: config.dailySpinLimit,
        weeklyClaimPeriodDays: config.weeklyClaimPeriodDays,
        antiSpamCooldownMs: config.antiSpamCooldownMs,
        stalePendingMinutes: config.stalePendingMinutes,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner className="mx-auto mt-12" />

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-luxury-charcoal">
            Spin Settings
          </h1>
          <p className="text-gray-500 text-sm">
            Configure spin wheel behaviour and limits
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-luxury-gold/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-luxury-gold" />
            </div>
            <div>
              <p className="font-semibold">Spin Limits &amp; Rules</p>
              <p className="text-xs text-gray-500">All values are applied instantly</p>
            </div>
          </div>

          <div>
            <Input
              label="Daily Spin Limit"
              type="number"
              value={config?.dailySpinLimit ?? 10}
              onChange={(e) =>
                setConfig((prev) =>
                  prev ? { ...prev, dailySpinLimit: Math.max(1, Number(e.target.value)) } : prev
                )
              }
              min={1}
              max={100}
            />
            <p className="text-xs text-gray-400 mt-1">Max times a user can spin per day</p>
          </div>

          <div>
            <Input
              label="Coupon Claim Interval (days)"
              type="number"
              value={config?.weeklyClaimPeriodDays ?? 7}
              onChange={(e) =>
                setConfig((prev) =>
                  prev ? { ...prev, weeklyClaimPeriodDays: Math.max(1, Number(e.target.value)) } : prev
                )
              }
              min={1}
              max={365}
            />
            <p className="text-xs text-gray-400 mt-1">Days a user must wait between claiming coupon rewards</p>
          </div>

          <div>
            <Input
              label="Anti-Spam Cooldown (milliseconds)"
              type="number"
              value={config?.antiSpamCooldownMs ?? 3000}
              onChange={(e) =>
                setConfig((prev) =>
                  prev ? { ...prev, antiSpamCooldownMs: Math.max(0, Number(e.target.value)) } : prev
                )
              }
              min={0}
              max={30000}
            />
            <p className="text-xs text-gray-400 mt-1">Minimum time between spins. 3000ms = 3 seconds</p>
          </div>

          <div>
            <Input
              label="Stale Pending Cleanup (minutes)"
              type="number"
              value={config?.stalePendingMinutes ?? 10}
              onChange={(e) =>
                setConfig((prev) =>
                  prev ? { ...prev, stalePendingMinutes: Math.max(1, Number(e.target.value)) } : prev
                )
              }
              min={1}
              max={1440}
            />
            <p className="text-xs text-gray-400 mt-1">Unclaimed rewards older than this are auto-cleaned up</p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Button
              onClick={handleSave}
              className="w-full"
              disabled={saving || !config}
            >
              {saving ? (
                "Saving..."
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {saved ? "Saved!" : "Save Settings"}
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
