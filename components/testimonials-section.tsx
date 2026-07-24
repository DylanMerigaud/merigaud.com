import Image from "next/image";

import { testimonials } from "@/lib/copy";

// Third-party proof: real, attributed LinkedIn recommendations from people who
// shipped with Dylan at Pivot (the procurement-fintech domain the buyer cares
// about). Placed right after the work, so "here is what I built" is followed by
// "and here is who vouches for it". No trace node: this is not a pipeline stage.
export const TestimonialsSection = () => (
  <section aria-label="Recommendations" className="py-20 md:py-28">
    <div className="mx-auto max-w-6xl px-6 md:px-10">
      <div className="pl-7 md:pl-10">
        <p className="eyebrow text-trace">{testimonials.eyebrow}</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
          {testimonials.heading}
        </h2>
      </div>
      <ul className="mt-10 grid gap-x-10 gap-y-12 pl-7 md:grid-cols-3 md:pl-10">
        {testimonials.quotes.map((item) => (
          <li key={item.name} className="flex">
            <figure className="border-stamp/40 flex flex-col border-l-2 pl-5">
              <blockquote className="text-ink/85 leading-relaxed text-balance">
                {item.quote}
              </blockquote>
              {/* mt-auto anchors every caption to the bottom of its (equal-height)
                  cell, so the avatars line up no matter the quote length. */}
              <figcaption className="mt-auto flex items-center gap-3 pt-6">
                <Image
                  src={item.avatar}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="size-10 rounded-full object-cover"
                />
                <span className="block">
                  <span className="block font-semibold tracking-tight">{item.name}</span>
                  <span className="text-trace mt-0.5 block font-mono text-xs tracking-wide">
                    {item.title}
                  </span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
