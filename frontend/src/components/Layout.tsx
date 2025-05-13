import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import { Container } from "./ui/container"

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow py-6 w-full">
        <Container size="full">
          <Outlet />
        </Container>
      </main>
      
      <footer className="bg-white border-t py-4 dark:bg-gray-900 dark:border-gray-800 w-screen">
        <Container size="full" className="text-center text-gray-500 dark:text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Time4Meds. All rights reserved.
        </Container>
      </footer>
    </div>
  )
} 