import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/checkoutp/"],
      },
    ],
    sitemap: "https://tedxiitpatna.iitp.ac.in/sitemap.xml",
  };
}
