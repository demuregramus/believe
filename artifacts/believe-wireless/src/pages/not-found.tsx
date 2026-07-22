import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex w-full items-center justify-center min-h-screen bg-white">
      <div className="text-center p-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-8">
          <AlertCircle className="h-12 w-12 text-gray-400" />
        </div>
        <h1 className="text-5xl font-display font-bold text-gray-900 mb-4 tracking-tight">404</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild size="lg" className="rounded-full font-bold px-8 h-14">
          <Link href="/">Back to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}
