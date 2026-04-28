import { Hero } from "@/components/sections/hero";
import { TrustStrip } from "@/components/sections/trust-strip";
import { ClientLogos } from "@/components/sections/client-logos";
import { Services } from "@/components/sections/services";
import { WhoWeServe } from "@/components/sections/who-we-serve";
import { WhyMontana } from "@/components/sections/why-montana";
import { TechStack } from "@/components/sections/tech-stack";
import { DataResilienceFramework } from "@/components/sections/data-resilience-framework";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <WhoWeServe />
      <ClientLogos />
      <DataResilienceFramework />
      <Services />
      <TechStack />
      <WhyMontana />
    </>
  );
}
