// ═══════════════════════════════════════════════════════════════════════════
// useProjectEstimator.js
// Smart Project Estimator — per-type dynamic fields + real WB PWD calculations
// Reuses existing repo rate constants (standard.js)
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { ITEM_RATES, MATERIAL_RATES, LABOUR_RATES } from "../utils/calculator/rates/standard";
import { SOIL_CONDITIONS, BUILDING_TYPES } from "../utils/shared/constants";

// ── Concrete grade rate multipliers (relative to M20 base) ─────────────────
const CONCRETE_RATES = { M15: 0.82, M20: 1.00, M25: 1.22, M30: 1.46 };
const STEEL_RATES    = { Fe415: 1.00, Fe500: 1.10, "Fe500D": 1.14 };

const GRADE_OPTS  = { M15:{label:"M15"}, M20:{label:"M20"}, M25:{label:"M25"}, M30:{label:"M30"} };
const GRADE_OPTS2 = { M20:{label:"M20"}, M25:{label:"M25"} };
const STEEL_OPTS  = { Fe415:{label:"Fe415"}, Fe500:{label:"Fe500"}, "Fe500D":{label:"Fe500D"} };
const STEEL_OPTS2 = { Fe415:{label:"Fe415"}, Fe500:{label:"Fe500"} };

function buildResult(rows) {
  const subTotal    = rows.reduce((s, r) => s + (+r.amount || 0), 0);
  const tax         = +(subTotal * 0.10).toFixed(0);
  const contingency = +(subTotal * 0.05).toFixed(0);
  const grandTotal  = subTotal + tax + contingency;
  return { rows, subTotal, tax, contingency, grandTotal };
}

