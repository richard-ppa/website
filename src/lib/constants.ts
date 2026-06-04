// PPA Brand Constants — Single source of truth for the website

export const COMPANY = {
  name: "Plane Place Aviation",
  shortName: "PPA",
  phone: "(817) 768-8884",
  phoneRaw: "8177688884",
  email: "info@ppa.aero",
  address: {
    street: "1650 Airport Dr, Hangar 98",
    city: "Cleburne",
    state: "TX",
    zip: "76033",
    airport: "KCPT — Cleburne Regional Airport",
  },
  founders: [
    {
      name: "Tristan Noe",
      title: "Co-Founder / Director of Maintenance",
      slug: "tristan",
    },
    {
      name: "Travis Roberson",
      title: "Co-Founder / VP of Maintenance",
      slug: "travis",
    },
  ],
  leadership: [
    {
      name: "Tristan Noe",
      title: "Co-Founder / Director of Maintenance",
      photo: "/images/Tristan.jpg",
    },
    {
      name: "Travis Roberson",
      title: "Co-Founder / VP of Maintenance",
      photo: "/images/Travis.jpg",
    },
    {
      name: "Ron Larson",
      title: "Accountable Manager",
      photo: "/images/Ron-Larson.jpg",
    },
    {
      name: "Ron Reiling",
      title: "Sales Manager",
      photo: "/images/Ron-Reiling.jpg",
    },
    {
      name: "Chris Zamora",
      title: "Citation Lead",
      photo: "/images/Chris-Zamora.jpg",
    },
    {
      name: "Angel Zamora",
      title: "Hawker Lead",
      photo: "/images/Angel-Zamora.jpg",
    },
    {
      name: "Dalton Friesenhahn",
      title: "Challenger Lead",
      photo: "/images/Dalton.jpg",
    },
    {
      name: "James Noe",
      title: "Hawker Service Advisor",
      photo: "/images/James-Noe.jpg",
    },
  ],
  tagline: "Precise. Professional. Attentive.",
  // FAA repair station certificate number — surfaced on customer-facing
  // documents (estimate cover pages, etc.).
  faaCert: "PLPR528E",
  siteUrl: "ppa.aero",
  stats: {
    airframesFamilies: "3",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/plane-place-aviation-llc",
    facebook: "https://www.facebook.com/Planeplaceaviation",
    instagram: "https://www.instagram.com/planeplaceaviationllc/",
  },
} as const;

