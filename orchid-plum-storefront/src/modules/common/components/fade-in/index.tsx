"use client"

import { motion } from "framer-motion"

type FadeInProps = {
    children: React.ReactNode
    delay?: number
    direction?: "up" | "down" | "left" | "right" | "none"
    className?: string
}

export default function FadeIn({
    children,
    delay = 0,
    direction = "none",
    className = "",
}: FadeInProps) {
    let y = 0
    let x = 0

    switch (direction) {
        case "up":
            y = 30
            break
        case "down":
            y = -30
            break
        case "left":
            x = 30
            break
        case "right":
            x = -30
            break
    }

    return (
        <motion.div
            initial={{ opacity: 0, y, x }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
                duration: 0.8,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98], // Custom ease-out calculation for a premium feel
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
