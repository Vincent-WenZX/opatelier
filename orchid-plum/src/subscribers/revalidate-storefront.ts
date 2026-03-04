import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

const STOREFRONT_URL = process.env.STOREFRONT_URL || "https://www.opatelier.com"
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "supersecret"

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function revalidateStorefront({ event }: SubscriberArgs<Record<string, unknown>>) {
  // Debounce: batch multiple rapid changes into one revalidation call
  if (debounceTimer) clearTimeout(debounceTimer)

  debounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(`${STOREFRONT_URL}/api/revalidate`, {
        method: "POST",
        headers: { "x-revalidate-secret": REVALIDATE_SECRET },
      })
      const data = await res.json()
      console.log(`[revalidate] ${event.name} → storefront revalidated`, data)
    } catch (err) {
      console.error(`[revalidate] Failed to revalidate storefront:`, err)
    }
  }, 2000)
}

export default revalidateStorefront

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
    "product-category.created",
    "product-category.updated",
    "product-category.deleted",
  ],
}