export const AIRFRAMES = {
  hawker: {
    name: "Hawker",
    slug: "hawker",
    manufacturer: "Hawker Beechcraft",
    models: ["800", "800XP", "850XP", "900XP", "1000"],
    modelSpecs: {
      "800": { class: "Midsize", engines: "2× Honeywell TFE731-5R", range: "2,540 nm" },
      "800XP": { class: "Midsize", engines: "2× Honeywell TFE731-5BR", range: "2,540 nm" },
      "850XP": { class: "Midsize", engines: "2× Honeywell TFE731-5BR", range: "2,820 nm" },
      "900XP": { class: "Midsize", engines: "2× Honeywell TFE731-50R", range: "2,818 nm" },
      "1000": { class: "Super-midsize", engines: "2× P&WC PW305", range: "3,050 nm" },
    },
    description:
      "Deep expertise across the entire Hawker 800 series — from the classic 800 through the 900XP and 1000. Our technicians know these airframes inside and out.",
    services: [
      "B, C, D, E, F, G inspections",
      "4-year and 8-year inspections",
      "Landing gear overhaul",
      "Structural repairs",
      "Avionics upgrades",
      "Pre-purchase inspections",
      "AOG response",
    ],
    majorEvents: {
      eyebrow: "Major Maintenance Events",
      heading: "Hawker 8-Year Inspections & Major Events",
      paragraphs: [
        "Every 8 years, your Hawker is due for its major inspection — a heavy maintenance event that touches every system on the aircraft. Plane Place Aviation has extensive experience performing Hawker 8-year inspections across the Hawker 800, 800XP, 900XP, and 1000 fleet. Our technicians know these airframes intimately, and our shop is set up to plan, scope, and turn these events on schedule.",
        "We also support 4-year inspections, B/C/D/E/F/G phase inspections, landing gear overhaul, and avionics upgrades for the entire Hawker series. Our type-specific tooling and procedures are dedicated to this airframe family — not borrowed from a generic shop floor.",
        "Hawker parts availability has become an industry-wide pain point. Plane Place Aviation has access to extensive Hawker parts inventory and a parts-out partner on the field, which means we can keep your maintenance event moving instead of waiting weeks on a back-ordered component. When Hawker maintenance is what you need, we go above and beyond to surpass expectations on your aircraft.",
      ],
    },
    pillarSections: [
      {
        eyebrow: "Inspection Cadence",
        heading: "Hawker Inspection Intervals at a Glance",
        paragraphs: [
          "The Hawker 800 series Maintenance Planning Document (MPD) structures scheduled maintenance around lettered phase inspections — B, C, D, E, F, and G — that step up in scope as calendar time and flight hours accumulate. Lower-letter phases handle the routine items that come due frequently: zonal inspections, lubrication, system functional checks, and the long list of small tasks that keep an 800XP or 900XP healthy between heavier events. Higher-letter phases pull deeper into structure, systems, and components that only need attention every few years.",
          "On top of the phase cycle sit the calendar-driven 4-year and 8-year inspections. The 4-year event opens up areas the phase checks don't routinely reach — pressure bulkheads, control surface hinges, and corrosion-prone zones — and the 8-year event is the heavy one: it touches landing gear, flight controls, structure, and most of the systems on the aircraft. Operators planning a Hawker 800XP 8-year for the first time should expect a substantial scope, and the variability that comes with opening up a 20+ year-old airframe.",
          "We build a workscope around your specific aircraft — its hours, cycles, last event history, and any open items — rather than running a generic checklist. That up-front planning is where most of the schedule risk on a Hawker heavy event lives.",
        ],
      },
      {
        eyebrow: "Common Findings",
        heading: "What We See Often on Hawkers",
        paragraphs: [
          "After years of working only on the Hawker 800 series, the same items keep surfacing. Landing gear is one. The Hawker main gear is robust but accumulates wear in predictable places — trunnion bushings, drag brace pins, and side brace components — and a heavy event is usually where that wear gets called out. Many operators are surprised by how much of their 4-year or 8-year invoice ends up being gear-driven work, which is why we scope it carefully up front.",
          "Cabin pressurization is another recurring theme. Door seals, outflow valves, and pressure-bulkhead sealant all have a finite life, and a slow leak that the crew chalks up to a 'normal' Hawker quirk often turns out to be a real squawk. We pressure-test and isolate methodically rather than chasing symptoms.",
          "Avionics squawks tend to cluster around the legacy systems that were never quite upgraded: weather radar, autopilot, and aging cockpit instruments. We handle the troubleshooting in-house and partner with avionics shops for STC upgrades when an operator is ready to modernize. Structural inspections occasionally turn up corrosion in the wing-to-fuselage area and under the floorboards — items we know to look for and document carefully so they're tracked, not buried.",
        ],
      },
      {
        eyebrow: "Engines",
        heading: "Honeywell TFE731 & P&WC PW305 Notes",
        paragraphs: [
          "The Hawker 800, 800XP, and 850XP fly behind the Honeywell TFE731-5R and -5BR series; the 900XP stepped up to the TFE731-50R with DEEC (FADEC-class digital control) and an improved hot section. All share the same fundamental engine architecture, and our techs are familiar with the cadence — Minor Periodic Inspection (MPI), Core Zone Inspection (CZI), and the major event — that defines TFE731 life on wing.",
          "Hot section condition is the variable that drives the most schedule risk. A borescope finding that suggests early hot section work changes the planning conversation, and we want to have that conversation with the operator before it becomes an invoice surprise. We coordinate with Honeywell-authorized engine shops for off-wing work when it's required, and we manage the airframe-side work so the engine and airframe events line up rather than fighting each other on the calendar.",
          "The Hawker 1000 is a different conversation — Pratt & Whitney Canada PW305 power, super-midsize range, and a smaller installed base. The maintenance fundamentals carry over, but the engine support network is its own ecosystem and we plan accordingly.",
        ],
      },
      {
        eyebrow: "Parts Reality",
        heading: "How We Handle Hawker Parts",
        paragraphs: [
          "Hawker parts availability is the single most-asked-about topic on these airframes, and we'll give you the honest version: the supply chain is real-world strained. With Beechcraft no longer producing the 800 series and Textron's support posture evolving over the years, some line-replaceable units and structural components have moved from 'order it next week' to 'find it on the secondary market.' That's not a Plane Place Aviation problem — it's an industry problem — but it shapes how we plan every heavy event.",
          "Our response is operational, not promotional. We carry meaningful Hawker parts inventory in Cleburne, and we work with a parts-out partner on the field who has airframes in teardown. When we identify a long-lead item early in a workscope, we move on it immediately — which is one reason scoping conversations with our team happen up front, not three weeks into the event.",
          "When a part genuinely isn't available new, we'll talk through serviceable alternatives, repair options, or PMA paths and let you make the call. The goal is to keep your Hawker 800XP, 900XP, or 1000 on schedule without surprises buried inside the work order.",
        ],
      },
      {
        eyebrow: "Why PPA",
        heading: "Why Operators Choose Us for Hawker Work",
        paragraphs: [
          "We picked the Hawker family deliberately. Our Hawker techs aren't context-switching to a Challenger on Tuesday and back to an 800XP on Thursday — they live on these airframes. Our tooling is type-specific. Our parts inventory is type-specific. Our documentation templates are type-specific. That focus shows up in how quickly we scope a heavy event, how cleanly we close out a workpack, and how few surprises end up in your final invoice.",
          "Documentation is its own differentiator. Hawker maintenance records directly affect resale value, and a buyer's pre-purchase inspection team will scrutinize them. We deliver audit-ready, thorough records on every event — the kind that a Part 135 chief inspector or a future PPI team can read in order without having to call us for clarification. That care compounds: every clean workpack we produce is a small protection on the asset value of your aircraft.",
          "Founders Tristan Noe and Travis Roberson came up on large MRO floors before starting Plane Place Aviation. They've been on the receiving end of the customer call when an aircraft is down, and the shop they built reflects what they wished those calls had sounded like. That posture — answer the phone, scope honestly, deliver records you'd want to read — is the Hawker program we run.",
        ],
      },
    ],
  },
  citation: {
    name: "Citation",
    slug: "citation",
    manufacturer: "Cessna / Textron Aviation",
    models: ["550", "560", "560XL", "560XLS", "650", "680"],
    modelSpecs: {
      "550": { class: "Light-midsize", engines: "2× P&WC JT15D-4/-4B (II, S/II) or PW530A (Bravo)", range: "1,900 nm" },
      "560": { class: "Midsize", engines: "2× P&WC JT15D-5A/-5D (V, Ultra) or PW535A/B (Encore, Encore+)", range: "1,900 nm" },
      "560XL": { class: "Midsize", engines: "2× P&WC PW545A", range: "2,100 nm" },
      "560XLS": { class: "Midsize", engines: "2× P&WC PW545B (XLS) or PW545C (XLS+)", range: "2,100 nm" },
      "650": { class: "Midsize", engines: "2× Garrett TFE731-3B-100S (III, VI) or TFE731-4R-2S (VII)", range: "2,000 nm" },
      "680": { class: "Super-midsize", engines: "2× P&WC PW306C", range: "3,000 nm" },
    },
    description:
      "Full-service Citation maintenance from the 550 series through the 680 Sovereign — including the Citation 650. Whether it's a scheduled phase inspection or an unscheduled squawk, we have the tooling, parts, and type experience to turn your Citation quickly.",
    services: [
      "Phase inspections",
      "Annual inspections",
      "Landing gear service",
      "Structural repairs",
      "Avionics troubleshooting",
      "Pre-purchase inspections",
      "AOG response",
    ],
    majorEvents: {
      eyebrow: "Citation Maintenance",
      heading: "Phase Inspections & Heavy Events",
      paragraphs: [
        "Citation operators rely on Plane Place Aviation for full-service maintenance from the Citation 550 through the 680 Sovereign — including the Citation 560XL, 560XLS, and Citation 650. Phase 1 through Phase 5 inspections, annual inspections, structural repairs, landing gear service, and avionics troubleshooting are all handled in-house at our Cleburne, Texas hangar.",
        "Our Citation team has the type-specific tooling, parts access, and OEM documentation to turn your aircraft on schedule. We support owner-operators, charter departments, and aircraft management companies — and we deliver the audit-ready documentation that protects your aircraft's resale value.",
      ],
    },
    pillarSections: [
      {
        eyebrow: "Inspection Cadence",
        heading: "Citation Inspection Intervals at a Glance",
        paragraphs: [
          "The 560XL and 560XLS use a Phase 1 through Phase 5 inspection structure, with each phase coming due at defined calendar and hour intervals so that, across the cycle, every zone and system on the aircraft gets touched. Phase 1 and 2 handle the lighter recurring items; Phase 3 and 4 step up into systems and structure; Phase 5 is the heaviest of the routine cycle and where surprise scope tends to surface. Running these phases sequentially and on schedule is the difference between predictable maintenance budgets and the kind of compounding deferral that turns into an invoice problem two years later.",
          "The 550 and 560 share a related phase structure with their own document cycles, and the 680 Sovereign runs on a Textron-defined inspection program with its own intervals. The Citation 650 is its own conversation entirely — Garrett TFE731 engines, a different airframe lineage, and a maintenance cadence closer to a Hawker than to the rest of the Citation line. We plan each program separately rather than treating 'Citation' as one monolithic checklist.",
          "Every Citation in the shop gets a workscope built from its specific records: hours, cycles, prior findings, open ADs, and any deferred items. The MPD is the starting point, not the finished workpack.",
        ],
      },
      {
        eyebrow: "Common Findings",
        heading: "What We See Often on Citations",
        paragraphs: [
          "Landing gear and brake system items are a steady source of work across the Citation line. Wheel and brake assemblies, anti-skid components, gear actuators, and the various microswitches and proximity sensors that report gear position all wear at their own pace, and the higher-cycle airframes — particularly charter-flown 560XLs — show it first. We scope these items honestly up front rather than letting them surface mid-event.",
          "Environmental and pressurization systems are the next cluster. Bleed air leaks, pack issues, and outflow valve squawks are common on aircraft of this generation, and the symptoms often masquerade as something else — a 'noisy' cabin, a slow climb-rate in cabin altitude, a vague crew complaint. We isolate methodically rather than swapping parts and hoping.",
          "Avionics is where Citation operators feel the age of their aircraft most. Many older 550s, 560s, and 560XLs are running mixed-vintage avionics — original Honeywell or Collins suites with a Garmin overlay added over the years. Squawks tend to live at the integration seams. We handle troubleshooting in-house, document the path we took, and partner with avionics shops on STC upgrades when an operator is ready to step up to a current-generation cockpit.",
        ],
      },
      {
        eyebrow: "Engines",
        heading: "Pratt & Whitney Canada and Garrett Engine Notes",
        paragraphs: [
          "Most Citations in our shop are flying behind Pratt & Whitney Canada power: JT15D-4 series on the original 550 (II and S/II) and PW530A on the 550 Bravo; JT15D-5A and -5D on the 560 V and Ultra and PW535A on the Encore; PW545A on the 560XL and PW545B on the 560XLS (with PW545C on the XLS+); and PW306C on the 680 Sovereign. The PWC support network is mature, parts are generally available, and the engines themselves are reliable workhorses — but each model has its own inspection program, its own life-limited parts schedule, and its own borescope patterns we watch for.",
          "Hot section condition and trend monitoring data drive a lot of our planning conversations. When ITT margins start drifting or vibration trends show up, we want to have the off-wing conversation early rather than during an unscheduled event. We coordinate with PWC-authorized engine shops for off-wing work and manage the airframe-side timing so the engine and airframe events align.",
          "The Citation 650 runs the Garrett TFE731-3B — same engine family as the Hawker 800 series, just a different installation. Our Hawker techs and Citation techs sit on the same hangar floor, which means TFE731 knowledge is shared across both programs rather than siloed.",
        ],
      },
      {
        eyebrow: "Why PPA",
        heading: "Why Operators Choose Us for Citation Work",
        paragraphs: [
          "Our Citation program is led by Chris Zamora, who runs the day-to-day on the Citation floor and has the type training, tooling access, and OEM documentation pipeline to support every model from the 550 through the 680. Like the Hawker side of the shop, the Citation team doesn't context-switch to unrelated airframes — they live on these aircraft. That focus shows up in scope quality, parts planning, and the cleanliness of the close-out paperwork.",
          "We support owner-operators, corporate flight departments, charter operators, and aircraft management companies — each with different documentation expectations. A management company supervising a Citation on behalf of an owner needs records that survive scrutiny from the owner, the insurer, and the eventual buyer. A Part 135 charter director needs records that survive a chief inspector audit. We build every workpack to the higher of the two bars, so resale value and regulatory exposure both stay protected.",
          "Cleburne sits 30 minutes from DFW with materially lower operating costs than Love Field or Addison. For a Citation operator moving an aircraft into a heavy phase event, that delta shows up directly in the hourly labor rate — without compromising on facility, tooling, or technician quality.",
        ],
      },
      {
        eyebrow: "Owner Pain Points",
        heading: "What Most Operators Get Wrong About Citation Planning",
        paragraphs: [
          "The mistake we see most often is treating phase inspections as isolated events instead of a connected cycle. An operator pushes Phase 3 a little, lets Phase 4 catch up with deferred items, and by the time Phase 5 lands the workscope has compounded into something twice the size of what it should have been. We'd rather flag a small finding on Phase 2 and address it in scope than discover it as a bigger problem on Phase 5.",
          "The second mistake is under-budgeting for engine and gear events that run on their own clock. The phase cycle covers airframe maintenance; engine hot sections, gear overhauls, and certain accessory items follow separate intervals that don't always land on a convenient calendar. We help operators map a 24-to-36-month forward view so the cash-flow surprises stay small.",
          "The third is records discipline. Buyers and PPI teams will eventually read every page of a Citation's maintenance history, and a sloppy logbook reduces sale price more reliably than a worn-out airframe. We treat documentation as part of the work, not as something that happens after.",
        ],
      },
      {
        eyebrow: "Pre-Purchase",
        heading: "Pre-Purchase Inspections for Citation Buyers",
        paragraphs: [
          "Pre-purchase inspections are one of the most consequential events in a Citation owner's lifecycle — and one of the easiest to get wrong. A thin PPI saves a few thousand dollars at signing and costs a buyer fifty thousand a year later. We scope Citation PPIs with the assumption that whatever we find now is information the buyer will use at the negotiating table, so we'd rather call something honestly than soft-pedal it.",
          "Our PPI workscope is built around the specific aircraft on offer: model, age, mission profile, prior maintenance history, and any open items in the records. We run the inspection in-house with our Citation team, document findings with the kind of detail that survives an insurance or financing review, and walk buyers (or their brokers and management companies) through what we found before it shows up in a written report.",
          "We see brokers, aircraft management companies, and individual owner-operators on the buy side, and the workflow looks the same regardless: book the slot, fly or ferry the aircraft in, and we'll deliver a PPI that protects the buyer's decision rather than rubber-stamping a transaction.",
        ],
      },
    ],
  },
  challenger: {
    name: "Challenger",
    slug: "challenger",
    manufacturer: "Bombardier",
    models: ["300", "350", "604", "605", "650"],
    modelSpecs: {
      "300": { class: "Super-midsize", engines: "2× Honeywell HTF7000", range: "3,100 nm" },
      "350": { class: "Super-midsize", engines: "2× Honeywell HTF7350", range: "3,200 nm" },
      "604": { class: "Large-cabin", engines: "2× GE CF34-3B", range: "4,027 nm" },
      "605": { class: "Large-cabin", engines: "2× GE CF34-3B", range: "4,077 nm" },
      "650": { class: "Large-cabin", engines: "2× GE CF34-3B", range: "4,000 nm" },
    },
    description:
      "Specialist Challenger maintenance from the 300/350 through the 604/605/650. Our team delivers on complex inspection events, structural work, and everything in between.",
    services: [
      "96/192-month inspections",
      "Phase inspections",
      "Landing gear removal & overhaul",
      "Structural repairs",
      "Avionics systems",
      "Pre-purchase inspections",
      "AOG response",
    ],
    majorEvents: {
      eyebrow: "Major Maintenance Events",
      heading: "Challenger 300/350 96 & 192-Month Inspections",
      paragraphs: [
        "Every 96 and 192 months, your Challenger is due for a major inspection and landing gear removal. Plane Place Aviation has completed several of these inspections and gear removals — we have the tooling, knowledge, and attention to detail this maintenance requires.",
        "Our factory-trained Challenger 300/350 technicians are on staff to support your aircraft at all times. From routine 96-month events to comprehensive 192-month inspections, we bring deep airframe specialization to every job. We see the same patterns again and again across this fleet, which means we know what to look for and how to plan the work — including known structural findings in the main entry area that often surface during the 192-month event.",
        "Plane Place Aviation also supports Challenger 604, 605, and 650 maintenance. Whether you're scheduling a heavy maintenance event or facing an unscheduled squawk, our 24/7 AOG response covers Texas and Oklahoma — so when your Challenger is down, we come to you.",
      ],
    },
    pillarSections: [
      {
        eyebrow: "Inspection Cadence",
        heading: "Challenger Inspection Intervals at a Glance",
        paragraphs: [
          "The Challenger 300 and 350 are maintained under an MSG-3 framework — the same logic-driven inspection methodology used on modern transport-category aircraft — with scheduled maintenance triggered by hours, landings, and calendar time. The two anchors most operators plan around are the 96-month and 192-month inspections. The 96-month is a substantial calendar event that opens up systems, structure, and zonal areas on a defined schedule. The 192-month is the heavier of the two, and it's where landing gear removal and overhaul lands alongside expanded structural inspection.",
          "Between those calendar anchors, the 300/350 runs a cycle of lighter scheduled tasks — A-Checks and zonal inspections at shorter intervals — plus task cards that pop on hours or landings rather than calendar time. A high-utilization Challenger 350 in charter service will hit hour-triggered tasks well before a corporate aircraft on the same airframe, and we plan the workscope from your specific records, not a generic timeline.",
          "The 604, 605, and 650 sit on their own maintenance program lineage — longer-cabin, GE CF34-3B power, and an inspection cadence that's similar in structure to the 300/350 but distinct in detail. We run each program separately and won't apply a 350 workscope to a 605 just because both wear a Bombardier badge.",
        ],
      },
      {
        eyebrow: "Common Findings",
        heading: "What We See Often on Challengers",
        paragraphs: [
          "The most well-known finding on the Challenger 300/350 is corrosion in the main entry area — a pattern that surfaces on heavy events across the fleet and that we've written about separately on the PPA blog. The cause is straightforward: moisture intrusion at the door sill, combined with dissimilar materials and time, eventually shows up as corrosion in the surrounding structure. The fix is straightforward too, when it's caught early and scoped honestly. We know exactly where to look during a 192-month event and we plan around the possibility from day one of the workscope.",
          "Landing gear is the other big-ticket area, especially on the 192-month when gear removal and overhaul are part of the event. Our gear program is built around the specific Challenger 300/350 gear cycle, with the tooling, fixtures, and gear-shop partnerships to keep the off-aircraft work moving in parallel with the airframe-side work.",
          "Beyond those headliners, we see the usual mix on the rest of the fleet: APU squawks, environmental system seal items, avionics integration squawks (particularly where ADS-B and FANS upgrades have been layered onto older cockpits on the 604/605), and the steady stream of minor structural findings that show up any time you open up a 20-year-old large-cabin aircraft.",
        ],
      },
      {
        eyebrow: "Engines",
        heading: "Honeywell HTF7000 and GE CF34-3B Notes",
        paragraphs: [
          "The Challenger 300 runs Honeywell HTF7000s; the 350 stepped up to the HTF7350 with improved hot section life and higher thrust at altitude. Both engines have matured well, and the support network — Honeywell-authorized engine shops, life-limited part availability, and trend monitoring tooling — is in good shape. Hot section condition is still the variable that most influences planning, and we look at borescope data and engine trend reports before scoping any heavy event so the engine side and airframe side of the schedule don't fight each other.",
          "The 604, 605, and 650 fly behind GE CF34-3B variants — the same engine family used across the Bombardier CRJ regional fleet, which means parts availability and shop infrastructure are mature. Life-limited parts on the CF34 follow their own schedule and can be expensive to address all at once, so we map life-limit timing into the operator's long-term maintenance forecast rather than letting it surprise the next event.",
          "We don't perform off-wing engine work in-house, but we coordinate it: working with the operator's preferred engine shop, sequencing the off-wing event with the airframe inspection, and making sure the aircraft comes out the other side as a single coordinated package rather than two parallel projects bolted together.",
        ],
      },
      {
        eyebrow: "Heavy Event Planning",
        heading: "Planning a Challenger 192-Month Event",
        paragraphs: [
          "A Challenger 192-month inspection is one of the largest planned events in an aircraft's life cycle, and the single biggest variable in how it goes is how well it was planned. We start the conversation with operators 6 to 12 months ahead of the due date — sometimes longer — because long-lead parts, gear-shop slot availability, and engine-shop sequencing all need to be locked in before the aircraft arrives.",
          "Downtime is a range, not a number. The honest answer depends on the specific aircraft, its records, what we find when we open it up, and how the engine and gear timelines align. We give operators a planning range up front, update it as inspection findings come in, and communicate change-orders the moment they're real rather than at the end of the event. The goal is to keep the operator's flight schedule and the maintenance reality on the same page from start to finish.",
          "Pre-event prep matters more than most operators expect. We ask for records up front, walk through the open items list, scope any deferred maintenance, and pre-order long-lead parts before the aircraft arrives in Cleburne. By the time the aircraft is on jacks, we already know what we're looking for and where the schedule risk lives. That up-front discipline is most of what separates a 192-month event that lands on plan from one that drifts.",
        ],
      },
      {
        eyebrow: "Why PPA",
        heading: "Why Operators Choose Us for Challenger Work",
        paragraphs: [
          "Our Challenger program is led by Dalton Friesenhahn and built around factory-trained 300/350 technicians on staff. The team has executed multiple 96-month and 192-month events, including the landing gear removals that make those inspections complex to schedule. The tooling, fixtures, and gear-handling capacity are sized for the work, not borrowed from a generic shop floor.",
          "We treat the 300/350 and the 604/605/650 as related but distinct programs. The 300/350 lives in the super-midsize segment with Honeywell power and a younger fleet average; the 604/605/650 is large-cabin with GE power and a longer service history. The maintenance fundamentals — MSG-3 thinking, careful structural scoping, audit-ready records — carry across both, but the parts networks, engine ecosystems, and finding patterns differ. We plan each program on its own merits.",
          "Cleburne sits 30 minutes from DFW with materially lower operating costs than Love Field or Addison. For a Challenger heavy event measured in the high six figures, that overhead delta is a real number on the invoice — without compromising on the facility, the technician quality, or the documentation that protects the aircraft's resale value.",
        ],
      },
      {
        eyebrow: "Pre-Purchase",
        heading: "Pre-Purchase Inspections for Challenger Buyers",
        paragraphs: [
          "A Challenger PPI carries real stakes. The acquisition number is large, the asset is complex, and a thin PPI can hide six- and seven-figure problems that surface 18 months after closing. We scope Challenger pre-purchase inspections with the assumption that the buyer's negotiating position depends on the integrity of our findings — so we'd rather call a known structural concern honestly than soft-pedal it to make the deal easier.",
          "Our PPI workscope is shaped by the specific tail on offer: 300, 350, 604, 605, or 650; charter or corporate use; records quality; AD compliance; deferred maintenance; and engine and gear time-since-overhaul. We pay particular attention to the patterns the fleet is known for, including the main entry area on the 300/350, gear life on aircraft approaching 192-month, and engine trend data on the HTF7000 and CF34 fleets.",
          "Brokers, aircraft management companies, and individual buyers all run Challenger acquisitions through PPIs. Whichever role you're in, we'll deliver a workscope, a findings report, and a conversation that protects the decision — not a checkbox exercise that delays the transaction by a week and tells the buyer nothing useful.",
        ],
      },
    ],
  },
} as const;

