import { Lightbulb } from "lucide-react";

export default function TriviaSection({ trivia }: { trivia: string[] }) {
  if (trivia.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold md:text-xl">
        <Lightbulb size={18} className="text-accent" />
        Datos curiosos
      </h2>
      <ul className="flex flex-col gap-2.5">
        {trivia.map((fact, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-foreground/80">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {fact}
          </li>
        ))}
      </ul>
    </section>
  );
}
