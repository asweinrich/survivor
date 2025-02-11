// metadata.ts
import type { Metadata } from "next";

export const metadata = {
  title: "Survivor Fantasy App",
  description: "Welcome to the ultimate Survivor Fantasy League! Draft your tribe and earn weekly points based on gameplays. Outwit, outplay, outpick!",
  openGraph: {
    title: "Survivor Fantasy App",
    description: "Welcome to the ultimate Survivor Fantasy League! Draft your tribe and earn weekly points based on gameplays. Outwit, outplay, outpick!",
    image: [
      {
        url: "https://survivorfantasy.app/meta-image.png",
        width: 1024,
        height: 780,
        alt: "Your website preview",
      },
    ],
    type: "website",
    locale: "en_US",
    url: "https://survivorfantasy.app",
  },
  twitter: {
    card: "summary_large_image",
    site: "@yourtwitterhandle",
    title: "Survivor Fantasy App",
    description: "Welcome to the ultimate Survivor Fantasy League! Draft your tribe and earn weekly points based on gameplays. Outwit, outplay, outpick!",
    images: ["https://survivorfantasy.app/meta-image.png"],
  },
};
