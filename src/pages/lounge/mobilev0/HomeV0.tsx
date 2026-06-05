'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, ChevronRight, Calendar, QrCode, MessageCircle, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { VenueCard } from './venue-card'
import { EventCard } from './event-card'
import { DrinkCard } from './drink-card'
import { ActivityItem } from './activity-item'
import { mockVenues, mockEvents, mockDrinks, mockActivities, mockUserProfile } from '@/lib/mock-data'

interface HomeScreenProps {
  onNavigate: (tab: string) => void
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [greeting, setGreeting] = useState('Ciao')
  const city = 'Milano'
  const neighborhood = 'Brera'
  
  // Set greeting on client side only to avoid hydration mismatch
  useEffect(() => {
    const currentHour = new Date().getHours()
    setGreeting(currentHour >= 18 || currentHour < 5 ? 'Buonasera' : 'Buongiorno')
  }, [])
  
  const xpProgress = (mockUserProfile.current_xp / mockUserProfile.xp_to_next_level) * 100
  
  // Format number with dots as thousand separators (Italian style)
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }
  
  // Stats for info boxes
  const tonightEventsCount = mockEvents.length
  const todayCheckinsCount = 47
  const communityOnlineCount = 47

  return (
    <div className="pb-28 min-h-screen">
      {/* Premium Header */}
      <header className="px-4 pt-6 pb-2">
        <div className="flex items-start justify-between">
          {/* Left: Greeting & Location */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs uppercase tracking-widest text-accent font-medium">
                {greeting}, {mockUserProfile.display_name.split(' ')[0]}
              </p>
              <span className="text-accent">👋</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-1">
              DrinkWise
            </h1>
            <div className="flex items-center gap-1 mt-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{city}, {neighborhood}</span>
            </div>
          </div>
          
          {/* Right: Level Avatar with XP Ring + XP Count */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Level badge */}
              <div className="absolute -top-1 -right-1 z-10 flex h-6 w-8 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-400 text-[10px] font-bold text-white shadow-lg">
                L{mockUserProfile.level}
              </div>
              
              {/* Avatar with XP ring */}
              <div className="relative">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                  {/* Background ring */}
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="oklch(0.25 0.02 260)"
                    strokeWidth="4"
                  />
                  {/* Progress ring */}
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="url(#xpGradientHome)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${xpProgress * 1.76} 176`}
                    initial={{ strokeDasharray: '0 176' }}
                    animate={{ strokeDasharray: `${xpProgress * 1.76} 176` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                  <defs>
                    <linearGradient id="xpGradientHome" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="oklch(0.75 0.15 195)" />
                      <stop offset="100%" stopColor="oklch(0.65 0.15 160)" />
                    </linearGradient>
                  </defs>
                </svg>
                <Avatar className="absolute inset-[8px] h-12 w-12 border-2 border-background">
                  <AvatarImage src={mockUserProfile.avatar_url} alt={mockUserProfile.display_name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                    {mockUserProfile.display_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            {/* XP Display */}
            <span className="text-xs text-muted-foreground mt-1.5">
              {formatNumber(mockUserProfile.total_xp)} XP
            </span>
          </div>
        </div>
      </header>

      {/* 4 Premium Info Boxes - 2x2 Grid */}
      <section className="px-4 mt-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Box Consiglio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card 
              className="overflow-hidden glass border-amber-500/30 p-3 cursor-pointer group h-[80px] flex flex-col justify-between"
              onClick={() => onNavigate('social')}
            >
              {/* Section 1: Title (20%) */}
              <div className="flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Consiglio</p>
                <div className="h-5 w-5 rounded-md bg-amber-500/20 flex items-center justify-center">
                  <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                </div>
              </div>
              {/* Section 2: Main Content (50%) */}
              <p className="text-xs font-bold text-foreground">Rum consigliato</p>
              {/* Section 3: Subtitle (30%) */}
              <p className="text-[9px] text-amber-400">Scopri di piu</p>
            </Card>
          </motion.div>

          {/* Box Eventi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card 
              className="overflow-hidden glass border-accent/30 p-3 cursor-pointer group h-[80px] flex flex-col justify-between"
              onClick={() => onNavigate('events')}
            >
              {/* Section 1: Title (20%) */}
              <div className="flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Eventi</p>
                <div className="h-5 w-5 rounded-md bg-accent/20 flex items-center justify-center">
                  <Calendar className="h-2.5 w-2.5 text-accent" />
                </div>
              </div>
              {/* Section 2: Main Content (50%) */}
              <p className="text-xl font-bold text-foreground">{tonightEventsCount}</p>
              {/* Section 3: Subtitle (30%) */}
              <p className="text-[9px] text-accent">In programma</p>
            </Card>
          </motion.div>

          {/* Box Check-In */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card 
              className="overflow-hidden glass border-primary/30 p-3 cursor-pointer group h-[80px] flex flex-col justify-between"
              onClick={() => onNavigate('map')}
            >
              {/* Section 1: Title (20%) */}
              <div className="flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Check-In</p>
                <div className="h-5 w-5 rounded-md bg-primary/20 flex items-center justify-center">
                  <QrCode className="h-2.5 w-2.5 text-primary" />
                </div>
              </div>
              {/* Section 2: Main Content (50%) */}
              <p className="text-xl font-bold text-foreground">{todayCheckinsCount}</p>
              {/* Section 3: Subtitle (30%) */}
              <p className="text-[9px] text-primary">Registrati oggi</p>
            </Card>
          </motion.div>

          {/* Box Bancone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card 
              className="overflow-hidden glass border-fuchsia-500/40 p-3 cursor-pointer group h-[80px] flex flex-col justify-between"
              onClick={() => onNavigate('social')}
              style={{
                boxShadow: '0 0 20px oklch(0.6 0.25 320 / 15%), inset 0 1px 0 oklch(0.8 0.2 320 / 20%)'
              }}
            >
              {/* Section 1: Title (20%) */}
              <div className="flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Bancone</p>
                <div className="h-5 w-5 rounded-md bg-fuchsia-500/20 flex items-center justify-center">
                  <MessageCircle className="h-2.5 w-2.5 text-fuchsia-400" />
                </div>
              </div>
              {/* Section 2: Main Content (50%) */}
              <p className="text-xs font-bold text-foreground">{communityOnlineCount} online</p>
              {/* Section 3: Subtitle (30%) */}
              <p className="text-[9px] text-fuchsia-400">Entra nella chat</p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Section 1: Locali Vicini a Te */}
      <section className="mt-3">
        <div className="px-4 mb-2">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Locali Vicini a Te</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {mockVenues.slice(0, 4).map((venue, index) => (
            <VenueCard key={venue.id} venue={venue} index={index} />
          ))}
        </div>
      </section>

      {/* Section 2: Stasera in Evidenza */}
      <section className="mt-8">
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="text-base font-bold text-foreground uppercase tracking-wide">Stasera in Evidenza</h2>
          <button className="flex items-center gap-1 text-xs text-accent font-semibold uppercase tracking-wide">
            Tutti gli eventi
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {mockEvents.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>
      </section>

      {/* Section 3: Attività Live */}
      <section className="mt-8 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground uppercase tracking-wide">Attività Live</h2>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-400">Aggiornamenti in tempo reale</span>
            </span>
          </div>
          <button 
            onClick={() => onNavigate('social')}
            className="text-xs text-primary font-semibold uppercase tracking-wide"
          >
            Vedi tutto
            <ChevronRight className="h-3.5 w-3.5 inline ml-0.5" />
          </button>
        </div>
        <Card className="glass border-border/30 overflow-hidden">
          <div className="divide-y divide-border/20">
            {mockActivities.slice(0, 3).map((activity, index) => (
              <ActivityItem key={activity.id} activity={activity} index={index} />
            ))}
          </div>
        </Card>
      </section>

      {/* Section 4: Nuovi Cocktail */}
      <section className="mt-8 mb-4">
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="text-base font-bold text-foreground uppercase tracking-wide">Nuovi Cocktail</h2>
          <button className="flex items-center gap-1 text-xs text-primary font-semibold uppercase tracking-wide">
            Scopri tutti
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {mockDrinks.map((drink, index) => (
            <DrinkCard key={drink.id} drink={drink} index={index} />
          ))}
        </div>
      </section>
    </div>
  )
}
