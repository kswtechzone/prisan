"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Gift, ArrowRight, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Confetti } from "@/components/confetti"
import { getRemainingSpins, getWeeklyCouponStatus, confirmSpin, skipSpin } from "@/lib/actions"

interface WheelSegment {
  label: string
  probability: number
  color: string
}

interface SpinResult {
  offerId: string | null
  reward: string
  couponCode: string | null
  color: string
  error?: boolean
  message?: string
  needsConfirmation?: boolean
  spinHistoryId?: string
}

interface RemainingInfo {
  used: number
  max: number
  remaining: number
  nextReset: string
}

interface WeeklyStatusInfo {
  claimed: boolean
  nextEligibleDate: string | null
}

export function SpinWheel({
  segments,
  onSpin,
  initialRemaining,
  initialWeeklyStatus,
}: {
  segments: WheelSegment[]
  onSpin: () => Promise<SpinResult>
  initialRemaining: RemainingInfo
  initialWeeklyStatus: WeeklyStatusInfo
}) {
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<SpinResult | null>(null)
  const [pendingConfirm, setPendingConfirm] = useState<SpinResult | null>(null)
  const [rotation, setRotation] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [remaining, setRemaining] = useState(initialRemaining)
  const [weeklyStatus, setWeeklyStatus] = useState(initialWeeklyStatus)
  const wheelRef = useRef<HTMLDivElement>(null)
  const spinCount = useRef(0)

  const refreshStatus = useCallback(async () => {
    const [r, w] = await Promise.all([
      getRemainingSpins(),
      getWeeklyCouponStatus(),
    ])
    setRemaining(r)
    setWeeklyStatus(w)
  }, [])

  const handleSpin = useCallback(async () => {
    if (spinning) return
    if (remaining.remaining <= 0) return

    setSpinning(true)
    setResult(null)
    setShowConfetti(false)

    try {
      const spinResult = await onSpin()

      if (spinResult.error) {
        setResult(spinResult)
        setSpinning(false)
        return
      }

      const targetIndex = segments.findIndex(
        (s) => s.label === spinResult.reward
      )
      const segmentAngle = 360 / segments.length
      const targetAngle =
        targetIndex >= 0
          ? 360 - targetIndex * segmentAngle - segmentAngle / 2
          : 0

      spinCount.current += 1
      const extraSpins = 5 + spinCount.current % 3
      const newRotation = rotation + 360 * extraSpins + targetAngle

      setRotation(newRotation)

      setTimeout(() => {
        if (spinResult.needsConfirmation) {
          setPendingConfirm(spinResult)
          // Don't show result yet, wait for confirmation
        } else {
          setResult(spinResult)
          if (spinResult.reward !== "Better Luck Next Time") {
            setShowConfetti(true)
          }
        }
        setSpinning(false)
        refreshStatus()
      }, 4000)
    } catch (err: any) {
      setResult({
        offerId: null,
        reward: err.message || "Something went wrong",
        couponCode: null,
        color: "#EF4444",
        error: true,
      })
      setSpinning(false)
    }
  }, [spinning, segments, onSpin, rotation, remaining.remaining, refreshStatus])

  const handleConfirm = async () => {
    if (!pendingConfirm?.spinHistoryId) return
    await confirmSpin(pendingConfirm.spinHistoryId)
    setResult(pendingConfirm)
    setPendingConfirm(null)
    if (pendingConfirm.reward !== "Better Luck Next Time") {
      setShowConfetti(true)
    }
    refreshStatus()
  }

  const handleSkip = async () => {
    if (!pendingConfirm?.spinHistoryId) return
    await skipSpin(pendingConfirm.spinHistoryId)
    setResult({
      offerId: null,
      reward: "Better Luck Next Time",
      couponCode: null,
      color: "#E5E7EB",
    })
    setPendingConfirm(null)
    refreshStatus()
  }

  const closeResult = () => {
    setResult(null)
    setShowConfetti(false)
  }

  const percentUsed = (remaining.used / remaining.max) * 100
  const isAtLimit = remaining.remaining <= 0

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Daily spin counter */}
      <div className="w-full max-w-xs">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="font-medium text-luxury-charcoal">
            {isAtLimit ? "Daily limit reached" : `${remaining.remaining}/${remaining.max} spins remaining`}
          </span>
          <span className="text-xs text-gray-500">
            {remaining.used}/{remaining.max}
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAtLimit ? "bg-red-400" : "bg-luxury-gold"
            }`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Weekly coupon banner */}
      {!weeklyStatus.claimed && weeklyStatus.nextEligibleDate === null && (
        <div className="w-full max-w-xs bg-luxury-gold/5 border border-luxury-gold/20 rounded-xl px-4 py-2.5 text-center">
          <p className="text-xs text-luxury-gold font-medium flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            You can claim <strong>1 reward per week</strong> — this spin could be your weekly claim!
          </p>
        </div>
      )}

      <div className="relative">
        <div
          ref={wheelRef}
          className="w-72 h-72 md:w-80 md:h-80 rounded-full shadow-2xl relative transition-transform duration-[4000ms] ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            background: `conic-gradient(${segments
              .map((seg, i) => {
                const start = (i / segments.length) * 100
                const end = ((i + 1) / segments.length) * 100
                return `${seg.color} ${start}% ${end}%`
              })
              .join(", ")})`,
          }}
        >
          <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
            <div className="text-center">
              <Gift className="w-8 h-8 text-luxury-gold mx-auto mb-1" />
              <span className="text-xs font-semibold text-luxury-charcoal">
                SPIN
              </span>
            </div>
          </div>
        </div>

        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-luxury-gold drop-shadow-lg" />
        </div>
      </div>

      <Button
        size="lg"
        onClick={handleSpin}
        disabled={spinning || isAtLimit}
        className={`min-w-[200px] text-lg ${isAtLimit ? "opacity-60" : ""}`}
      >
        {spinning ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Spinning...
          </span>
        ) : isAtLimit ? (
          <span className="flex items-center gap-2">
            Limit Reached
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Spin to Win
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </Button>

      <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-gray-600 truncate">{seg.label}</span>
          </div>
        ))}
      </div>

      {showConfetti && <Confetti active={showConfetti} />}

      {/* Weekly claim confirmation modal */}
      {pendingConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-slide-up">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: pendingConfirm.color + "20" }}
            >
              <Gift
                className="w-8 h-8"
                style={{ color: pendingConfirm.color }}
              />
            </div>
            <h3 className="text-2xl font-display font-bold text-luxury-charcoal mb-2">
              You Won!
            </h3>
            <p
              className="text-lg font-semibold mb-4"
              style={{ color: pendingConfirm.color }}
            >
              {pendingConfirm.reward}
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                This counts as your <strong>weekly reward</strong>. You can only claim 1 per week.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1"
              >
                Skip
              </Button>
              <Button onClick={handleConfirm} className="flex-1">
                Claim Reward
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Result modal */}
      {result && !pendingConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-slide-up">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: result.color + "20" }}
            >
              <Gift
                className="w-8 h-8"
                style={{ color: result.color }}
              />
            </div>
            <h3 className="text-2xl font-display font-bold text-luxury-charcoal mb-2">
              {result.reward === "Better Luck Next Time"
                ? "Better Luck!"
                : result.error
                ? "Oops!"
                : "Congratulations!"}
            </h3>
            <p
              className="text-lg font-semibold mb-4"
              style={{ color: result.color }}
            >
              {result.error ? result.message : result.reward}
            </p>
            {result.couponCode && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-500 mb-1">Your Coupon Code</p>
                <p className="text-xl font-bold tracking-wider text-luxury-charcoal font-mono">
                  {result.couponCode}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Show this code at our studio to redeem
                </p>
              </div>
            )}
            <Button onClick={closeResult} className="w-full">
              {result.reward === "Better Luck Next Time"
                ? "Try Again"
                : "Awesome!"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
