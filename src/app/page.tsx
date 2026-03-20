"use client";

import Link from "next/link";
import WorldGlobe from "@/components/ui/WorldGlobe";
import Footer from "@/components/Footer";
import { useActiveUsers } from "@/hooks/useActiveUsers";

export default function Home() {
  const { activeUsers } = useActiveUsers();
  return (
    <div className="relative w-full overflow-hidden bg-black text-white">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(220,38,38,0.25),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(220,38,38,0.15),transparent_40%)]" />

      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full max-w-7xl mx-auto px-6 py-24 lg:py-32 flex flex-col lg:flex-row items-center justify-between gap-20">

        {/* LEFT SIDE */}
        <div className="w-full lg:w-1/2 space-y-10 text-center lg:text-left">

          {/* Badge */}
          <div className="inline-block px-5 py-1.5 bg-red-900/30 border border-red-600/40 rounded-full text-red-400 text-xs font-medium uppercase tracking-widest">
            Your friendly neighborhood network
          </div>

          {/* Heading */}
          <h1 className="font-[var(--font-grotesk)] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.05] tracking-tight">
            <span className="block text-white drop-shadow-[0_0_25px_rgba(220,38,38,0.25)]">
              Swing Into the
            </span>
            <span className="block bg-gradient-to-r from-red-500 via-rose-400 to-red-600 text-transparent bg-clip-text">
              Conversation
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed tracking-wide font-light">
            OpenTL is a modern community hub designed for seamless voice, audio,
            and chat experiences. Connect instantly with ultra-low latency and
            uncompromised privacy.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-1"
            >
              Launch Web Hub
            </Link>

            <button className="px-8 py-4 text-lg font-medium bg-zinc-900 border border-zinc-700 rounded-xl hover:bg-zinc-800 hover:-translate-y-1 transition-all duration-300">
              Learn More
            </button>

          </div>

          {/* Users */}
          <div className="flex items-center gap-6 pt-6 justify-center lg:justify-start">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={`https://picsum.photos/seed/${i + 50}/100/100`}
                  className="w-10 h-10 rounded-full border-2 border-black hover:scale-110 transition-transform"
                  alt="User"
                />
              ))}
            </div>

            <p className="text-gray-500 text-sm tracking-wide">
              Join <span className="text-white font-medium">{activeUsers.toLocaleString()}</span> active users online
            </p>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-1/2 flex justify-center relative">

          <div className="relative w-full max-w-md lg:max-w-lg">
            <div className="absolute inset-0 bg-red-600/10 blur-3xl rounded-full"></div>
            <WorldGlobe />
          </div>

          {/* Floating Badge */}
          <div className="absolute top-6 right-6 bg-black/80 px-5 py-3 rounded-xl border border-red-600 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-semibold tracking-wide">
                {activeUsers.toLocaleString()} Connected
              </span>
            </div>
          </div>

        </div>

      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="relative w-full py-32 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-20">
            <h2 className="font-[var(--font-grotesk)] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-6">
              Designed for <span className="text-red-500">Modern Communities</span>
            </h2>

            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light">
              Powerful tools built for secure collaboration, immersive communication,
              and real-time engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

            {[
              {
                icon: "🎤",
                title: "Crystal Clear Voice",
                text: "Experience immersive spatial audio built for modern teams.",
              },
              {
                icon: "💬",
                title: "Real-Time Messaging",
                text: "Instant collaboration with rich media and smart reactions.",
              },
              {
                icon: "🔒",
                title: "Enterprise-Grade Security",
                text: "End-to-end encryption to ensure complete data protection.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:border-red-500/40 hover:-translate-y-3 hover:shadow-2xl hover:shadow-red-600/20 transition-all duration-500 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-xl mb-6 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition">
                  {item.icon}
                </div>

                <h3 className="text-xl font-semibold tracking-tight mb-3 group-hover:text-red-400 transition">
                  {item.title}
                </h3>

                <p className="text-gray-400 leading-relaxed font-light">
                  {item.text}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="w-full py-32 text-center bg-gradient-to-b from-zinc-950 to-black border-t border-zinc-900">
        <div className="max-w-3xl mx-auto px-6">

          <h2 className="font-[var(--font-grotesk)] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-8">
            Ready to Elevate Your Conversations?
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed mb-12 max-w-2xl mx-auto font-light">
            Join thousands of users building secure, high-performance communities
            powered by next-generation communication infrastructure.
          </p>

          <Link
            href="/dashboard"
            className="inline-block px-12 py-4 bg-red-600 rounded-xl font-semibold text-lg hover:bg-red-500 transition shadow-lg shadow-red-600/30 hover:-translate-y-1"
          >
            Get Started Now
          </Link>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <Footer />

    </div>
  );
}