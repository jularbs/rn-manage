//TODOS: AuthWrapper to check if user is logged in
import BreadcrumbsComponent from "@/components/Navigation/BreadcrumbsComponent"
import { NavigationSidebar } from "@/components/Navigation/NavigationSidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <SidebarProvider>
            <NavigationSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <BreadcrumbsComponent />
                    </div>
                </header>
                {/* Content */}
                {children}
            </SidebarInset>
        </SidebarProvider>
}