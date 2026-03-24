import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
      <main className="flex flex-col items-center gap-8 text-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-5xl">🍴</span>
          <h1 className="text-5xl font-bold text-gray-900">Cookit</h1>
        </div>

        {/* Tagline */}
        <p className="text-xl text-gray-600">
          Share your recipes. Cook with friends.
        </p>

        {/* CTA Button */}
        <Link
          href="/auth"
          className="rounded-lg bg-gray-900 px-8 py-3 text-white transition-colors hover:bg-gray-800"
        >
          Sign in with Google
        </Link>
      </main>
    </div>
  );
}
