'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface AdminAction {
  id: string
  admin: {
    username: string
  }
  action_type: string
  target_type?: string
  details?: Record<string, unknown>
  created_at: string
}

export function RecentAdminActions() {
  const [actions, setActions] = useState<AdminAction[]>([])

  useEffect(() => {
    fetchActions()
  }, [])

  const fetchActions = async () => {
    try {
      const response = await fetch('/api/admin/actions?limit=10')
      const data = await response.json()
      
      if (response.ok) {
        setActions(data.actions || [])
      }
    } catch (error) {
      console.error('Error fetching actions:', error)
    }
  }

  const getActionColor = (type: string) => {
    switch (type) {
      case 'delete':
        return 'destructive'
      case 'create':
        return 'default'
      case 'update':
        return 'secondary'
      case 'ban':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Actions récentes</h2>
      <Card className="p-6">
        {actions.length > 0 ? (
          <div className="space-y-4">
            {actions.map((action) => (
              <div key={action.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={getActionColor(action.action_type)}>
                      {action.action_type}
                    </Badge>
                    <span className="text-sm font-medium">{action.admin.username}</span>
                  </div>
                  {action.target_type && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.target_type}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Aucune action récente
          </p>
        )}
      </Card>
    </div>
  )
}