// ═══════════════════════════════════════════════════════════════════════════
// PROJECT TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════
export const PROJECT_TYPES = [

  // ── 1. Full Building ──────────────────────────────────────────────────────
  {
    id: "full_building", label: "🏠 Full Building Estimate", tag: "COMPLETE",
    desc: "Complete multi-storey RCC building — all elements included",
    fields: [
      { id:"length",       label:"Building Length",        unit:"ft",  type:"number", placeholder:"e.g. 40" },
      { id:"breadth",      label:"Building Breadth",       unit:"ft",  type:"number", placeholder:"e.g. 30" },
      { id:"floors",       label:"Number of Floors",       unit:"",    type:"floor_btn" },
      { id:"floorHeight",  label:"Floor-to-Floor Height",  unit:"ft",  type:"number", placeholder:"10" },
      { id:"buildingType", label:"Building Use",           unit:"",    type:"select", options: BUILDING_TYPES },
      { id:"soilCondition",label:"Soil Condition",         unit:"",    type:"select", options: SOIL_CONDITIONS },
      { id:"grade",        label:"Concrete Grade",         unit:"",    type:"select", options: GRADE_OPTS },
      { id:"steelGrade",   label:"Steel Grade",            unit:"",    type:"select", options: STEEL_OPTS },
    ],
    compute(inp, R) {
      const L=+inp.length||0, B=+inp.breadth||0, F=+inp.floors||1, fh=+inp.floorHeight||10;
      const plotSqft=L*B, totalSqft=plotSqft*F;
      const plotSqm=plotSqft*0.0929, totalSqm=totalSqft*0.0929;
      const tF=BUILDING_TYPES[inp.buildingType]?.costFactor??1;
      const sF=SOIL_CONDITIONS[inp.soilCondition]?.factor??1;
      const cR=CONCRETE_RATES[inp.grade]??1, sR=STEEL_RATES[inp.steelGrade]??1;

      const excavVol  =+(plotSqm*0.9).toFixed(2);
      const pccVol    =+(plotSqm*0.015).toFixed(2);
      const footVol   =+(totalSqm*0.05*tF).toFixed(2);
      const colVol    =+(totalSqm*0.03*F).toFixed(2);
      const beamVol   =+(totalSqm*0.025*F).toFixed(2);
      const slabVol   =+(totalSqm*F*0.125*0.0254).toFixed(2);
      const brickVol  =+(totalSqm*0.22*(fh*0.3048)*0.5).toFixed(2);
      const plstrSqm  =+(totalSqm*3.5*2).toFixed(1);

      const excA  =+(excavVol *R.ITEM.excavation.rate*sF).toFixed(0);
      const pccA  =+(pccVol   *R.ITEM.pcc148.rate*cR).toFixed(0);
      const fotA  =+(footVol  *R.ITEM.rccM20Footing.rate*cR*sR).toFixed(0);
      const colA  =+(colVol   *R.ITEM.rccM20Column.rate*cR*sR*tF).toFixed(0);
      const bmA   =+(beamVol  *R.ITEM.rccM20Beam.rate*cR*sR*tF).toFixed(0);
      const slA   =+(slabVol  *R.ITEM.rccM20Slab.rate*cR*sR).toFixed(0);
      const brA   =+(brickVol *R.ITEM.brickwork230.rate*tF).toFixed(0);
      const plA   =+(plstrSqm *R.ITEM.plasterInternal.rate).toFixed(0);
      const ptA   =+(totalSqm *3.5*2*R.ITEM.paintInternal.rate).toFixed(0);
      const elA   =+(totalSqft*R.ITEM.electrical.rate).toFixed(0);
      const plbA  =+(totalSqft*R.ITEM.plumbing.rate).toFixed(0);
      const wpA   =+(plotSqm  *R.ITEM.wpTerrace.rate).toFixed(0);

      return buildResult([
        {id:1, desc:"Earthwork Excavation",                  unit:"cum",  qty:excavVol,            rate:+(excA/excavVol).toFixed(0),   amount:excA  },
        {id:2, desc:"PCC 1:4:8 (Bed Concrete)",              unit:"cum",  qty:pccVol,              rate:+(pccA/pccVol).toFixed(0),     amount:pccA  },
        {id:3, desc:`RCC ${inp.grade} Footing`,              unit:"cum",  qty:footVol,             rate:+(fotA/footVol).toFixed(0),    amount:fotA  },
        {id:4, desc:`RCC ${inp.grade} Columns (${F} fl.)`,   unit:"cum",  qty:colVol,              rate:+(colA/colVol).toFixed(0),     amount:colA  },
        {id:5, desc:`RCC ${inp.grade} Beams (${F} fl.)`,     unit:"cum",  qty:beamVol,             rate:+(bmA/beamVol).toFixed(0),     amount:bmA   },
        {id:6, desc:`RCC ${inp.grade} Slabs (${F} fl.)`,     unit:"cum",  qty:slabVol,             rate:+(slA/slabVol).toFixed(0),     amount:slA   },
        {id:7, desc:"Brick Masonry 230mm Walls",             unit:"cum",  qty:brickVol,            rate:+(brA/brickVol).toFixed(0),    amount:brA   },
        {id:8, desc:"Cement Plaster (Int. + Ext.)",          unit:"sqm",  qty:plstrSqm,            rate:R.ITEM.plasterInternal.rate,   amount:plA   },
        {id:9, desc:"Painting (Interior + Exterior)",        unit:"sqm",  qty:+(totalSqm*3.5*2).toFixed(1), rate:R.ITEM.paintInternal.rate, amount:ptA },
        {id:10,desc:"Electrical Wiring (Complete)",          unit:"sqft", qty:totalSqft,           rate:R.ITEM.electrical.rate,        amount:elA   },
        {id:11,desc:"Plumbing & Sanitary (Complete)",        unit:"sqft", qty:totalSqft,           rate:R.ITEM.plumbing.rate,          amount:plbA  },
        {id:12,desc:"Terrace Waterproofing",                 unit:"sqm",  qty:plotSqm,             rate:R.ITEM.wpTerrace.rate,         amount:wpA   },
      ]);
    },
  },

  // ── 2. RCC Footing ───────────────────────────────────────────────────────
  {
    id:"rcc_footing", label:"🏗️ RCC Footing / Foundation", tag:"FOUNDATION",
    desc:"Isolated footings with excavation, PCC bed and RCC",
    fields:[
      {id:"length",       label:"Footing Length",       unit:"m",   type:"number", placeholder:"e.g. 1.5"},
      {id:"breadth",      label:"Footing Breadth",      unit:"m",   type:"number", placeholder:"e.g. 1.5"},
      {id:"footingDepth", label:"Footing Depth",        unit:"m",   type:"number", placeholder:"e.g. 0.45"},
      {id:"foundDepth",   label:"Pit Excavation Depth", unit:"m",   type:"number", placeholder:"e.g. 1.5"},
      {id:"qty",          label:"Number of Footings",   unit:"nos", type:"number", placeholder:"e.g. 6"},
      {id:"soilCondition",label:"Soil Condition",       unit:"",    type:"select", options:SOIL_CONDITIONS},
      {id:"grade",        label:"Concrete Grade",       unit:"",    type:"select", options:GRADE_OPTS},
      {id:"steelGrade",   label:"Steel Grade",          unit:"",    type:"select", options:STEEL_OPTS},
    ],
    compute(inp,R){
      const L=+inp.length||0,B=+inp.breadth||0,fD=+inp.footingDepth||0.45,pD=+inp.foundDepth||1.5,n=+inp.qty||1;
      const sF=SOIL_CONDITIONS[inp.soilCondition]?.factor??1;
      const cR=CONCRETE_RATES[inp.grade]??1,sR=STEEL_RATES[inp.steelGrade]??1;
      const excV=+((L+0.6)*(B+0.6)*pD*n).toFixed(2);
      const pccV=+(L*B*0.075*n).toFixed(2);
      const rccV=+(L*B*fD*n).toFixed(3);
      const fwA =+(2*(L+B)*fD*n).toFixed(2);
      const excA=+(excV*R.ITEM.excavation.rate*sF).toFixed(0);
      const pccA=+(pccV*R.ITEM.pcc148.rate*cR).toFixed(0);
      const rccA=+(rccV*R.ITEM.rccM20Footing.rate*cR*sR).toFixed(0);
      const fwAA=+(fwA*12).toFixed(0);
      const misc=500*n;
      return buildResult([
        {id:1,desc:"Earthwork Excavation",                       unit:"cum", qty:excV, rate:+(excA/excV).toFixed(0), amount:excA},
        {id:2,desc:"PCC 1:4:8 Bed Concrete (75mm)",             unit:"cum", qty:pccV, rate:+(pccA/pccV).toFixed(0), amount:pccA},
        {id:3,desc:`RCC ${inp.grade} Footing (incl. ${inp.steelGrade})`, unit:"cum", qty:rccV, rate:+(rccA/rccV).toFixed(0), amount:rccA},
        {id:4,desc:"Formwork / Shuttering",                      unit:"sqm", qty:fwA,  rate:12, amount:fwAA},
        {id:5,desc:"Backfilling, curing & misc.",                unit:"LS",  qty:n,    rate:500, amount:misc},
      ]);
    },
  },

  // ── 3. RCC Column ────────────────────────────────────────────────────────
  {
    id:"rcc_column", label:"🔲 RCC Column", tag:"STRUCTURAL",
    desc:"RCC columns with reinforcement and formwork",
    fields:[
      {id:"length",     label:"Column Length (b)", unit:"m",   type:"number", placeholder:"e.g. 0.23"},
      {id:"breadth",    label:"Column Breadth (d)",unit:"m",   type:"number", placeholder:"e.g. 0.30"},
      {id:"height",     label:"Column Height",     unit:"m",   type:"number", placeholder:"e.g. 3.0"},
      {id:"qty",        label:"Number of Columns", unit:"nos", type:"number", placeholder:"e.g. 4"},
      {id:"grade",      label:"Concrete Grade",    unit:"",    type:"select", options:GRADE_OPTS},
      {id:"steelGrade", label:"Steel Grade",       unit:"",    type:"select", options:STEEL_OPTS},
    ],
    compute(inp,R){
      const L=+inp.length||0,B=+inp.breadth||0,H=+inp.height||0,n=+inp.qty||1;
      const cR=CONCRETE_RATES[inp.grade]??1,sR=STEEL_RATES[inp.steelGrade]??1;
      const rccV=+(L*B*H*n).toFixed(3);
      const fwA =+(2*(L+B)*H*n).toFixed(2);
      const rccA=+(rccV*R.ITEM.rccM20Column.rate*cR*sR).toFixed(0);
      const fwAA=+(fwA*12).toFixed(0);
      const misc=+(rccA*0.02).toFixed(0);
      return buildResult([
        {id:1,desc:`RCC ${inp.grade} Column (incl. ${inp.steelGrade} steel)`, unit:"cum", qty:rccV, rate:+(rccA/rccV).toFixed(0), amount:rccA},
        {id:2,desc:"Formwork / Shuttering",  unit:"sqm", qty:fwA,  rate:12, amount:fwAA},
        {id:3,desc:"Curing & misc.",         unit:"LS",  qty:n,    rate:+(misc/n).toFixed(0), amount:misc},
      ]);
    },
  },

  // ── 4. RCC Beam ──────────────────────────────────────────────────────────
  {
    id:"rcc_beam", label:"━ RCC Beam", tag:"STRUCTURAL",
    desc:"RCC beams with reinforcement and formwork",
    fields:[
      {id:"length",     label:"Beam Span (Length)", unit:"m",   type:"number", placeholder:"e.g. 4.5"},
      {id:"breadth",    label:"Beam Width (b)",     unit:"m",   type:"number", placeholder:"e.g. 0.23"},
      {id:"height",     label:"Beam Depth (D)",     unit:"m",   type:"number", placeholder:"e.g. 0.45"},
      {id:"qty",        label:"Number of Beams",    unit:"nos", type:"number", placeholder:"e.g. 6"},
      {id:"grade",      label:"Concrete Grade",     unit:"",    type:"select", options:GRADE_OPTS},
      {id:"steelGrade", label:"Steel Grade",        unit:"",    type:"select", options:STEEL_OPTS},
    ],
    compute(inp,R){
      const L=+inp.length||0,B=+inp.breadth||0,H=+inp.height||0,n=+inp.qty||1;
      const cR=CONCRETE_RATES[inp.grade]??1,sR=STEEL_RATES[inp.steelGrade]??1;
      const rccV=+(L*B*H*n).toFixed(3);
      const fwA =+((L*B+2*L*H)*n).toFixed(2);
      const rccA=+(rccV*R.ITEM.rccM20Beam.rate*cR*sR).toFixed(0);
      const fwAA=+(fwA*12).toFixed(0);
      const misc=+(rccA*0.018).toFixed(0);
      return buildResult([
        {id:1,desc:`RCC ${inp.grade} Beam (incl. ${inp.steelGrade} steel)`, unit:"cum", qty:rccV, rate:+(rccA/rccV).toFixed(0), amount:rccA},
        {id:2,desc:"Formwork / Shuttering", unit:"sqm", qty:fwA, rate:12, amount:fwAA},
        {id:3,desc:"Curing & misc.",        unit:"LS",  qty:n,   rate:+(misc/n).toFixed(0), amount:misc},
      ]);
    },
  },

  // ── 5. RCC Slab ──────────────────────────────────────────────────────────
  {
    id:"rcc_slab", label:"▬ RCC Slab", tag:"STRUCTURAL",
    desc:"RCC roof / floor slab with reinforcement",
    fields:[
      {id:"length",     label:"Slab Length (Lx)",  unit:"m",   type:"number", placeholder:"e.g. 5.0"},
      {id:"breadth",    label:"Slab Breadth (Ly)", unit:"m",   type:"number", placeholder:"e.g. 4.0"},
      {id:"height",     label:"Slab Thickness",    unit:"m",   type:"number", placeholder:"e.g. 0.125"},
      {id:"floors",     label:"Number of Slabs",   unit:"nos", type:"number", placeholder:"e.g. 1"},
      {id:"grade",      label:"Concrete Grade",    unit:"",    type:"select", options:GRADE_OPTS},
      {id:"steelGrade", label:"Steel Grade",       unit:"",    type:"select", options:STEEL_OPTS},
    ],
    compute(inp,R){
      const L=+inp.length||0,B=+inp.breadth||0,t=+inp.height||0.125,n=+inp.floors||1;
      const cR=CONCRETE_RATES[inp.grade]??1,sR=STEEL_RATES[inp.steelGrade]??1;
      const rccV=+(L*B*t*n).toFixed(3);
      const fwA =+(L*B*n).toFixed(2);
      const rccA=+(rccV*R.ITEM.rccM20Slab.rate*cR*sR).toFixed(0);
      const fwAA=+(fwA*220).toFixed(0);
      const misc=+(rccA*0.015).toFixed(0);
      return buildResult([
        {id:1,desc:`RCC ${inp.grade} Slab (incl. ${inp.steelGrade} steel & curing)`, unit:"cum", qty:rccV, rate:+(rccA/rccV).toFixed(0), amount:rccA},
        {id:2,desc:"Formwork / Centering (props + ply)", unit:"sqm", qty:fwA, rate:220, amount:fwAA},
        {id:3,desc:"Curing & misc.",                     unit:"LS",  qty:n,   rate:+(misc/n).toFixed(0), amount:misc},
      ]);
    },
  },

  // ── 6. Strip Foundation ──────────────────────────────────────────────────
  {
    id:"strip_foundation", label:"📏 Strip Foundation", tag:"FOUNDATION",
    desc:"Continuous strip footing under load-bearing walls",
    fields:[
      {id:"length",       label:"Total Strip Length",  unit:"m", type:"number", placeholder:"e.g. 30"},
      {id:"breadth",      label:"Strip Width",         unit:"m", type:"number", placeholder:"e.g. 0.6"},
      {id:"footingDepth", label:"Strip Depth",         unit:"m", type:"number", placeholder:"e.g. 0.3"},
      {id:"foundDepth",   label:"Excavation Depth",    unit:"m", type:"number", placeholder:"e.g. 1.2"},
      {id:"soilCondition",label:"Soil Condition",      unit:"",  type:"select", options:SOIL_CONDITIONS},
      {id:"grade",        label:"Concrete Grade",      unit:"",  type:"select", options:GRADE_OPTS},
    ],
    compute(inp,R){
      const L=+inp.length||0,W=+inp.breadth||0,sD=+inp.footingDepth||0.3,eD=+inp.foundDepth||1.2;
      const sF=SOIL_CONDITIONS[inp.soilCondition]?.factor??1;
      const cR=CONCRETE_RATES[inp.grade]??1;
      const excV=+((W+0.4)*L*eD).toFixed(2);
      const pccV=+(L*W*0.075).toFixed(2);
      const rccV=+(L*W*sD).toFixed(3);
      const fwA =+(2*L*sD).toFixed(2);
      const excA=+(excV*R.ITEM.excavation.rate*sF).toFixed(0);
      const pccA=+(pccV*R.ITEM.pcc148.rate*cR).toFixed(0);
      const rccA=+(rccV*R.ITEM.rccM20Footing.rate*cR).toFixed(0);
      const fwAA=+(fwA*12).toFixed(0);
      const misc=+(rccV*150).toFixed(0);
      return buildResult([
        {id:1,desc:"Earthwork Excavation for Strip Foundation", unit:"cum", qty:excV, rate:+(excA/excV).toFixed(0), amount:excA},
        {id:2,desc:"PCC 1:4:8 Bed Concrete (75mm)",            unit:"cum", qty:pccV, rate:+(pccA/pccV).toFixed(0), amount:pccA},
        {id:3,desc:`RCC ${inp.grade} Strip Footing`,           unit:"cum", qty:rccV, rate:+(rccA/rccV).toFixed(0), amount:rccA},
        {id:4,desc:"Formwork (Side shuttering)",               unit:"sqm", qty:fwA,  rate:12, amount:fwAA},
        {id:5,desc:"Backfilling & Curing",                     unit:"LS",  qty:1,    rate:misc, amount:misc},
      ]);
    },
  },

  // ── 7. Raft Foundation ───────────────────────────────────────────────────
  {
    id:"raft_foundation", label:"🟦 Raft Foundation", tag:"FOUNDATION",
    desc:"Mat/raft slab covering full plot — for weak soil",
    fields:[
      {id:"length",       label:"Raft Length",         unit:"m", type:"number", placeholder:"e.g. 10"},
      {id:"breadth",      label:"Raft Breadth",        unit:"m", type:"number", placeholder:"e.g. 8"},
      {id:"height",       label:"Raft Thickness",      unit:"m", type:"number", placeholder:"e.g. 0.3"},
      {id:"foundDepth",   label:"Excavation Depth",    unit:"m", type:"number", placeholder:"e.g. 1.5"},
      {id:"soilCondition",label:"Soil Condition",      unit:"",  type:"select", options:SOIL_CONDITIONS},
      {id:"grade",        label:"Concrete Grade",      unit:"",  type:"select", options:GRADE_OPTS2},
      {id:"steelGrade",   label:"Steel Grade",         unit:"",  type:"select", options:STEEL_OPTS2},
    ],
    compute(inp,R){
      const L=+inp.length||0,B=+inp.breadth||0,t=+inp.height||0.3,eD=+inp.foundDepth||1.5;
      const sF=SOIL_CONDITIONS[inp.soilCondition]?.factor??1;
      const cR=CONCRETE_RATES[inp.grade]??1,sR=STEEL_RATES[inp.steelGrade]??1;
      const excV=+((L+1)*(B+1)*eD).toFixed(2);
      const pccV=+(L*B*0.075).toFixed(2);
      const rccV=+(L*B*t).toFixed(3);
      const fwA =+(2*(L+B)*t).toFixed(2);
      const excA=+(excV*R.ITEM.excavation.rate*sF).toFixed(0);
      const pccA=+(pccV*R.ITEM.pcc148.rate*cR).toFixed(0);
      const rccA=+(rccV*R.ITEM.rccM20Slab.rate*cR*sR*1.15).toFixed(0);
      const fwAA=+(fwA*12).toFixed(0);
      const misc=+(rccA*0.025).toFixed(0);
      return buildResult([
        {id:1,desc:"Earthwork Excavation",           unit:"cum", qty:excV, rate:+(excA/excV).toFixed(0), amount:excA},
        {id:2,desc:"PCC 1:4:8 Levelling Course",     unit:"cum", qty:pccV, rate:+(pccA/pccV).toFixed(0), amount:pccA},
        {id:3,desc:`RCC ${inp.grade} Raft Slab (incl. ${inp.steelGrade})`, unit:"cum", qty:rccV, rate:+(rccA/rccV).toFixed(0), amount:rccA},
        {id:4,desc:"Formwork (Edge shuttering)",     unit:"sqm", qty:fwA,  rate:12, amount:fwAA},
        {id:5,desc:"Waterproofing + Curing",         unit:"LS",  qty:1,    rate:misc, amount:misc},
      ]);
    },
  },

  // ── 8. RCC Staircase ────────────────────────────────────────────────────
  {
    id:"rcc_staircase", label:"🪜 RCC Staircase", tag:"STRUCTURAL",
    desc:"Dog-legged RCC staircase with landing and MS railing",
    fields:[
      {id:"length",     label:"Landing Length",          unit:"m",   type:"number", placeholder:"e.g. 3.0"},
      {id:"breadth",    label:"Stair Width",             unit:"m",   type:"number", placeholder:"e.g. 1.2"},
      {id:"height",     label:"Floor-to-Floor Height",   unit:"m",   type:"number", placeholder:"e.g. 3.0"},
      {id:"floors",     label:"Number of Flights",       unit:"nos", type:"number", placeholder:"e.g. 2"},
      {id:"grade",      label:"Concrete Grade",          unit:"",    type:"select", options:GRADE_OPTS2},
      {id:"steelGrade", label:"Steel Grade",             unit:"",    type:"select", options:STEEL_OPTS2},
    ],
    compute(inp,R){
      const L=+inp.length||3,W=+inp.breadth||1.2,H=+inp.height||3,fl=+inp.floors||1;
      const cR=CONCRETE_RATES[inp.grade]??1,sR=STEEL_RATES[inp.steelGrade]??1;
      const rccV=+(L*W*0.15*fl).toFixed(2);
      const fwA =+(L*W*1.8*fl).toFixed(2);
      const railL=+(L*fl*1.1).toFixed(1);
      const rccA=+(rccV*R.ITEM.rccM20Slab.rate*cR*sR*1.25).toFixed(0);
      const fwAA=+(fwA*12).toFixed(0);
      const railA=+(railL*R.ITEM.stairRailing.rate).toFixed(0);
      const misc=+(rccA*0.05).toFixed(0);
      return buildResult([
        {id:1,desc:`RCC ${inp.grade} Waist Slab + Treads (${inp.steelGrade})`, unit:"cum", qty:rccV, rate:+(rccA/rccV).toFixed(0), amount:rccA},
        {id:2,desc:"Formwork (Soffit + Risers)",    unit:"sqm", qty:fwA,   rate:12, amount:fwAA},
        {id:3,desc:"MS Stair Railing (fabricated)", unit:"rmt", qty:railL, rate:R.ITEM.stairRailing.rate, amount:railA},
        {id:4,desc:"Curing, finishing & misc.",     unit:"LS",  qty:fl,    rate:+(misc/fl).toFixed(0), amount:misc},
      ]);
    },
  },

  // ── 9. Brick Masonry ────────────────────────────────────────────────────
  {
    id:"brick_masonry", label:"🧱 Brick Masonry Wall", tag:"MASONRY",
    desc:"Brick masonry walls with plaster",
    fields:[
      {id:"length",  label:"Wall Length",           unit:"m",   type:"number", placeholder:"e.g. 6.0"},
      {id:"height",  label:"Wall Height",           unit:"m",   type:"number", placeholder:"e.g. 3.0"},
      {id:"qty",     label:"Number of Panels/Walls",unit:"nos", type:"number", placeholder:"e.g. 4"},
      {id:"wallType",label:"Wall Thickness",        unit:"",    type:"select", options:{"full":{label:'230mm (9") Full Brick'},"half":{label:'115mm (4.5") Partition'}}},
    ],
    compute(inp,R){
      const L=+inp.length||0,H=+inp.height||0,n=+inp.qty||1;
      const isFull=inp.wallType!=="half", t=isFull?0.23:0.115;
      const vol=+(L*H*t*n).toFixed(3);
      const plstrSqm=+(L*H*2*n).toFixed(1);
      const bRate=isFull?R.ITEM.brickwork230.rate:R.ITEM.brickwork115.rate;
      const bA=+(vol*bRate).toFixed(0);
      const plA=+(plstrSqm*R.ITEM.plasterInternal.rate).toFixed(0);
      const misc=+(bA*0.03).toFixed(0);
      return buildResult([
        {id:1,desc:`Brick Masonry CM 1:6 (${isFull?"230mm":"115mm"})`, unit:"cum", qty:vol,      rate:bRate, amount:bA},
        {id:2,desc:"Cement Plaster 1:4 (Both sides)",                  unit:"sqm", qty:plstrSqm, rate:R.ITEM.plasterInternal.rate, amount:plA},
        {id:3,desc:"Curing & misc.",                                    unit:"LS",  qty:1,        rate:misc, amount:misc},
      ]);
    },
  },

  // ── 10. Retaining Wall ──────────────────────────────────────────────────
  {
    id:"retaining_wall", label:"🪨 Retaining Wall", tag:"STRUCTURAL",
    desc:"RCC cantilever retaining wall with footing",
    fields:[
      {id:"length",      label:"Wall Length",          unit:"m", type:"number", placeholder:"e.g. 10"},
      {id:"height",      label:"Wall Height",          unit:"m", type:"number", placeholder:"e.g. 2.0"},
      {id:"breadth",     label:"Wall Thickness (top)", unit:"m", type:"number", placeholder:"e.g. 0.23"},
      {id:"footingDepth",label:"Footing Thickness",    unit:"m", type:"number", placeholder:"e.g. 0.4"},
      {id:"foundDepth",  label:"Footing Width",        unit:"m", type:"number", placeholder:"e.g. 1.0"},
      {id:"grade",       label:"Concrete Grade",       unit:"",  type:"select", options:GRADE_OPTS2},
      {id:"steelGrade",  label:"Steel Grade",          unit:"",  type:"select", options:STEEL_OPTS2},
    ],
    compute(inp,R){
      const L=+inp.length||0,H=+inp.height||0,tw=+inp.breadth||0.23,ft=+inp.footingDepth||0.4,fw=+inp.foundDepth||1.0;
      const cR=CONCRETE_RATES[inp.grade]??1,sR=STEEL_RATES[inp.steelGrade]??1;
      const stemV=+(L*H*tw).toFixed(3);
      const fotV =+(L*fw*ft).toFixed(3);
      const totV =+(stemV+fotV).toFixed(3);
      const fwA  =+(2*L*H+2*L*ft).toFixed(2);
      const excV =+((fw+0.3)*L*(H+ft+0.3)).toFixed(2);
      const excA =+(excV*R.ITEM.excavation.rate).toFixed(0);
      const rccA =+(totV*R.ITEM.rccM20Column.rate*cR*sR).toFixed(0);
      const fwAA =+(fwA*12).toFixed(0);
      const misc =+(rccA*0.03).toFixed(0);
      return buildResult([
        {id:1,desc:"Earthwork Excavation",           unit:"cum", qty:excV, rate:R.ITEM.excavation.rate, amount:excA},
        {id:2,desc:`RCC ${inp.grade} Stem + Footing (${inp.steelGrade})`, unit:"cum", qty:totV, rate:+(rccA/totV).toFixed(0), amount:rccA},
        {id:3,desc:"Formwork (Both faces)",          unit:"sqm", qty:fwA,  rate:12, amount:fwAA},
        {id:4,desc:"Backfilling + Curing",           unit:"LS",  qty:1,    rate:misc, amount:misc},
      ]);
    },
  },
];

