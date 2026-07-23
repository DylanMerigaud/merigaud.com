type SectionMarkerProps = {
  stage: string;
  index: string;
  label: string;
  dark?: boolean;
};

// The trace vocabulary: a node on the spine plus a mono annotation. The stage
// value doubles as the node id the spine terminates on (data-node="approve").
export const SectionMarker = ({ stage, index, label, dark = false }: SectionMarkerProps) => (
  <p className={`eyebrow relative ${dark ? "text-trace-dark" : "text-trace"}`}>
    <span aria-hidden="true" data-node={stage} className="trace-node left-0" />
    <span className="block pl-7 md:pl-10">
      {index} · {stage} / {label}
    </span>
  </p>
);
