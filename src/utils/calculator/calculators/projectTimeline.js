/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════════════════════
// PROJECT TIMELINE CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate project timeline
 */
export function calcProjectTimeline(inputs) {
  const { floors, includeBasement } = inputs;

  const phases = [
    {
      name: "Site Preparation & Excavation",
      duration: 7 + (includeBasement ? 5 : 0),
      startDay: 1,
    },
    {
      name: "Foundation Work",
      duration: 14 + (includeBasement ? 10 : 0),
      startDay: 8,
    },
    { name: "Plinth & Ground Floor Slab", duration: 20, startDay: 22 },
  ];

  let currentDay = 42;
  for (let i = 1; i < floors; i++) {
    phases.push({
      name: `Floor ${i} Structure`,
      duration: 25,
      startDay: currentDay,
    });
    currentDay += 25;
  }

  phases.push(
    { name: "Roof Slab & Waterproofing", duration: 18, startDay: currentDay },
    { name: "Masonry & Plastering", duration: 30, startDay: currentDay + 18 },
    { name: "Electrical & Plumbing", duration: 20, startDay: currentDay + 48 },
    { name: "Flooring & Tiling", duration: 25, startDay: currentDay + 68 },
    { name: "Painting & Finishing", duration: 20, startDay: currentDay + 93 },
    {
      name: "Fixtures & Final Touches",
      duration: 15,
      startDay: currentDay + 113,
    },
  );

  const totalDays =
    phases[phases.length - 1].startDay + phases[phases.length - 1].duration - 1;
  const totalMonths = Math.ceil(totalDays / 30);

  return { totalDays, totalMonths, phases };
}
