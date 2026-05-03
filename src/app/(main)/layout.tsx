import { AppChrome } from "@/components/app-chrome"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppChrome>{children}</AppChrome>
}
