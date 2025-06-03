'use client'

export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Spark Innovation Platform",
    "description": "Join a global community of innovators. Share ideas, collaborate on projects, and bring your vision to life with AI-powered tools.",
    "url": "https://spark-frontend-59cy.onrender.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "2500"
    },
    "creator": {
      "@type": "Organization",
      "name": "Spark Platform",
      "url": "https://spark-frontend-59cy.onrender.com"
    },
    "featureList": [
      "AI-powered idea generation",
      "Real-time collaboration",
      "Project management tools",
      "Global community network",
      "Expert mentorship",
      "Startup development support"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}