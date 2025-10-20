"use client"

import {
  Users,
  Newspaper,
  Tag,
  Blocks,
  Podcast,
  ChevronRight,
  HouseIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import NavigationFooter from "./NavigationFooter"
import { isAuthorized } from "@/lib/utils"
import { useLocalStorage } from "usehooks-ts"
import { ADMIN_ROLE, MANAGER_ROLE, MANAGING_EDITOR_ROLE } from "@/lib/constants"

export function NavigationSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const [value,] = useLocalStorage("user", { _id: "", name: "", email: "", role: "" })


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-medium truncate">Radyo Natin</span>
                <span className="text-xs truncate">Content Management</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="!gap-0">
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <a href={process.env.NEXT_PUBLIC_WEB_DOMAIN} target="_blank" rel="noopener noreferrer">
                <SidebarMenuButton tooltip="Official Website">
                  <HouseIcon />
                  <span>Official Website</span>
                </SidebarMenuButton>
              </a>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Article Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Articles</SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible
              asChild
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Article Management">
                    <Newspaper />
                    <span>Post Management</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <a href={`/dashboard/post-management/create-post`}>
                          <span>Create New Post</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={`/dashboard/post-management/view-posts`}>
                          <span>View Posts</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            <SidebarMenuItem>
              <Link href="/dashboard/category-management">
                <SidebarMenuButton tooltip="Category Management">
                  <Blocks />
                  <span>Category Management</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/tag-management">
                <SidebarMenuButton tooltip="Tags Management">
                  <Tag />
                  <span>Tags Management</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Content Management Group */}
        {/* <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/sales-management">
                <SidebarMenuButton tooltip="About us Page">
                  <File />
                  <span>About us Page</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/sales-management">
                <SidebarMenuButton tooltip="Contact us Page">
                  <File />
                  <span>Contact us Page</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/sales-management">
                <SidebarMenuButton tooltip="Privacy Policy">
                  <File />
                  <span>Privacy Policy</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/sales-management">
                <SidebarMenuButton tooltip="Terms and Condition">
                  <File />
                  <span>Terms and Condition</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup> */}

        {/* Site Management Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Site Settings</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/streaming-management">
                <SidebarMenuButton tooltip="Streaming Settings">
                  <Podcast />
                  <span>Streaming Settings</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            {/* Show if admin or manager or managing editor */}
            {isAuthorized(value.role, [ADMIN_ROLE, MANAGER_ROLE, MANAGING_EDITOR_ROLE]) && (
              <SidebarMenuItem>
                <Link href="/dashboard/user-management">
                  <SidebarMenuButton tooltip="User Management">
                    <Users />
                    <span>User Management</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )}
            {/* <SidebarMenuItem>
              <Link href="/dashboard/activity-monitor">
                <SidebarMenuButton tooltip="Activity Monitor">
                  <Activity />
                  <span>Activity Monitor</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem> */}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <NavigationFooter />
      <SidebarRail />
    </Sidebar>
  )
}
