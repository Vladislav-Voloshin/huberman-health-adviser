export function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Craftwell",
    url: "https://craftwell.vercel.app",
    description:
      "Evidence-based health protocols ranked by effectiveness. Build your optimal routine with science-backed tools for sleep, focus, exercise, and more.",
    applicationCategory: "HealthApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "Craftwell",
      url: "https://craftwell.vercel.app",
    },
    featureList: [
      "Science-based health protocols",
      "AI-powered health recommendations",
      "Personalized wellness routines",
      "Evidence-ranked protocols for sleep, focus, and exercise",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
