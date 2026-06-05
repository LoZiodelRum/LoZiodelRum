'use client'

import { motion } from 'framer-motion'
import { Clock, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Event } from '@/lib/types'

interface EventCardProps {
  event: Event
  index: number
}

export function EventCard({ event, index }: EventCardProps) {
  const participantPercentage = (event.participants / event.max_capacity) * 100
  const spotsLeft = event.max_capacity - event.participants

  const tierStyles: Record<string, { badge: string; label: string }> = {
    vip: { badge: 'bg-amber-500/90 text-white', label: 'VIP' },
    premium: { badge: 'bg-purple-500/90 text-white', label: 'PREMIUM' },
    exclusive: { badge: 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white', label: 'EXCLUSIVE' },
  }

  const tier = event.points_multiplier >= 3 ? 'exclusive' : event.points_multiplier >= 2 ? 'premium' : 'vip'

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="flex-shrink-0"
    >
      <Card className="relative w-[150px] overflow-hidden glass border-border/40 group cursor-pointer">
        {/* Event Image */}
        <div className="relative h-[90px] overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          
          {/* Tier badge */}
          <div className="absolute top-2 left-2">
            <Badge className={cn("text-[9px] px-1.5 py-0.5 font-semibold border-0", tierStyles[tier].badge)}>
              {tierStyles[tier].label}
            </Badge>
          </div>
        </div>

        {/* Event Info */}
        <div className="p-2.5">
          <h3 className="font-semibold text-foreground text-xs truncate leading-tight">{event.title}</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{event.venue_name}</p>

          {/* Time and capacity row */}
          <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{event.participants}</span>
            </div>
          </div>
          
          {/* Spots left */}
          <p className={cn(
            "text-[10px] font-medium mt-1.5",
            spotsLeft <= 10 ? "text-red-400" : "text-primary"
          )}>
            Posti disponibili: {spotsLeft}
          </p>
        </div>
      </Card>
    </motion.div>
  )
}
