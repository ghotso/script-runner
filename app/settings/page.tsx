import { Metadata } from 'next'
import SettingsForm from './settings-form'

export const metadata: Metadata = {
  title: 'Settings | Script Runner',
  description: 'Configure Script Runner settings',
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Settings</h1>
      <SettingsForm />
    </div>
  )
}

