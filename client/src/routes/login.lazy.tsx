import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/login')({
  component: Index,
})

function Index() {
  return (
    <div>
      <h3>Login page</h3>
    </div>
  )
}
