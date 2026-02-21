export function StructureDesign({ design }) {
  return (
    <div className="calc-result-card">
      <h3 className="calc-breakdown-header"><span>🏛️</span> Structural Design Specifications</h3>

      <Section title="Column Design">
        <Card icon="📐" title="Column Size" value={design.columns.size} sub="RCC Frame" />
        <Card icon="🔢" title="Total Columns" value={design.columns.count} sub={design.columns.spacing} />
        <Card icon="⚙️" title="Main Bars" value={design.columns.mainBars} sub="TMT Fe500" />
        <Card icon="🔗" title="Stirrups" value={design.columns.stirrup} sub="Lateral ties" />
      </Section>

      <Section title="Beam Design">
        <Card icon="📏" title="Beam Size" value={design.beams.size} sub="Main beam" />
        <Card icon="⬆️" title="Top Bars" value={design.beams.topBars} sub="Negative moment" />
        <Card icon="⬇️" title="Bottom Bars" value={design.beams.bottomBars} sub="Positive moment" />
        <Card icon="🔗" title="Stirrups" value={design.beams.stirrup} sub="Shear reinforcement" />
      </Section>

      <Section title="Slab Design">
        <Card icon="📊" title="Slab Thickness" value={design.slab.thickness} sub={design.slab.type} />
        <Card icon="⚙️" title="Main Bars" value={design.slab.mainBars} sub="Main steel" />
        <Card icon="🔗" title="Distribution Bars" value={design.slab.distributionBars} sub="Secondary steel" />
        <Card icon="🧱" title="Concrete Grade" value={design.concrete.grade} sub={design.concrete.mix} />
      </Section>

      <Section title="Other Elements">
        <Card icon="🔲" title="Plinth Beam" value={design.plinthBeam.size} sub={design.plinthBeam.bars} />
        <Card icon="🧱" title="External Wall" value={design.walls.external} sub="Outer walls" />
        <Card icon="🧱" title="Internal Wall" value={design.walls.internal} sub="Partition walls" />
        <Card icon="📐" title="Built-up Area" value={`${design.totalBuiltArea.toLocaleString("en-IN")} sq.ft`} sub="Total area" />
      </Section>

      <div className="calc-note">
        <strong>📋 Design Note:</strong> All structural elements designed as per IS 456:2000.
        Use {design.concrete.cement} for all concrete work. Ensure minimum concrete cover:
        Columns 40mm, Beams 25mm, Slabs 20mm.
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="calc-struct-section">
      <h4 className="calc-struct-section-title">{title}</h4>
      <div className="calc-struct-grid">{children}</div>
    </div>
  );
}

function Card({ icon, title, value, sub }) {
  return (
    <div className="calc-struct-card">
      <div className="calc-struct-icon">{icon}</div>
      <div className="calc-struct-title">{title}</div>
      <div className="calc-struct-value">{value}</div>
      <div className="calc-struct-sub">{sub}</div>
    </div>
  );
}