// Leadership preparers for the /admin/estimate-cover tool.
//
// Kept separate from COMPANY.leadership in constants.ts on purpose:
//   - COMPANY.leadership: full-frame hero JPGs sized for the website's
//     About-page portrait cards (8 entries, all leadership)
//   - LEADERSHIP_PREPARERS: transparent-cutout PNGs sized for circular
//     avatars on customer-facing estimate covers (5 entries, only those
//     authorized to prepare estimates)
//
// Same people appear in both lists, but the photos and the semantics differ.
// Mixing the two would force every consumer of leadership to decide which
// photo field to use, which is the kind of conditional that ages badly.

export interface Preparer {
  name: string;
  title: string;
  photo: string;
  email: string;
  phone: string;
}

// `?v=2` query string is a cache-buster — the headshot files were upgraded to
// higher resolution (2380x2603) but kept the same path, so browsers were still
// serving the cached 750x821 versions. Bumping the version param forces a
// fresh fetch. If you swap these files again later, bump the number.
export const LEADERSHIP_PREPARERS: Preparer[] = [
  { name: "Tristan Noe", title: "Director of Maintenance", photo: "/images/team/tristan.png?v=2", email: "tristan@ppa.aero", phone: "(817) 739-5630" },
  { name: "Travis Roberson", title: "VP of Maintenance", photo: "/images/team/travis.png?v=2", email: "travis@ppa.aero", phone: "(423) 504-3249" },
  { name: "Ron Larson", title: "Accountable Manager", photo: "/images/team/ron-larson.png?v=2", email: "ron@ppa.aero", phone: "(972) 822-0637" },
  { name: "Ron Reiling", title: "Sales Manager", photo: "/images/team/ron-reiling.png?v=2", email: "rreiling@ppa.aero", phone: "(817) 240-7197" },
  { name: "James Noe", title: "Hawker Service Advisor", photo: "/images/team/james.png?v=2", email: "james@ppa.aero", phone: "(817) 614-9513" },
];

export function findPreparer(name: string): Preparer {
  return LEADERSHIP_PREPARERS.find((m) => m.name === name) || LEADERSHIP_PREPARERS[0];
}
