'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Drink } from '@/lib/types'

interface DrinkCardProps {
  drink: Drink
  index: number
}

export function DrinkCard({ drink, index }: DrinkCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card className="relative w-[140px] overflow-hidden glass border-border/50 flex-shrink-0">
        {/* Drink Image */}
        <div className="relative h-28 overflow-hidden">
          <img
            src={drink.image_url}
            alt={drink.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          {/* New badge */}
          {drink.is_new && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-primary/90 text-primary-foreground border-0 text-[10px] px-1.5 py-0.5">
                NEW
              </Badge>
            </div>
          )}

          {/* Points badge */}
          {drink.points_bonus > 0 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-accent/90 text-accent-foreground border-0 text-[10px] px-1.5 py-0.5">
                +{drink.points_bonus} XP
              </Badge>
            </div>
          )}
        </div>

        {/* Drink Info */}
        <div className="p-2.5">
          <h4 className="font-medium text-sm text-foreground truncate">{drink.name}</h4>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            @ {drink.venue_name}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-primary">
              €{drink.price}
            </span>
            <Sparkles className="h-3.5 w-3.5 text-accent" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
