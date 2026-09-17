import { useAuth } from '../../app/providers/AuthProvider';
// import { Button } from '../../components/ui/Button';
import './LandingScreen.css';

const highlights = [
  'Installable as a Progressive Web App on desktop and mobile.',
  'Feature-based architecture: auth, landing, and shared UI live in their own modules.',
  'Works offline once the app shell has been cached by the service worker.',
];

export function LandingScreen() {
  const { user, logout } = useAuth();

  return (
    <div className="landing-screen">
      <div className="landing-screen__hero">
        <h1 className="landing-screen__title">You're in, {user?.email ?? 'friend'}.</h1>
        <p className="landing-screen__intro">
          This is the Tedix Hunt landing page — the space authenticated users land on after
          signing in.
        </p>
      </div>

      <div className="landing-screen__panel">
        <h2 className="landing-screen__panel-title">What's set up</h2>
        {highlights.map((item) => (
          <p key={item} className="landing-screen__item">
            • {item}
          </p>
        ))}
      </div>

      <button onClick={() => void logout()} > Log out</button>
    </div>
  );
}
