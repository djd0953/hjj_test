'use client'

import * as React from 'react'
import {
  AudioWaveform,
  LayoutDashboard,
  MessageCircleQuestionMark,
  ShieldUser,
  UserPen,
} from 'lucide-react'

import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar'

import { NavMain } from '@/components/ui/nav-main'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import LogoutButton from '../button/LogoutButton'

import { NavItem } from '@/types/defaultNavigator'
import { usePermission } from '@/hooks/usePermission'
import { PERMISSION_GROUPS, PERMISSIONS } from '@/libs/rbac'

const navData: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '자동작성',
    url: 'autodoc',
    icon: AudioWaveform,
    items: [
      { title: '자동작성', url: '/autodoc' },
      {
        title: '자동작성 Tool',
        url: '/autodoc/tool',
        permissions: [...PERMISSION_GROUPS.AI_CHAT_FULL],
      },
    ],
  },
  {
    title: 'NewsBoard',
    url: '/news-board',
    icon: LayoutDashboard,
    permissions: [PERMISSIONS.NEWSBOARD_READ],
  },
  {
    title: 'Profile',
    url: '#',
    icon: UserPen,
    items: [
      {
        title: 'My Profile',
        url: '/profile',
      },
      {
        title: 'Login History',
        url: '/profile/login-history',
      },
      {
        title: 'Login Failed History',
        url: '/profile/login-failed-history',
      },
    ],
  },
  {
    title: 'Admin',
    url: '#',
    icon: ShieldUser,
    items: [
      {
        title: 'Member List',
        url: '/admin/members',
      },
      {
        title: 'Excel Downloads',
        url: '/admin/excel-downloads',
      },

      {
        title: 'AI Prompts',
        url: '/admin/ai-prompts',
      },
    ],
  },
  {
    title: 'Q&A',
    url: '/qna',
    icon: MessageCircleQuestionMark,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { check, isLoading } = usePermission()

  const filteredNavMain = React.useMemo(() => {
    if (isLoading) return []
    return navData
      .map((item) => {
        if (item.items && item.items.length > 0) {
          const filteredItems = item.items.filter((subItem) => {
            if (!subItem.permissions) return true
            return check({ permissions: subItem.permissions })
          })

          if (filteredItems.length > 0) {
            return { ...item, items: filteredItems }
          }
        }

        if (!item.permissions) {
          return item.items && item.items.length > 0 ? null : item
        }

        return check({ permissions: item.permissions }) ? item : null
      })
      .filter((item): item is NavItem => item !== null)
  }, [check, isLoading])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>로고 삽입 영역</SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        {/*<NavUser user={data.user} /> */}
        <LogoutButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
