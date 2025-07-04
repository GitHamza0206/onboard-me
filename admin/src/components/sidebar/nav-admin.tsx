"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

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
import { Link, useLocation, useNavigate } from "react-router-dom"

export function NavAdmin({
  items,
}: {
  items: {
    title: string
    url?: string;
    icon?: LucideIcon
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {

  const location = useLocation();
  const navigate = useNavigate();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Mangement</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {

          const isActive =
            location.pathname === item.url ||
            (item.items && item.items.some((subItem) => location.pathname === subItem.url));

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  {item.items ? (

                    <SidebarMenuButton
                      tooltip={item.title}
                      className={isActive ? "bg-sidebar-primary text-sidebar-accent-foreground" : ""}
                    >
                      {item.icon && <item.icon size={16} />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" size={16} />
                    </SidebarMenuButton>
                  ) :
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={isActive ? "bg-sidebar-primary text-sidebar-accent-foreground" : ""}
                      onClick={() => navigate(item.url!)}
                    >
                        {item.icon && <item.icon size={16} />}
                        <span>{item.title}</span>
                    </SidebarMenuButton>
                  }
                </CollapsibleTrigger>
                {item.items && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const isSubActive = location.pathname === subItem.url;
                        return (
                          <SidebarMenuSubItem key={subItem.title} data-active={isSubActive}>
                            <SidebarMenuSubButton
                              asChild
                              className={isSubActive ? "text-sidebar-primary" : ""}
                            >
                              <Link to={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
