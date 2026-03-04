import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"
import logoIcon from "../assets/logo_icon.png"

const LoginBranding = () => {
  useEffect(() => {
    // Find the Medusa hexagon logo by its unique SVG viewBox
    const medusaSvg = document.querySelector('svg[viewBox="0 0 400 400"]')
    if (!medusaSvg) return

    // Structure: IconAvatar div > inner div > svg
    const avatarWrapper = medusaSvg.parentElement?.parentElement
    if (!avatarWrapper) return

    // Hide the Medusa logo
    avatarWrapper.style.display = "none"

    // Insert the O&P logo before the hidden Medusa logo
    const logoImg = document.createElement("img")
    logoImg.src = logoIcon
    logoImg.alt = "Orchid & Plum"
    logoImg.id = "op-login-logo"
    logoImg.style.height = "60px"
    logoImg.style.width = "auto"
    logoImg.style.marginBottom = "16px"

    avatarWrapper.parentElement?.insertBefore(logoImg, avatarWrapper)

    return () => {
      document.getElementById("op-login-logo")?.remove()
      avatarWrapper.style.display = ""
    }
  }, [])

  return null
}

export const config = defineWidgetConfig({
  zone: "login.before",
})

export default LoginBranding
