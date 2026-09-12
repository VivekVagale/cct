import { MarqueChips, type MarqueChip } from "@/components/MarqueChips";

/**
 * Who the work is for.
 *
 * Four rather than two, because "personal or company" collapses the cases that
 * behave least alike: a business shooting its own product, a dealership
 * shooting stock it is selling, and an agency shooting for someone else all
 * have different approvals, deadlines and definitions of finished.
 *
 * `commercial` rather than `brand`, which read as a question about whether the
 * client considers themselves a brand — a judgement rather than a fact.
 * Commercial asks the thing that actually changes the job: whether the work is
 * being sold behind.
 */
export const USAGE_OPTIONS: MarqueChip[] = [
  { id: "personal", label: "Personal", hint: "My own machine" },
  { id: "commercial", label: "Commercial", hint: "For a business" },
  { id: "dealership", label: "Dealership", hint: "Stock we sell" },
  { id: "agency", label: "Agency", hint: "For a client" },
];

/**
 * The sentence and the chips, as one block.
 *
 * The explanation sits above the chips rather than under the heading. It is the
 * sentence that makes the four options mean something, so it belongs where the
 * eye is about to reach for them — under the heading it was read before the
 * question had landed, and scrolled past before the answer was needed.
 */
export function UsageChips({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="max-w-md text-sm text-[#B8C4D6] leading-relaxed">
        The same machine shot for your own feed and for a brand campaign are two
        different jobs — this tells us which one we&rsquo;re making.
      </p>
      <MarqueChips
        name="usage"
        label="Who the work is for"
        value={value}
        onChange={onChange}
        options={USAGE_OPTIONS}
      />
    </div>
  );
}
