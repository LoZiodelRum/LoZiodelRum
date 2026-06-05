'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, X, MapPin, Trophy, Sparkles, Star, Target } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { mockUserProfile, mockVenues } from '@/lib/mock-data'

interface QRScannerScreenProps {
  onClose: () => void
}

export function QRScannerScreen({ onClose }: QRScannerScreenProps) {
  const [scanning, setScanning] = useState(true)
  const [scanned, setScanned] = useState(false)
  const [scanResult, setScanResult] = useState<{
    venue: typeof mockVenues[0]
    points: number
  } | null>(null)

  // Simulate scanning after a delay
  const handleSimulateScan = () => {
    setScanning(false)
    setTimeout(() => {
      const randomVenue = mockVenues[Math.floor(Math.random() * mockVenues.length)]
      setScanResult({
        venue: randomVenue,
        points: 150,
      })
      setScanned(true)
    }, 500)
  }

  // Calculate progress to next badge (50 venues for "Explorer" badge)
  const venuesForNextBadge = 50
  const venuesProgress = Math.min((mockUserProfile.total_venues_visited / venuesForNextBadge) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold text-foreground">Scan QR Code</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="h-10 w-10 rounded-full glass flex items-center justify-center"
        >
          <X className="h-5 w-5 text-foreground" />
        </motion.button>
      </div>

      {/* Scanner View */}
      <AnimatePresence mode="wait">
        {!scanned ? (
          <motion.div
            key="scanner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            {/* Scan Frame */}
            <div className="relative">
              {/* Corner decorations */}
              <motion.div
                className="relative h-64 w-64"
                animate={{
                  boxShadow: scanning ? [
                    '0 0 0 2px oklch(0.75 0.15 195 / 50%)',
                    '0 0 0 4px oklch(0.75 0.15 195 / 30%)',
                    '0 0 0 2px oklch(0.75 0.15 195 / 50%)',
                  ] : undefined
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {/* Top-left corner */}
                <div className="absolute top-0 left-0 h-12 w-12 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                {/* Top-right corner */}
                <div className="absolute top-0 right-0 h-12 w-12 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                {/* Bottom-left corner */}
                <div className="absolute bottom-0 left-0 h-12 w-12 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                {/* Bottom-right corner */}
                <div className="absolute bottom-0 right-0 h-12 w-12 border-b-4 border-r-4 border-primary rounded-br-2xl" />

                {/* Scanning line */}
                {scanning && (
                  <motion.div
                    className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                    initial={{ top: 16 }}
                    animate={{ top: [16, 240, 16] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: scanning ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 1, repeat: scanning ? Infinity : 0 }}
                  >
                    <QrCode className="h-16 w-16 text-primary/30" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Instructions */}
            <p className="mt-8 text-center text-muted-foreground">
              Inquadra il QR code del locale
            </p>

            {/* Progress Card - Exploration based */}
            <Card className="mt-6 mx-8 glass border-border/50 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {mockUserProfile.total_venues_visited} locali visitati
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {venuesForNextBadge - mockUserProfile.total_venues_visited} al prossimo badge
                  </p>
                </div>
              </div>
            </Card>

            {/* Demo Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSimulateScan}
              className="mt-8 px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold"
            >
              Simula Check-in (Demo)
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6"
          >
            {/* Success Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.5, 1.5], opacity: [1, 0, 0] }}
                transition={{ duration: 1 }}
              />
              <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center glow-turquoise">
                <Trophy className="h-12 w-12 text-primary-foreground" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-2xl font-bold text-foreground"
            >
              Check-in Completato!
            </motion.h2>

            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 w-full"
              >
                {/* XP Earned */}
                <Card className="glass border-primary/30 p-4 mb-4">
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <span className="text-2xl font-bold text-primary">
                      +{scanResult.points} XP
                    </span>
                  </div>
                </Card>

                {/* Venue Visited */}
                <Card className="glass border-border/50 p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={scanResult.venue.image_url}
                      alt={scanResult.venue.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{scanResult.venue.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{scanResult.venue.address}</span>
                      </div>
                      <Badge className="mt-1 bg-primary/20 text-primary border-0 text-xs">
                        {scanResult.venue.tier === 'exclusive' ? 'Exclusive' : 
                         scanResult.venue.tier === 'premium' ? 'Premium' : 'Entry'}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Badge Progress */}
                <Card className="glass border-accent/30 p-4 mt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                      <Star className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Badge Explorer</p>
                      <p className="text-xs text-muted-foreground">
                        {mockUserProfile.total_venues_visited + 1}/{venuesForNextBadge} locali
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={((mockUserProfile.total_venues_visited + 1) / venuesForNextBadge) * 100} 
                    className="h-2 bg-muted/30"
                  />
                </Card>

                {/* Stats update */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <Card className="glass border-border/50 p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{mockUserProfile.total_checkins + 1}</p>
                    <p className="text-xs text-muted-foreground">Check-in</p>
                  </Card>
                  <Card className="glass border-border/50 p-3 text-center">
                    <p className="text-2xl font-bold text-accent">{mockUserProfile.total_venues_visited + 1}</p>
                    <p className="text-xs text-muted-foreground">Locali</p>
                  </Card>
                  <Card className="glass border-border/50 p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">Lv.{mockUserProfile.level}</p>
                    <p className="text-xs text-muted-foreground">Livello</p>
                  </Card>
                </div>
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="mt-8 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold"
            >
              Fatto
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