export const SERVICES = [
  {
    name: "Scheduled Maintenance",
    slug: "scheduled-maintenance",
    short: "Phase inspections, annuals, and scheduled events — on time, every time.",
    icon: "wrench",
  },
  {
    name: "Pre-Purchase Inspections",
    slug: "pre-purchase-inspections",
    short: "Thorough, unbiased PPIs that protect your investment before you buy.",
    icon: "clipboard",
  },
  {
    name: "AOG Response",
    slug: "aog-response",
    short: "Aircraft down? Our mobile team covers Texas and Oklahoma.",
    icon: "bolt",
  },
  {
    name: "Structural Repairs / Modifications",
    slug: "structural-repairs",
    short: "FAA-approved structural engineering, repair, and modifications on all three airframe families.",
    icon: "shield",
  },
  {
    name: "Avionics",
    slug: "avionics",
    short: "Troubleshooting, repair, and upgrades for Hawker, Citation, and Challenger avionics suites.",
    icon: "cpu",
  },
  {
    name: "Maintenance Management",
    slug: "maintenance-management",
    short: "Consulting and management services from operators who've been in your seat.",
    icon: "chart",
  },
] as const;

export type NavLink = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const NAV_LINKS: NavLink[] = [
  { label: "Services", href: "/services" },
  { label: "Capabilities", href: "/capabilities" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const CAREERS = {
  email: "careers@ppa.aero",
  applyHref: "mailto:careers@ppa.aero?subject=Careers%20Inquiry",
  stats: {
    teamSize: "40+",
    medianTenure: "4y",
    posture: "Founder-Led",
  },
} as const;
