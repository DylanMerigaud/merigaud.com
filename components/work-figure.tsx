import Image from "next/image";

import type { WorkItem } from "@/lib/copy";

// One art-directed figure per project: paper card, ink hairline, mono caption.
export const WorkFigure = ({ figure }: { figure: WorkItem["figure"] }) => (
  <figure>
    <div className="figure-card">
      {figure.kind === "image" ? (
        <Image
          src={figure.src}
          width={figure.width}
          height={figure.height}
          alt={figure.alt}
          sizes="(min-width: 768px) 44rem, 100vw"
          className="block w-full"
        />
      ) : (
        <video
          data-figure
          loop
          muted
          playsInline
          preload="none"
          poster={figure.poster}
          width={figure.width}
          height={figure.height}
          className="block w-full"
          aria-label={figure.alt}
        >
          <source src={figure.src} type="video/mp4" />
        </video>
      )}
    </div>
    <figcaption className="eyebrow text-trace mt-3">{figure.caption}</figcaption>
  </figure>
);
