export const siteConfig = {
  name: "Signal Hunter",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@signalhunter.app",
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || "Signal Hunter",
  companyAddress:
    process.env.NEXT_PUBLIC_COMPANY_ADDRESS ||
    "Your registered business address, India",
  websiteUrl:
    process.env.NEXT_PUBLIC_APP_URL || "https://signal-hunter-neon.vercel.app",
};
