/**
 * 🏠 Index Route
 * Redirects to Explore mode as the default view
 */
import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  // 🔄 Redirect to explore as the main experience
  return <Navigate to="/explore" replace />
}
