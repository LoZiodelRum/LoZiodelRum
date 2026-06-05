'use client'

import { motion } from 'framer-motion'
import { MapPin, Trophy, ArrowUp, Wine } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Activity } from '@/lib/types'

interface ActivityItemProps {
  activity: Activity
  index: number
}

export function ActivityItem({ activity, index }: ActivityItemProps) {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'checkin':
        return <MapPin className="h-3 w-3" />
      case 'badge':
        return <Trophy className="h-3 w-3" />
      case 'level_up':
        return <ArrowUp className="h-3 w-3" />
      case 'drink':
        return <Wine className="h-3 w-3" />
      default:
        return null
    }
  }

  const getActivityText = () => {
    switch (activity.type) {
      case 'checkin':
        return (
          <>
            checked in at <span className="text-primary font-medium">{activity.venue_name}</span>
          </>
        )
      case 'badge':
        return (
          <>
            unlocked <span className="text-accent font-medium">{activity.badge_name}</span>
          </>
        )
      case 'level_up':
        return (
          <>
            reached <span className="text-primary font-medium">Level {activity.level}</span>
          </>
        )
      case 'drink':
        return (
          <>
            tried <span className="text-accent font-medium">{activity.drink_name}</span> at {activity.venue_name}
          </>
        )
      default:
        return null
    }
  }

  const getActivityColor = () => {
    switch (activity.type) {
      case 'checkin':
        return 'bg-primary/20 text-primary'
      case 'badge':
        return 'bg-accent/20 text-accent'
      case 'level_up':
        return 'bg-green-500/20 text-green-400'
      case 'drink':
        return 'bg-purple-500/20 text-purple-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="flex items-center gap-3 py-2"
    >
      <Avatar className="h-8 w-8 border border-border">
        <AvatarImage src={activity.user_avatar} alt={activity.user_name} />
        <AvatarFallback className="text-xs bg-muted">
          {activity.user_name.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">
          <span className="font-medium">{activity.user_name}</span>{' '}
          <span className="text-muted-foreground">{getActivityText()}</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className={`flex items-center justify-center h-6 w-6 rounded-full ${getActivityColor()}`}>
          {getActivityIcon()}
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {activity.timestamp}
        </span>
      </div>
    </motion.div>
  )
}
