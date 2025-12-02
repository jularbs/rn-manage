"use client"

import {
  Users,
  Newspaper,
  Tag,
  Blocks,
  ChevronRight,
  HouseIcon,
  RadioTowerIcon,
  MicIcon,
  FileUser,
  FileIcon,
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
import { ABOUT_US_SLUG, ADMIN_ROLE, ADVERTISE_WITH_US_SLUG, MANAGER_ROLE, MANAGING_EDITOR_ROLE, PRIVACY_POLICY_SLUG, TERMS_OF_USE_SLUG } from "@/lib/constants"

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
        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href={`/dashboard/page-management/${ABOUT_US_SLUG}`}>
                <SidebarMenuButton tooltip="About us Page">
                  <FileIcon />
                  <span>About us Page</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href={`/dashboard/page-management/${PRIVACY_POLICY_SLUG}`}>
                <SidebarMenuButton tooltip="Privacy Policy">
                  <FileIcon />
                  <span>Privacy Policy</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href={`/dashboard/page-management/${TERMS_OF_USE_SLUG}`}>
                <SidebarMenuButton tooltip="Terms of Use">
                  <FileIcon />
                  <span>Terms of Use</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href={`/dashboard/page-management/${ADVERTISE_WITH_US_SLUG}`}>
                <SidebarMenuButton tooltip="Advertise with Us">
                  <FileIcon />
                  <span>Advertise with Us</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Site Management Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Site Settings</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/station-management">
                <SidebarMenuButton tooltip="Station Management">
                  <RadioTowerIcon />
                  <span>Station Management</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/jock-management">
                <SidebarMenuButton tooltip="Jock Management">
                  <FileUser />
                  <span>Jock Management</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/program-management">
                <SidebarMenuButton tooltip="Program Management">
                  <MicIcon />
                  <span>Program Management</span>
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
