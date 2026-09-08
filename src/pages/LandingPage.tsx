import { HuntPreview } from '../components/HuntPreview'
import { signalClujPreview } from '../data/huntPreviews'

export function LandingPage() {
  return <HuntPreview hunt={signalClujPreview} />
}
