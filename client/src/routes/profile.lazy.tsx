import { createLazyFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '../components/pages/ProfilePage'
import { useRestrictedPage } from '../hooks/useRestrictedPage'

const Profile = () => {
  const cookieDetails = useRestrictedPage()

  return (
    cookieDetails && (
      <ProfilePage userId={cookieDetails?.userId} isEditable={true} />
    )
  )
}

export const Route = createLazyFileRoute('/profile')({
  component: Profile,
})
