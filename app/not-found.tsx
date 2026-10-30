import Link from "next/link";
export default function NotFound() {
  return (
    <div className="flex h-svh w-full flex-col items-center justify-center bg-background text-center">
      <h1 className="font-display text-4xl font-bold text-foreground">
        404 - Page Not Found
      </h1>
      <p className="mt-2 text-muted-foreground">
        The page you are looking for does not exist in the MindSpace platform.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-primary px-6 py-2 text-primary-foreground font-semibold hover:bg-primary/90"
      >
        Return Home
      </Link>
    </div>
  );
}
