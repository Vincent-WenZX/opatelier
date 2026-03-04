import { Metadata } from "next"

import { SITE_NAME } from "@lib/constants"
import ProductShowcase from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: SITE_NAME,
  description: "Luxury footwear and clothing crafted with distinction.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const { collections } = await listCollections({
    fields: "id,handle,title",
  })

  let allProducts

  if (collections?.length) {
    // Fetch products from all collections for the showcase
    const productPromises = collections.map((collection) =>
      listProducts({
        regionId: region.id,
        queryParams: {
          collection_id: collection.id,
          limit: 4,
        },
      })
    )

    const results = await Promise.all(productPromises)
    allProducts = results.flatMap((r) => r.response.products)
  } else {
    // No collections — fetch all products directly
    const { response } = await listProducts({
      regionId: region.id,
      queryParams: {
        limit: 12,
      },
    })
    allProducts = response.products
  }

  if (!allProducts?.length) {
    return null
  }

  return <ProductShowcase products={allProducts} />
}
