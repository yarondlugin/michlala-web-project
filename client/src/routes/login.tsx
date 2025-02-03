import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: Index,
})

function Index() {
  return (
    <div>
      <h3>Login page</h3>
    </div>
  )
}
