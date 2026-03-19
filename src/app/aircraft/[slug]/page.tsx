import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { AIRFRAMES, COMPANY } from "@/lib/constants";

type AirframeKey = keyof typeof AIRFRAMES;

const AIRFRAME_KEYS = Object.keys(AIRFRAMES) as AirframeKey[];

const AIRFRAME_HERO_IMAGES: Record<string, { src: string; alt: string }> = {
  hawker: {
    src: "/images/Engine-MX.jpg",
    alt: "PPA technician performing engine maintenance on a Hawker jet",
  },
  citation: {
    src: "/images/Winglet-Install-06.jpg",
    alt: "PPA technician working underneath a Citation aircraft in the hangar",
  },
  challenger: {
    src: "/images/Winglet-Install-04.jpg",
    alt: "PPA technician riveting structural components on a Challenger winglet",
  },
};

const AIRFRAME_SERVICE_IMAGES: Record<string, { src: string; alt: string }> = {
  hawker: {
    src: "/images/Winglet-MX---James02.jpg",
    alt: "Senior PPA technician performing precision work on a Hawker wing",
  },
  citation: {
    src: "/images/Wing-MX-2.jpg",
    alt: "Two PPA technicians inspecting Citation aircraft underside",
  },
  challenger: {
    src: "/images/Winglet-Install---01.jpg",
    alt: "PPA team collaborating on Challenger structural maintenance",
  },
};

export function generateStaticParams() {
  return AIRFRAME_KEYS.map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const airframe = AIRFRAMES[slug as AirframeKey];
    if (!airframe) return {};
    return {
      title: `${airframe.name} Maintenance & Inspections — ${airframe.models.join(", ")}`,
      description: `FAA Part 145 specialist maintenance for ${airframe.name} ${airframe.models.join(", ")} aircraft. Phase inspections, pre-purchase inspections, AOG response, and more in Cleburne, Texas.`,
    };
  });
}

export default async function AirframePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const airframe = AIRFRAMES[slug as AirframeKey];

  if (!airframe) {
    notFound();
  }

  const heroImg = AIRFRAME_HERO_IMAGES[slug];
  const serviceImg = AIRFRAME_SERVICE_IMAGES[slug];
  const otherAirframes = Object.values(AIRFRAMES).filter(
    (a) => a.slug !== slug
  );

  return (
    <>
      {/* Hero with background image */}
      <section className="pt-44 pb-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImg.src}
            alt={heroImg.alt}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-ppa-navy/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-ppa-navy/90 via-ppa-navy/60 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-ppa-accent text-sm font-semibold uppercase tracking-wider mb-4">
              {airframe.manufacturer}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              {airframe.name} Maintenance
            </h1>
            <p className="text-xl text-ppa-accent-bright font-medium mb-6">
              {airframe.models.join(" / ")}
            </p>
            <p className="text-lg text-ppa-gray-light leading-relaxed mb-8 max-w-2xl">
              {airframe.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-ppa-accent hover:bg-ppa-accent-bright rounded-xl transition-all shadow-lg shadow-ppa-accent/25"
              >
                Request a Quote
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-ppa-gold border border-ppa-gold/30 hover:bg-ppa-gold/10 rounded-xl transition-all"
              >
                <PhoneIcon className="h-4 w-4" />
                Call {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Models served */}
      <section className="py-20 bg-ppa-navy-light border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-light tracking-wide text-white mb-12 text-center">
            Models We Service
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {airframe.models.map((model) => (
              <div
                key={model}
                className="glass-card rounded-xl px-8 py-7 text-center"
              >
                <p className="text-3xl font-bold text-white">
                  {airframe.name}
                </p>
                <p className="text-2xl text-ppa-accent-bright font-semibold">
                  {model}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services for this airframe */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {airframe.name} Services
              </h2>
              <p className="text-ppa-gray-light leading-relaxed mb-8">
                Our technicians have deep, hands-on experience with every
                model in the {airframe.name} family. From routine phase
                inspections to complex structural work, we have the tooling,
                parts access, and type-specific knowledge to keep your{" "}
                {airframe.name} flying.
              </p>
              <ul className="space-y-4">
                {airframe.services.map((service) => (
                  <li key={service} className="flex items-start gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-ppa-success flex-shrink-0 mt-0.5" />
                    <span className="text-ppa-gray-light">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Real service photo */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
              <Image
                src={serviceImg.src}
                alt={serviceImg.alt}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Other airframes */}
      <section className="py-20 bg-ppa-navy-light border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            We Also Specialize In
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {otherAirframes.map((other) => (
              <Link
                key={other.slug}
                href={`/aircraft/${other.slug}`}
                className="glass-card rounded-2xl p-8 group hover:-translate-y-1 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-white group-hover:text-ppa-accent-bright transition-colors">
                  {other.name}
                </h3>
                <p className="text-sm text-ppa-accent mt-1">
                  {other.models.join(" / ")}
                </p>
                <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-ppa-accent group-hover:text-ppa-accent-bright">
                  View capabilities
                  <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
