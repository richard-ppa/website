import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { AIRFRAMES, COMPANY } from "@/lib/constants";

type AirframeKey = keyof typeof AIRFRAMES;

const AIRFRAME_KEYS = Object.keys(AIRFRAMES) as AirframeKey[];

const AIRFRAME_HERO_IMAGES: Record<string, { src: string; alt: string; position?: string }> = {
  hawker: {
    src: "/images/tech-on-lift.jpg",
    alt: "PPA technician working on a Hawker aircraft from a lift",
  },
  citation: {
    src: "/images/hangar-work.jpg",
    alt: "PPA hangar operations with Citation aircraft",
    position: "center 20%",
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

const AIRFRAME_GALLERY: Record<string, { src: string; alt: string }[]> = {
  hawker: [
    { src: "/images/PPA-01.jpg", alt: "Hawker maintenance operations" },
    { src: "/images/PPA-02.jpg", alt: "Hawker in PPA hangar" },
    { src: "/images/PPA-03.jpg", alt: "Hawker inspection work" },
  ],
  citation: [
    { src: "/images/PPA-10.jpg", alt: "Citation maintenance operations" },
    { src: "/images/PPA-11.jpg", alt: "Citation in PPA hangar" },
    { src: "/images/PPA-12.jpg", alt: "Citation detail work" },
  ],
  challenger: [
    { src: "/images/PPA-21.jpg", alt: "Challenger maintenance" },
    { src: "/images/PPA-22.jpg", alt: "Challenger in PPA hangar" },
    { src: "/images/PPA-23.jpg", alt: "Challenger detail work" },
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
            <p className="text-xl text-ppa-light font-light leading-relaxed">
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

      {/* Models served */}
      <section className="py-20 lg:py-28 bg-ppa-dark">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-ppa-brass" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
              Models We Service
            </span>
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            {airframe.models.map((model) => (
              <div
                key={model}
                className="border border-ppa-border px-8 py-6 text-center min-w-[160px]"
              >
                <p className="font-display text-3xl text-ppa-white leading-none">
                  {airframe.name}
                </p>
                <p className="font-display text-2xl text-ppa-brass mt-1">
                  {model}
                </p>
              </div>
            ))}
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

      {/* Services for this airframe */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ppa-brass" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                  Capabilities
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-ppa-white leading-none mb-6">
                {airframe.name} Services
              </h2>
              <p className="text-ppa-gray font-light leading-relaxed mb-10">
                Our technicians have deep, hands-on experience with every
                model in the {airframe.name} family. From routine phase
                inspections to complex structural work, we have the tooling,
                parts access, and type-specific knowledge to keep your{" "}
                {airframe.name} flying.
              </p>
              <ul className="space-y-4">
                {airframe.services.map((service) => (
                  <li key={service} className="flex items-start gap-3">
                    <span className="text-ppa-brass mt-1 text-sm">+</span>
                    <span className="text-ppa-light/80">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="aspect-[4/3] relative overflow-hidden">
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
      <section className="py-20 lg:py-28 bg-ppa-dark border-t border-ppa-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <h2 className="font-display text-3xl sm:text-4xl text-ppa-white leading-none mb-10">
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