// ── Defaults ────────────────────────────────────────────────────────────────
const DEFAULTS = {
  projectName:"", projectTypeId:"rcc_footing",
  length:"", breadth:"", height:"", footingDepth:"", foundDepth:"",
  qty:"1", floors:1, floorHeight:"10",
  buildingType:"residential", soilCondition:"normal", wallType:"full",
  grade:"M20", steelGrade:"Fe415",
};

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useProjectEstimator() {
  const [inputs,  setInputs]  = useState(DEFAULTS);
  const [result,  setResult]  = useState(null);
  const [history, setHistory] = useState([]);
  const [errors,  setErrors]  = useState({});

  const currentType = PROJECT_TYPES.find(p => p.id === inputs.projectTypeId) ?? PROJECT_TYPES[0];

  const updateField = (field) => (e) => {
    const value = e.target.value;
    setInputs(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const changeProjectType = (id) => {
    setInputs(prev => ({
      ...DEFAULTS,
      projectName:   prev.projectName,
      grade:         prev.grade,
      steelGrade:    prev.steelGrade,
      soilCondition: prev.soilCondition,
      buildingType:  prev.buildingType,
      projectTypeId: id,
    }));
    setResult(null);
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!inputs.projectName.trim()) e.projectName = "Project name required";
    currentType.fields.forEach(f => {
      if (f.type === "number" && (!inputs[f.id] || +inputs[f.id] <= 0))
        e[f.id] = `Enter valid ${f.label.toLowerCase()}`;
    });
    return e;
  };

  const calculate = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    const rates = { ITEM: ITEM_RATES, MAT: MATERIAL_RATES, LAB: LABOUR_RATES };
    setResult(currentType.compute(inputs, rates));
  };

  const save = () => {
    if (!result) return;
    setHistory(prev => [{
      id: Date.now(),
      projectName: inputs.projectName,
      projectType: currentType.label,
      grade:       inputs.grade,
      date:        new Date().toLocaleDateString("en-IN"),
      grandTotal:  result.grandTotal,
    }, ...prev]);
    alert("✅ Estimate saved!");
  };

  const clear = () => { setInputs(DEFAULTS); setResult(null); setErrors({}); };

  return { inputs, updateField, changeProjectType, errors, currentType, PROJECT_TYPES, result, calculate, save, clear, history };
}