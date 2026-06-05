'use client'

import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Venue } from '@/lib/types'

interface VenueCardProps {
  venue: Venue
  index: number
}

export function VenueCard({ venue, index }: VenueCardProps) {
  const tierStyles = {
    entry: {
      badge: 'bg-zinc-700/80 text-zinc-300 border-0',
      label: 'ENTRY',
    },
    premium: {
      badge: 'bg-purple-500/80 text-white border-0',
      label: 'PREMIUM',
    },
    exclusive: {
      badge: 'bg-amber-500/80 text-white border-0',
      label: 'EXCLUSIVE',
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="flex-shrink-0"
    >
      <Card className="relative w-[140px] overflow-hidden glass border-border/40 group cursor-pointer">
        {/* Venue Image */}
        <div className="relative h-[100px] overflow-hidden">
          <img
            src={venue.image_url}
            alt={venue.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          
          {/* Tier badge */}
          <div className="absolute top-2 left-2">
            <Badge className={cn("text-[9px] px-1.5 py-0.5 font-semibold", tierStyles[venue.tier].badge)}>
              {tierStyles[venue.tier].label}
            </Badge>
          </div>
        </div>

        {/* Venue Info */}
        <div className="p-2.5">
          <h3 className="font-semibold text-foreground text-sm truncate leading-tight">{venue.name}</h3>
          
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span>{venue.distance_km < 1 
              ? `${Math.round(venue.distance_km * 1000)}m` 
              : `${venue.distance_km.toFixed(1)} km`
            }</span>
          </div>
          
          {/* Open/Closed status */}
          <div className="flex items-center gap-1 mt-1.5">
            <span className={cn(
              "h-1.5 w-1.5 rounded-full",
              venue.is_open ? "bg-green-400" : "bg-red-400"
            )} />
            <span className={cn(
              "text-[11px] font-medium",
              venue.is_open ? "text-green-400" : "text-red-400"
            )}>
              {venue.is_open ? 'Aperto' : 'Chiuso'}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
