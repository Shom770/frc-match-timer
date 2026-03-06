'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type MatchPhase = 
  | 'pre-match'
  | 'auto'
  | 'grace'
  | 'transition'
  | 'shift-1'
  | 'shift-2'
  | 'shift-3'
  | 'shift-4'
  | 'endgame'
  | 'complete'

type AutoWinner = 'our-alliance' | 'opposing-alliance' | null

export default function Home() {
  const [phase, setPhase] = useState<MatchPhase>('pre-match')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [autoWinner, setAutoWinner] = useState<AutoWinner>(null)
  const [showFlash, setShowFlash] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const prevPhaseRef = useRef<MatchPhase>('pre-match')

  const phaseDurations: Record<MatchPhase, number> = {
    'pre-match': 0,
    'auto': 20,
    'grace': 3,
    'transition': 10,
    'shift-1': 25,
    'shift-2': 25,
    'shift-3': 25,
    'shift-4': 25,
    'endgame': 30,
    'complete': 0,
  }

  const getPhaseName = (phase: MatchPhase): string => {
    if (phase.startsWith('shift-')) {
      return isActivePeriod(phase) ? 'ACTIVE PERIOD' : 'INACTIVE PERIOD'
    }
    
    const phaseNames: Record<MatchPhase, string> = {
      'pre-match': 'Pre-Match',
      'auto': 'AUTO',
      'grace': 'GRACE PERIOD',
      'transition': 'TRANSITION SHIFT',
      'shift-1': '',
      'shift-2': '',
      'shift-3': '',
      'shift-4': '',
      'endgame': 'END GAME',
      'complete': 'Match Complete',
    }
    
    return phaseNames[phase]
  }

  const getPhaseColor = (phase: MatchPhase): string => {
    switch (phase) {
      case 'auto':
        return '#4FC3F7'
      case 'grace':
        return '#FFFFFF'
      case 'transition':
        return '#BA68C8'
      case 'shift-1':
      case 'shift-2':
      case 'shift-3':
      case 'shift-4':
        return isActivePeriod(phase) ? '#E57373' : '#64B5F6'
      case 'endgame':
        return '#AED581'
      default:
        return '#757575'
    }
  }

  const shouldShowFlowingGradient = (phase: MatchPhase): boolean => {
    if (phase === 'auto' || phase === 'transition' || phase === 'endgame') {
      return true
    }
    if (phase === 'grace') return false
    if (phase.startsWith('shift-')) {
      return isActivePeriod(phase)
    }
    return false
  }


  const isActivePeriod = (phase: MatchPhase): boolean => {
    if (phase === 'pre-match' || phase === 'auto' || phase === 'grace' || phase === 'transition' || phase === 'endgame' || phase === 'complete') {
      return false
    }
    
    if (!autoWinner) return false

    // The team that LOSES auto gets the first active period
    // If our alliance won auto (opposing lost):
    // shift-1: active (opposing), shift-2: inactive (our), shift-3: active (opposing), shift-4: inactive (our)
    // If opposing alliance won auto (our lost):
    // shift-1: active (our), shift-2: inactive (opposing), shift-3: active (our), shift-4: inactive (opposing)
    
    const shiftNum = parseInt(phase.split('-')[1])
    
    if (autoWinner === 'our-alliance') {
      // We won auto, so opposing (who lost) gets odd shifts (1, 3) - we are inactive first
      // So from our perspective: odd shifts are inactive, even shifts are active
      return shiftNum % 2 === 0 // shift-2 and shift-4 are active for us
    } else {
      // Opposing won auto, so we (who lost) get odd shifts (1, 3) - we are active first
      return shiftNum % 2 === 1 // shift-1 and shift-3 are active for us
    }
  }

  const getTotalMatchTime = (): number => {
    return 20 + 10 + 100 + 30 // grace period excluded
  }

  const getElapsedTime = (): number => {
    if (phase === 'pre-match') return 0
    if (phase === 'complete') return getTotalMatchTime()
    
    // Grace period doesn't count toward match time — treat it as still in auto
    if (phase === 'grace') return 20

    const phases: MatchPhase[] = ['auto', 'transition', 'shift-1', 'shift-2', 'shift-3', 'shift-4', 'endgame']
    const currentIndex = phases.indexOf(phase)
    
    let elapsed = 0
    for (let i = 0; i < currentIndex; i++) {
      elapsed += phaseDurations[phases[i]]
    }
    elapsed += phaseDurations[phase] - timeRemaining
    
    return elapsed
  }

  const getProgressPercentage = (): number => {
    if (phase === 'pre-match') return 0
    if (phase === 'complete') return 100
    const total = getTotalMatchTime()
    return (getElapsedTime() / total) * 100
  }

  const triggerFlash = (newPhase: MatchPhase) => {
    setShowFlash(true)
    setTimeout(() => setShowFlash(false), 600)
  }

  const startMatch = () => {
    if (!autoWinner) {
      alert('Please select who wins autonomous first!')
      return
    }
    setPhase('auto')
    setTimeRemaining(phaseDurations.auto)
    setIsRunning(true)
    prevPhaseRef.current = 'pre-match'
    triggerFlash('auto')
  }

  const resetMatch = () => {
    setIsRunning(false)
    setPhase('pre-match')
    setTimeRemaining(0)
    prevPhaseRef.current = 'pre-match'
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeRemaining])

  useEffect(() => {
    if (isRunning && timeRemaining === 0 && phase !== 'pre-match' && phase !== 'complete') {
      const phases: MatchPhase[] = ['auto', 'grace', 'transition', 'shift-1', 'shift-2', 'shift-3', 'shift-4', 'endgame']
      const currentIndex = phases.indexOf(phase)
      if (currentIndex < phases.length - 1) {
        const nextPhase = phases[currentIndex + 1]
        prevPhaseRef.current = phase
        setPhase(nextPhase)
        setTimeRemaining(phaseDurations[nextPhase])
        triggerFlash(nextPhase)
      } else {
        setIsRunning(false)
        setPhase('complete')
      }
    }
  }, [timeRemaining, phase, isRunning])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const showFlowingGradient = shouldShowFlowingGradient(phase)

  return (
    <main className="w-full min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden">
      {/* Bright red-yellow gradient background for active periods */}
      {showFlowingGradient && (
        <>
          <div 
            className="fixed inset-0 pointer-events-none z-0"
            style={{
              background: 'linear-gradient(135deg, #FF4500 0%, #FF6B00 25%, #FF8C00 50%, #FFA500 75%, #FFD700 100%)',
              opacity: 0.6,
            }}
          />
          {/* Flash effect when active period starts */}
          <AnimatePresence>
            {showFlash && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0.6] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                  background: 'linear-gradient(135deg, #FF4500 0%, #FF6B00 25%, #FF8C00 50%, #FFA500 75%, #FFD700 100%)',
                }}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {/* White/gray flash for inactive periods */}
      <AnimatePresence>
        {!showFlowingGradient && showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="fixed inset-0 bg-white pointer-events-none z-40"
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-12 w-full max-w-lg relative z-10">
        {/* Circular Timer */}
        <motion.div
          key={phase}
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center"
        >
          <svg viewBox="0 0 400 400" className="w-full h-full transform -rotate-90">
            <circle
              cx="200"
              cy="200"
              r="180"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="6"
            />
            <motion.circle
              cx="200"
              cy="200"
              r="180"
              fill="none"
              stroke={getPhaseColor(phase)}
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 180}
              strokeDashoffset={2 * Math.PI * 180 * (1 - getProgressPercentage() / 100)}
              initial={{ strokeDashoffset: 2 * Math.PI * 180 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 180 * (1 - getProgressPercentage() / 100) }}
              transition={{ duration: 0.1, ease: 'linear' }}
              className="transition-colors duration-200"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
            <motion.div
              key={phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium mb-6 text-gray-300 uppercase tracking-[0.15em]"
            >
              {getPhaseName(phase)}
            </motion.div>
            {phase === 'grace' ? (
              <motion.div
                key={`grace-${timeRemaining}`}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-8xl md:text-9xl font-bold text-white tabular-nums leading-none drop-shadow-lg"
                style={{ fontFamily: 'var(--font-hanken-grotesk)' }}
              >
                {timeRemaining}
              </motion.div>
            ) : (
              <>
                <motion.div
                  key={`time-${phase}-${timeRemaining}`}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className="text-6xl md:text-7xl font-bold text-white tabular-nums leading-none drop-shadow-lg"
                  style={{ fontFamily: 'var(--font-hanken-grotesk)' }}
                >
                  {phase === 'pre-match' 
                    ? '2:40' 
                    : phase === 'complete'
                    ? '0:00'
                    : formatTime(getTotalMatchTime() - getElapsedTime())}
                </motion.div>
                {phase !== 'pre-match' && phase !== 'complete' && (
                  <div className="text-lg text-gray-400 tabular-nums mt-2">
                    {formatTime(timeRemaining)}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Pre-Match Controls */}
        {phase === 'pre-match' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-6 w-full"
          >
            <div className="text-sm text-gray-400 mb-2">Who wins Autonomous?</div>
            <div className="flex gap-3 w-full max-w-sm">
              <button
                className={`flex-1 px-6 py-3 text-sm font-medium rounded-md transition-colors ${
                  autoWinner === 'our-alliance'
                    ? 'bg-white text-black'
                    : 'bg-gray-900 text-gray-300 border border-gray-800 hover:border-gray-700'
                }`}
                onClick={() => setAutoWinner('our-alliance')}
              >
                Our Alliance
              </button>
              <button
                className={`flex-1 px-6 py-3 text-sm font-medium rounded-md transition-colors ${
                  autoWinner === 'opposing-alliance'
                    ? 'bg-white text-black'
                    : 'bg-gray-900 text-gray-300 border border-gray-800 hover:border-gray-700'
                }`}
                onClick={() => setAutoWinner('opposing-alliance')}
              >
                Opposing Alliance
              </button>
            </div>
            <button
              className="px-8 py-3 text-sm font-medium bg-white text-black rounded-md transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              onClick={startMatch}
              disabled={!autoWinner}
            >
              Start Match
            </button>
          </motion.div>
        )}

        {/* Match Controls */}
        {phase !== 'pre-match' && phase !== 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 w-full max-w-sm"
          >
            <button
              className="flex-1 px-6 py-3 text-sm font-medium bg-gray-900/80 backdrop-blur-sm text-gray-300 border border-gray-800 rounded-md transition-colors hover:border-gray-700"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              className="flex-1 px-6 py-3 text-sm font-medium bg-gray-900/80 backdrop-blur-sm text-gray-300 border border-gray-800 rounded-md transition-colors hover:border-gray-700"
              onClick={resetMatch}
            >
              Reset
            </button>
          </motion.div>
        )}

        {/* Phase Scrubber */}
        {phase !== 'pre-match' && phase !== 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex w-full max-w-sm gap-1"
          >
            {([ 'auto', 'grace', 'transition', 'shift-1', 'shift-2', 'shift-3', 'shift-4', 'endgame'] as MatchPhase[]).map((p) => {
              const labels: Record<string, string> = {
                'auto': 'Auto',
                'grace': 'Grace',
                'transition': 'Trans',
                'shift-1': 'S1',
                'shift-2': 'S2',
                'shift-3': 'S3',
                'shift-4': 'S4',
                'endgame': 'End',
              }
              const isCurrent = phase === p
              const allPhases: MatchPhase[] = ['auto', 'grace', 'transition', 'shift-1', 'shift-2', 'shift-3', 'shift-4', 'endgame']
              const isPast = allPhases.indexOf(p) < allPhases.indexOf(phase)

              return (
                <button
                  key={p}
                  onClick={() => {
                    setPhase(p)
                    setTimeRemaining(phaseDurations[p])
                    setIsRunning(false)
                    triggerFlash(p)
                  }}
                  className={`flex-1 py-2 text-xs font-medium rounded transition-all ${
                    isCurrent
                      ? 'bg-white text-black'
                      : isPast
                      ? 'bg-gray-800 text-gray-500 border border-gray-700 hover:border-gray-600'
                      : 'bg-gray-900/80 text-gray-400 border border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {labels[p]}
                </button>
              )
            })}
          </motion.div>
        )}

        {/* Complete Match Controls */}
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-sm"
          >
            <button
              className="w-full px-6 py-3 text-sm font-medium bg-white text-black rounded-md transition-opacity hover:opacity-80"
              onClick={resetMatch}
            >
              New Match
            </button>
          </motion.div>
        )}
      </div>
    </main>
  )
}
