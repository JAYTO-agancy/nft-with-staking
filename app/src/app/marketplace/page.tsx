"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Clock, Star } from "lucide-react";

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-12 text-white">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-xl">
            <ShoppingBag className="h-5 w-5 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-sm font-medium text-transparent">
              NFT Marketplace
            </span>
            <Clock className="h-5 w-5 text-purple-400" />
          </div>
          <h1 className="mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-5xl font-black text-transparent">
            MARKETPLACE
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            The ultimate NFT trading destination is coming soon. Get ready to
            buy, sell, and discover amazing Plumffel NFTs!
          </p>
        </motion.div>

        {/* Coming Soon Card */}
        <motion.div
          className="mx-auto max-w-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-12 text-center backdrop-blur-xl">
            <motion.div
              className="mb-6"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <ShoppingBag className="mx-auto h-24 w-24 text-purple-400" />
            </motion.div>

            <h2 className="mb-4 text-3xl font-bold text-white">
              Marketplace Coming Soon!
            </h2>

            <p className="mb-8 text-gray-400">
              We&apos;re building an amazing marketplace where you&apos;ll be
              able to:
            </p>

            <div className="grid gap-4 text-left md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-white">Buy & Sell NFTs</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-white">Filter by Rarity</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-white">Set Custom Prices</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-white">Auction System</span>
              </div>
            </div>

            <motion.div
              className="mt-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-sm font-medium text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Stay Tuned for Updates!
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
