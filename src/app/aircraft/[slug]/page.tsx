import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { AIRFRAMES, COMPANY } from "@/lib/constants";

type AirframeKey = keyof typeof AIRFRAMES;

const AIRFRAME_KEYS = Object.keys(AIRFRAMES) as AirframeKey[];

const AIRFRAME_HERO_IMAGES: Record<string, { src: string; alt: string; position?: string }> = {
  hawker: {
    src: "/images/hawker-mx.jpg",
    alt: "Hawker aircraft undergoing maintenance at Plane Place Aviation",
    position: "center 30%",
  },
  citation: {
    src: "/images/hangar-work.jpg",
    alt: "PPA hangar operations with Citation aircraft",
    position: "center 20%",
  },
  challenger: {
    src: "/images/Challenger-MX.jpg",
    alt: "Challenger aircraft undergoing maintenance at Plane Place Aviation",
    position: "center 35%",
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
    src: "/images/challenger-in-shop.jpg",
    alt: "Challenger aircraft in the PPA shop undergoing maintenance",
  },
};

const AIRFRAME_FLEET_BACKGROUND: Record<string, { src: string; alt: string } | undefined> = {
  hawker: {
    src: "/images/Hawker-850-wide.jpg",
    alt: "Hawker 850 on the ramp",
  },
  challenger: {
    src: "/images/Challenger-350.jpg",
    alt: "Challenger 350 on the ramp",
  },
  citation: {
    src: "/images/Citation-680.jpg",
    alt: "Citation 680 Sovereign on the ramp",
  },
};

