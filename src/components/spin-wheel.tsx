"use client"

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react"
import Link from "next/link"
import { Gift, ArrowRight, AlertTriangle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Confetti } from "@/components/confetti"
import { getRemainingSpins, getWeeklyCouponStatus, confirmSpin, skipSpin } from "@/lib/actions"

function getRelativeTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = date - now
  if (diffMs <= 0) return "now"
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays > 7) return `on ${new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  if (diffDays > 1) return `in ${diffDays} days`
  if (diffDays === 1) return "tomorrow"
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
  if (diffHours > 1) return `in ${diffHours} hours`
  return "very soon"
}

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
  nextEligibleDate?: string
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
  isAuthenticated = false,
}: {
  segments: WheelSegment[]
  onSpin: () => Promise<SpinResult>
  initialRemaining: RemainingInfo
  initialWeeklyStatus: WeeklyStatusInfo
  isAuthenticated?: boolean
}) {
  const [spinning, setSpinning] = useState(false)
  const [decelerating, setDecelerating] = useState(false)
  const [result, setResult] = useState<SpinResult | null>(null)
  const [pendingConfirm, setPendingConfirm] = useState<SpinResult | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [remaining, setRemaining] = useState(initialRemaining)
  const [weeklyStatus, setWeeklyStatus] = useState(initialWeeklyStatus)
  const wheelRef = useRef<HTMLDivElement>(null)
  const ballRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const pendingResultRef = useRef<SpinResult | null>(null)
  const ballXRef = useRef(0)
  const ballYRef = useRef(0)
  const ballAngleRef = useRef(0)
  const ballSpeedRef = useRef(0)
  const wheelRotRef = useRef(0)
  const spinDirRef = useRef(1)
  const segmentOffsetRef = useRef(0.5)

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useLayoutEffect(() => {
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${wheelRotRef.current}deg)`
    }
  })

  const getWheelRadius = useCallback(() => {
    return wheelRef.current ? wheelRef.current.offsetWidth / 2 : 144
  }, [])

  const updateBallPosition = useCallback((x: number, y: number) => {
    if (!ballRef.current || !wheelRef.current) return
    const size = wheelRef.current.offsetWidth
    const cx = size / 2
    const cy = size / 2
    ballRef.current.style.left = `${cx + x}px`
    ballRef.current.style.top = `${cy + y}px`
  }, [])

  const refreshStatus = useCallback(async () => {
    const [r, w] = await Promise.all([
      getRemainingSpins(),
      getWeeklyCouponStatus(),
    ])
    setRemaining(r)
    setWeeklyStatus(w)
  }, [])

  const finishSpin = useCallback((spinResult: SpinResult) => {
    if (spinResult.needsConfirmation) {
      setPendingConfirm(spinResult)
    } else {
      setResult(spinResult)
      if (spinResult.reward !== "Better Luck Next Time") {
        setShowConfetti(true)
      }
    }
    setDecelerating(false)
    setSpinning(false)
    refreshStatus()
  }, [refreshStatus])

  const handleStop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (decelerating) return
    const spinResult = pendingResultRef.current
    if (!spinResult) return

    setDecelerating(true)

    const targetIndex = segments.findIndex(
      (s) => s.label === spinResult.reward
    )
    const segmentAngle = 360 / segments.length
    segmentOffsetRef.current = 0.2 + Math.random() * 0.6

    // --- Wheel target ---
    const currentVisual = ((wheelRotRef.current % 360) + 360) % 360
    const targetVisual = ((360 - (targetIndex + segmentOffsetRef.current) * segmentAngle) % 360 + 360) % 360
    let diff = targetVisual - currentVisual
    if (diff > 180) diff -= 360
    if (diff < -180) diff += 360
    const targetWheelRot = wheelRotRef.current + diff + 360 * spinDirRef.current

    // --- Ball target (orbital) ---
    const targetAngleDeg = (targetIndex + segmentOffsetRef.current) * segmentAngle
    const radius = getWheelRadius()
    const orbitRadius = radius - 22
    const targetRad = (targetAngleDeg * Math.PI) / 180
    const tx = orbitRadius * Math.sin(targetRad)
    const ty = -orbitRadius * Math.cos(targetRad)

    // Find shortest angular distance from current angle to target
    let currentAngleDeg = ballAngleRef.current % 360
    if (currentAngleDeg < 0) currentAngleDeg += 360
    let angularDiff = targetAngleDeg - currentAngleDeg
    if (angularDiff > 180) angularDiff -= 360
    if (angularDiff < -180) angularDiff += 360
    // Add extra rotations for visual distance (ball continues orbiting to slow down)
    angularDiff += 360 * (angularDiff >= 0 ? 2 : -2)

    const startWheelRot = wheelRotRef.current
    const startAngleDeg = ballAngleRef.current

    const totalRotation = targetWheelRot - wheelRotRef.current
    const WHEEL_SPEED = 3
    const duration = Math.max(2500, Math.min(4500, Math.abs(totalRotation) * 2 / WHEEL_SPEED * 1000 / 60))
    const startTime = performance.now()

    // For the drop bounce effect
    const dropBounceAmplitude = 12
    const dropProgressOffset = 0.85

    const animateDecel = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 2 * progress - progress * progress

      // Wheel rotation
      wheelRotRef.current = startWheelRot + (targetWheelRot - startWheelRot) * eased
      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${wheelRotRef.current}deg)`
      }

      // Ball follows circular path
      const interpAngleDeg = startAngleDeg + angularDiff * eased
      const interpRad = interpAngleDeg * (Math.PI / 180)

      // Drop effect: ball moves inward slightly at the end like falling into a slot
      let dropOffset = 0
      if (progress >= dropProgressOffset) {
        const dropProgress = (progress - dropProgressOffset) / (1 - dropProgressOffset)
        const bounce = Math.sin(dropProgress * Math.PI * 3) * (1 - dropProgress) * 0.5
        dropOffset = -(dropBounceAmplitude * dropProgress * (1 - bounce))
      }

      const currentOrbitRadius = orbitRadius + dropOffset
      ballXRef.current = currentOrbitRadius * Math.sin(interpRad)
      ballYRef.current = -currentOrbitRadius * Math.cos(interpRad)
      updateBallPosition(ballXRef.current, ballYRef.current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animateDecel)
      } else {
        wheelRotRef.current = targetWheelRot
        if (wheelRef.current) {
          wheelRef.current.style.transform = `rotate(${targetWheelRot}deg)`
        }
        ballXRef.current = tx
        ballYRef.current = ty
        updateBallPosition(tx, ty)
        ballAngleRef.current = targetAngleDeg
        ballSpeedRef.current = 0
        finishSpin(spinResult)
        pendingResultRef.current = null
      }
    }

    rafRef.current = requestAnimationFrame(animateDecel)
  }, [segments, finishSpin, decelerating, updateBallPosition, getWheelRadius])

  const handleSpin = useCallback(async () => {
    if (spinning || decelerating) return
    if (remaining.remaining <= 0) return

    setSpinning(true)
    setDecelerating(false)
    setResult(null)
    setShowConfetti(false)

    try {
      const spinResult = await onSpin()
      pendingResultRef.current = spinResult

      if (spinResult.error) {
        setResult(spinResult)
        setSpinning(false)
        return
      }

      const radius = getWheelRadius()
      const orbitRadius = radius - 22
      const initialAngle = Math.random() * 360
      ballAngleRef.current = initialAngle
      const spinDirection = Math.random() > 0.5 ? 1 : -1
      spinDirRef.current = spinDirection
      const initialSpeed = (8 + Math.random() * 4) * spinDirection * -1
      ballSpeedRef.current = initialSpeed
      const angleRad = initialAngle * (Math.PI / 180)
      ballXRef.current = orbitRadius * Math.sin(angleRad)
      ballYRef.current = -orbitRadius * Math.cos(angleRad)
      updateBallPosition(ballXRef.current, ballYRef.current)

      const WHEEL_SPEED = 3 * spinDirection
      const FRICTION = 0.999
      const animate = () => {
        // --- Ball orbital physics ---
        ballSpeedRef.current *= FRICTION
        ballAngleRef.current += ballSpeedRef.current
        const aRad = ballAngleRef.current * (Math.PI / 180)
        ballXRef.current = orbitRadius * Math.sin(aRad)
        ballYRef.current = -orbitRadius * Math.cos(aRad)
        updateBallPosition(ballXRef.current, ballYRef.current)

        // --- Spinning wheel ---
        wheelRotRef.current += WHEEL_SPEED
        if (wheelRef.current) {
          wheelRef.current.style.transform = `rotate(${wheelRotRef.current}deg)`
        }

        rafRef.current = requestAnimationFrame(animate)
      }

      rafRef.current = requestAnimationFrame(animate)
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
  }, [spinning, decelerating, onSpin, remaining.remaining, updateBallPosition])

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

      <div
        className={`relative transition-all duration-500 ${
          spinning && !decelerating
            ? "scale-105 drop-shadow-[0_0_30px_rgba(232,67,126,0.5)]"
            : "scale-100"
        }`}
      >
        {/* Spinning wheel */}
        <div className="relative">
          {/* Rim track — a subtle ring around the wheel where the ball orbits */}
          <div className="absolute -inset-3 rounded-full border-2 border-gray-300/40 pointer-events-none z-0" />

          {/* Pointer triangle at top */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-luxury-rose drop-shadow-lg" />
          </div>

          <div
            ref={wheelRef}
            className="w-72 h-72 md:w-80 md:h-80 rounded-full shadow-2xl relative"
            style={{
              transform: `rotate(${wheelRotRef.current}deg)`,
              background: `conic-gradient(${segments
                .map((seg, i) => {
                  const start = (i / segments.length) * 100
                  const end = ((i + 1) / segments.length) * 100
                  return `${seg.color} ${start}% ${end}%`
                })
                .join(", ")})`,
            }}
          >
            <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center z-10">
              <div className="text-center">
                <Gift className="w-8 h-8 text-luxury-gold mx-auto mb-1" />
                <span className="text-xs font-semibold text-luxury-charcoal">
                  SPIN
                </span>
              </div>
            </div>
          </div>

          {/* Roulette ball */}
          <div
            ref={ballRef}
            className="absolute z-20 pointer-events-none"
            style={{
              width: 22,
              height: 22,
              marginLeft: -11,
              marginTop: -11,
              opacity: spinning || decelerating ? 1 : 0,
              transition: "opacity 0.3s",
            }}
          >
            {/* Ball shadow */}
            <div className="absolute inset-0 rounded-full bg-black/20 translate-y-[2px] blur-[2px]" />
            {/* Ball body */}
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-gray-100 via-gray-300 to-gray-500 border-[2px] border-white/60 shadow-[0_0_12px_rgba(0,0,0,0.3)] flex items-center justify-center">
              {/* Shine highlight */}
              <div className="absolute top-[2px] left-[3px] w-[7px] h-[4px] bg-white/60 rounded-full rotate-[-30deg]" />
              <div className="w-[3px] h-[3px] bg-white/80 rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Stop button */}
      {spinning && !decelerating && (
        <button
          onClick={handleStop}
          className="relative min-w-[200px] bg-gradient-to-r from-luxury-gold to-luxury-rose text-white text-lg font-bold rounded-xl px-8 py-3 shadow-[0_0_20px_rgba(232,67,126,0.5)] hover:shadow-[0_0_35px_rgba(232,67,126,0.7)] transition-all duration-300 animate-pulse"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            STOP
          </span>
        </button>
      )}

      {/* Spin / disabled button */}
      {!spinning && !decelerating && (
        <Button
          size="lg"
          onClick={handleSpin}
          disabled={isAtLimit}
          className={`min-w-[200px] text-lg ${isAtLimit ? "opacity-60" : ""}`}
        >
          {isAtLimit ? (
            <span className="flex items-center gap-2">Limit Reached</span>
          ) : (
            <span className="flex items-center gap-2">
              Spin to Win
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      )}

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
            <p className="text-xs text-red-500 text-center mt-3">
              This counts as your weekly reward. You can only claim 1 per week.
            </p>
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
              {result.reward === "Better Luck Next Time" && result.nextEligibleDate
                ? "Already Claimed!"
                : result.reward === "Better Luck Next Time"
                ? "Better Luck!"
                : result.error
                ? "Oops!"
                : "Congratulations!"}
            </h3>
            <p
              className="text-lg font-semibold mb-4"
              style={{ color: result.color }}
            >
              {result.error
                ? result.message
                : result.reward === "Better Luck Next Time" && result.nextEligibleDate
                ? "You've already claimed a reward this week"
                : result.reward}
            </p>
            {result.nextEligibleDate && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-800 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  Next claim available <strong>{getRelativeTime(result.nextEligibleDate)}</strong>
                </p>
              </div>
            )}
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
            {!isAuthenticated && result.error ? (
              <Link
                href="/register"
                className="inline-flex items-center justify-center w-full rounded-xl bg-luxury-gold text-white text-lg font-bold px-8 py-3 hover:bg-luxury-gold/90 transition-colors"
              >
                Create Account & Play
              </Link>
            ) : (
              <Button onClick={closeResult} className="w-full">
                {result.reward === "Better Luck Next Time"
                  ? "Try Again"
                  : "Awesome!"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
