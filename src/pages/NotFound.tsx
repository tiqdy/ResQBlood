import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Droplet } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--blush)] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center flex flex-col items-center bg-card border border-border p-8 sm:p-12 rounded-3xl shadow-sm">
        <div className="h-16 w-16 bg-secondary text-primary rounded-2xl flex items-center justify-center mb-6">
          <Droplet className="h-8 w-8" />
        </div>
        
        <h1 className="text-6xl font-bold text-foreground tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-3">Page Not Found</h2>
        <p className="text-muted-foreground text-sm sm:text-base mb-8 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved. Head back to your dashboard.
        </p>

        <Link to="/" className="w-full">
          <Button variant="primary" className="w-full shadow-lg shadow-primary/20">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