const AIRFRAME_GALLERY: Record<string, { src: string; alt: string }[]> = {
  hawker: [
    { src: "/images/hawker-mx.jpg", alt: "Hawker maintenance operations" },
    { src: "/images/Engine-MX.jpg", alt: "Hawker engine work" },
    { src: "/images/Hawker-XP.jpg", alt: "Hawker 800XP in hangar" },
  ],
  citation: [
    { src: "/images/Wing-MX-2.jpg", alt: "Citation wing inspection" },
    { src: "/images/Wing-MX.jpg", alt: "Citation underside wing work" },
    { src: "/images/Interior-Work.jpg", alt: "Citation interior maintenance" },
  ],
  challenger: [
    { src: "/images/challenger.jpg", alt: "Challenger aircraft at PPA" },
    { src: "/images/Winglet-Install-04.jpg", alt: "Challenger winglet structural work" },
    { src: "/images/Dalton-on-workstation.jpg", alt: "Technician performing Challenger maintenance" },
  ],
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
      alternates: {
        canonical: `https://ppa.aero/aircraft/${slug}`,
      },
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
  const fleetBg = AIRFRAME_FLEET_BACKGROUND[slug];
  const gallery = AIRFRAME_GALLERY[slug] || [];
  const otherAirframes = Object.values(AIRFRAMES).filter(
    (a) => a.slug !== slug
  );

  return (
    <>
      {/* Hero */}
      <section className="relative h-[65vh] min-h-[500px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImg.src}
            alt={heroImg.alt}
            fill
            className="object-cover"
            style={heroImg.position ? { objectPosition: heroImg.position } : undefined}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/40 to-ppa-black/10" />
        </div>

        <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-ppa-brass" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
              {airframe.manufacturer}
            </span>
          </div>
          <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl text-ppa-white leading-[0.85]">
            {airframe.name}
          </h1>
          <p className="mt-4 font-display text-2xl text-ppa-brass">
            {airframe.models.join(" / ")}
          </p>
        </div>
      </section>

      {/* Description + CTA */}
      <section className="py-16 lg:py-20 border-b border-ppa-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <p className="text-xl text-ppa-dark font-light leading-relaxed">
              {airframe.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-black bg-ppa-brass hover:bg-ppa-brass-light transition-all"
              >
                Request a Quote
              </Link>
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-brass border border-ppa-brass/40 hover:bg-ppa-brass/10 transition-all"
              >
                Call {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Models served — editorial spec rows */}
      <section
        className={`relative py-24 lg:py-32 overflow-hidden ${
          fleetBg ? "" : "bg-ppa-light"
        }`}
      >
        {fleetBg && (
          <>
            <Image
              src={fleetBg.src}
              alt={fleetBg.alt}
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-ppa-black/70" />
          </>
        )}
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between gap-8 mb-12 lg:mb-16 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`h-px w-8 ${
                    fleetBg ? "bg-ppa-brass-bright" : "bg-ppa-brass"
                  }`}
                />
                <span
                  className={`text-[11px] font-semibold uppercase tracking-[0.25em] ${
                    fleetBg ? "text-ppa-brass-bright" : "text-ppa-brass"
                  }`}
                >
                  Models We Service
                </span>
              </div>
              <h2
                className={`font-display text-4xl sm:text-5xl lg:text-6xl leading-[0.95] ${
                  fleetBg ? "text-ppa-white" : "text-ppa-black"
                }`}
              >
                The {airframe.name} Fleet
              </h2>
            </div>
            <p
              className={`text-sm max-w-xs ${
                fleetBg ? "text-ppa-light/80" : "text-ppa-muted"
              }`}
            >
              Every model in the {airframe.name} family — type-rated technicians,
              the tooling, and the parts network to support each one.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-12 lg:gap-x-10 pt-10 lg:pt-14">
            {airframe.models.map((model) => {
              const specs = (airframe.modelSpecs as Record<string, { class: string; engines: string; range: string }>)?.[model];
              const parts = model.match(/^(\d+)(.*)$/);
              const numberPart = parts?.[1] ?? model;
              const suffixPart = parts?.[2] ?? "";
              return (
                <div key={model} className="flex-1 min-w-[170px] text-center">
                  <p
                    className={`font-display text-4xl lg:text-5xl leading-[0.9] mb-8 ${
                      fleetBg ? "text-ppa-white" : "text-ppa-black"
                    }`}
                  >
                    {numberPart}
                    {suffixPart && (
                      <span className="font-normal text-[0.75em]">{suffixPart}</span>
                    )}
                  </p>
                  {specs && (
                    <dl
                      className={`divide-y border-y ${
                        fleetBg
                          ? "divide-ppa-brass-bright border-ppa-brass-bright"
                          : "divide-ppa-brass border-ppa-brass"
                      }`}
                    >
                      <div className="py-4">
                        <dt
                          className={`text-[10px] font-semibold uppercase tracking-[0.22em] mb-1.5 ${
                            fleetBg ? "text-ppa-brass-bright" : "text-ppa-muted"
                          }`}
                        >
                          Class
                        </dt>
                        <dd className={`text-sm ${fleetBg ? "text-ppa-light" : "text-ppa-dark"}`}>
                          {specs.class}
                        </dd>
                      </div>
                      <div className="py-4">
                        <dt
                          className={`text-[10px] font-semibold uppercase tracking-[0.22em] mb-1.5 ${
                            fleetBg ? "text-ppa-brass-bright" : "text-ppa-muted"
                          }`}
                        >
                          Engines
                        </dt>
                        <dd className={`text-sm ${fleetBg ? "text-ppa-light" : "text-ppa-dark"}`}>
                          {specs.engines}
                        </dd>
                      </div>
                      <div className="py-4">
                        <dt
                          className={`text-[10px] font-semibold uppercase tracking-[0.22em] mb-1.5 ${
                            fleetBg ? "text-ppa-brass-bright" : "text-ppa-muted"
                          }`}
                        >
                          Range
                        </dt>
                        <dd className={`text-sm ${fleetBg ? "text-ppa-light" : "text-ppa-dark"}`}>
                          {specs.range}
                        </dd>
                      </div>
                    </dl>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery strip */}
      {gallery.length > 0 && (
        <section>
          <div className="grid grid-cols-3 gap-1">
            {gallery.map((photo) => (
              <div key={photo.src} className="aspect-[16/9] relative overflow-hidden img-zoom">
                <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Capabilities — cinematic full-bleed */}
      <section className="relative h-[85vh] min-h-[620px] overflow-hidden">
        <Image
          src={serviceImg.src}
          alt={serviceImg.alt}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ppa-black via-ppa-black/70 to-ppa-black/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16 lg:pb-24">
            <div className="max-w-2xl">
              <span className="font-display text-6xl lg:text-[8rem] text-ppa-brass-bright/40 leading-[0.85] block mb-3">
                {airframe.name}
              </span>
              <div className="flex items-center gap-3 mb-5">
                <span className="h-px w-8 bg-ppa-brass-bright" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass-bright">
                  Capabilities
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ppa-white leading-[0.95] mb-6">
                {airframe.name} Services
              </h2>
              <p className="text-lg text-ppa-light/85 font-light leading-relaxed mb-8 max-w-xl">
                Our technicians have deep, hands-on experience with every model
                in the {airframe.name} family. From routine phase inspections
                to complex structural work, we have the tooling, parts access,
                and type-specific knowledge to keep your {airframe.name} flying.
              </p>
              <div className="flex flex-wrap gap-2 mb-10 max-w-xl">
                {airframe.services.map((service) => (
                  <span
                    key={service}
                    className="text-xs text-ppa-white border border-ppa-white/30 px-3 py-1.5 backdrop-blur-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
              <Link
                href="/quote"
                className="inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-ppa-brass-bright hover:text-ppa-white transition-colors"
              >
                Get a Quote
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Other airframes */}
      <section className="py-20 lg:py-28 bg-ppa-light border-t border-ppa-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <h2 className="font-display text-3xl sm:text-4xl text-ppa-black leading-none mb-10">
            We Also Specialize In
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {otherAirframes.map((other) => {
              const otherImg = AIRFRAME_HERO_IMAGES[other.slug];
              return (
                <Link
                  key={other.slug}
                  href={`/aircraft/${other.slug}`}
                  className="group relative aspect-[2/1] overflow-hidden"
                >
                  <Image
                    src={otherImg.src}
                    alt={otherImg.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-ppa-black/50 group-hover:bg-ppa-black/30 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="font-display text-3xl text-ppa-white">
                      {other.name}
                    </h3>
                    <p className="text-sm text-ppa-brass mt-1">
                      {other.models.join(" / ")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
