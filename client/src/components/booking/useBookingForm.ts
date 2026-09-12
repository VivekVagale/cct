import { useState, type FormEvent } from "react";
import {
  BUILD_BRIEFS,
  hasBrief,
  FREE_FALL_DEFAULTS,
  type FreeFallAnswers,
} from "@/components/BuildBriefDialog";
import { OTHER_VEHICLE_ID } from "@/components/VehicleConfigurator";
import { preloadThankYou } from "@/components/ThankYouCard";
import { jets } from "@/data/jets";
import { environments } from "@/data/environments";
import { deliveries } from "@/data/deliveries";
import { vehicles } from "@/data/vehicles";
import { projects } from "@/data/content";
import { submitBookingForm } from "@/lib/formHandler";

export type Status = "idle" | "submitting" | "success" | "error";

/**
 * What the `vehicle` column says when the machine is not one of ours.
 *
 * Not left empty. The studio reads a table where an empty vehicle means the
 * form failed, and they would have to be told once per row that this one is
 * different. It says where the machine actually is instead, and every such row
 * sorts together. Twenty-three characters against a two-hundred limit.
 */
const OTHER_VEHICLE_LABEL = "Other — see description";

/**
 * Everything a booking is, and the one place it becomes a row.
 *
 * There are two layouts now — a stacked form on a desktop, a six-screen wizard
 * on a phone — and they must produce byte-identical rows. Two copies of this
 * logic would not stay identical for a week: the payload is eighteen columns,
 * six of them conditional on which build was chosen, two of them marked when
 * they hold a default nobody picked. Drift there is invisible until the studio
 * reads a table where half the rows say "MiG-29" and half say "Default jet
 * (MiG-29)".
 *
 * So the state, the derived labels and the submit live here, and the layouts own
 * nothing but their arrangement.
 */
export function useBookingForm() {
  const [status, setStatus] = useState<Status>("idle");
  /*
   * The chosen build, held by id.
   *
   * It was the title, and every comparison downstream was a string match
   * against display copy. That works until the copy moves -- and it is moving:
   * Project Minecraft is a trademark the studio has been told about, and its
   * title is the one place the word appears. A rename would have quietly
   * stopped the Free Fall dialog opening with nothing to catch it.
   *
   * The title is derived where it is needed, so `project_type` keeps receiving
   * exactly the strings it always has.
   */
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0].id);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [colorId, setColorId] = useState<string | null>(null);
  /*
   * Who the work is for. Drives the brief more than the machine does — the same
   * bike shot for someone's own feed and for a dealership's campaign are two
   * different jobs.
   */
  const [usage, setUsage] = useState("personal");
  /*
   * Free Fall's answers, and whether its dialog is open.
   *
   * Kept here rather than in the dialog because the dialog is unmounted most of
   * the time and these have to survive it being closed -- dismissing keeps the
   * answers, the way dismissing the colour picker keeps the machine. It also
   * means they survive switching to another build and back, which is why the
   * payload is gated instead of the state being cleared.
   */
  const [freeFall, setFreeFall] = useState<FreeFallAnswers>(FREE_FALL_DEFAULTS);
  const [freeFallOpen, setFreeFallOpen] = useState(false);

  // Resolved once here rather than in two places: the summary the visitor reads
  // and the label sent with the request must never name different machines.
  // Priced builds carry their own figure; the rest are quoted in conversation.
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedPrice = selectedProject?.price;

  const briefed = hasBrief(selectedProjectId);
  const brief = BUILD_BRIEFS[selectedProjectId];

  /* One line of what was answered, so the row under the grid is a summary
     rather than a control labelled "Edit" with nothing visible to edit. It reads
     off the same state the dialog writes, so it cannot describe a build the
     dialog is not holding. */
  const freeFallSummary = [
    freeFall.plate.trim() ? `Plate "${freeFall.plate.trim()}"` : "No plate text",
    freeFall.stickers === "none"
      ? "no stickers"
      : `${freeFall.stickers} sticker${freeFall.stickers === "1" ? "" : "s"}`,
    brief?.environment
      ? environments.find((e) => e.id === freeFall.environment)?.name.toLowerCase() ?? ""
      : "",
    freeFall.oem === "yes" ? "OEM parts" : "stock",
    brief?.jets ? jets.find((jet) => jet.id === freeFall.jetId)?.name ?? "" : "",
    brief?.delivery
      ? deliveries.find((d) => d.id === freeFall.deliveryId)?.name ?? ""
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  /* Both undefined when the choice is Other, on purpose: there is no Vehicle
     behind that id, so nothing downstream may reach for a manufacturer, a render
     or a colour list. */
  const chosenVehicle = vehicles.find((v) => v.id === vehicleId);
  const chosenColor = chosenVehicle?.colors.find((c) => c.id === colorId);
  const isOther = vehicleId === OTHER_VEHICLE_ID;

  /* Picking Free Fall opens its brief. Picking it again reopens it, because the
     card is the obvious thing to click when you want to change an answer and a
     second click that did nothing would read as the card being stuck. */
  function handleSelectProject(id: string) {
    setSelectedProjectId(id);
    if (hasBrief(id)) setFreeFallOpen(true);
  }

  function handleSelectVehicle(id: string) {
    setVehicleId(id);
    setColorId(null); // changing the vehicle clears the color selection
    /* Start fetching the confirmation here, five steps before it can be needed.

       It used to start at the click on Submit, which reads like the right moment
       and is not: the insert is a 16ms round trip and the confirmation is a
       megabyte and a half of physics engine and model, so the request finishes
       and the reader is left watching a loader. Picking a machine is the first
       thing on this form that cannot be done by accident -- it is step 01, the
       button will not send without it, and everything after it is typing.

       Idle rather than immediately: the vehicle picker is a grid of renders and
       this must not compete with the one the reader just asked to see.
       requestIdleCallback is absent on Safari before 17, where a timeout is the
       same idea with a worse guess at when. */
    const start = () => preloadThankYou();
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(start, { timeout: 3000 });
    } else {
      window.setTimeout(start, 1200);
    }
  }

  /**
   * Take the failure notice down once the visitor does anything about it.
   *
   * "Something went wrong" was set by a failed submit and then never cleared by
   * anything — not a changed field, not a different build, not walking back
   * through the steps and forward again. So one failure pinned a red line to the
   * last step for the rest of the session, under a form that was by then in a
   * completely different state and might well submit perfectly.
   *
   * Only touches the error. A submission in flight must not be cancelled by a
   * keystroke, and a success has replaced the form with the confirmation, so
   * neither is this function's business.
   */
  function clearError() {
    setStatus((current) => (current === "error" ? "idle" : current));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    /* The button is disabled without one, so this is the second lock rather than
       the first — a form can still be submitted by pressing Enter in a field,
       and a request naming no machine is not a request. */
    if (!vehicleId) return;
    /* Second call, and a cheap one: `preloadThankYou` is idempotent -- the
       import is cached by the module system and the model behind a promise that
       is only created once. This is the backstop for the reader who reached this
       button without the idle callback ever running. */
    preloadThankYou();
    setStatus("submitting");
    const form = e.currentTarget;
    const data = new FormData(form);

    /* Other is tested first so it cannot fall through to the empty string.
       chosenColor is undefined under it, so no colour can be appended. */
    const vehicleLabel = isOther
      ? OTHER_VEHICLE_LABEL
      : chosenVehicle
        ? `${chosenVehicle.manufacturer} ${chosenVehicle.name}${
            chosenColor ? ` — ${chosenColor.name}` : ""
          }`
        : "";

    /* Say when an answer is the one nobody chose.

       The table was recording the default jet as "MiG-29", which reads in an
       inbox exactly like a client who went looking and picked the MiG-29 — and
       the difference matters, because the line under the grid prices every other
       jet against that one. Marked rather than blanked: the studio still needs to
       know which aircraft is in the shot, and an empty cell would trade one
       ambiguity for a worse one.

       Only on the way to the table. The summary the client reads on the page
       still says "MiG-29", because they are looking at the picker while they
       read it and "Default jet" there would describe nothing they can see. */
    const asDefault = (name: string, isDefault: boolean, noun: string) =>
      name && isDefault ? `Default ${noun} (${name})` : name;

    const chosenJet = jets.find((jet) => jet.id === freeFall.jetId);
    const jetName = asDefault(
      chosenJet?.name ?? "",
      Boolean(chosenJet?.isDefault),
      "jet",
    );
    const environmentName =
      environments.find((e) => e.id === freeFall.environment)?.name ?? "";
    const chosenDelivery = deliveries.find((d) => d.id === freeFall.deliveryId);
    const deliveryName = asDefault(
      chosenDelivery?.name ?? "",
      Boolean(chosenDelivery?.isDefault),
      "delivery",
    );

    const ok = await submitBookingForm({
      fullName: String(data.get("fullName") || ""),
      email: String(data.get("email") || ""),
      instagram: String(data.get("instagram") || ""),
      whatsapp: String(data.get("whatsapp") || ""),
      projectType: selectedProject?.title ?? "",
      vehicle: vehicleLabel,
      description: String(data.get("description") || ""),
      usage,
      /* The brief travels only under the build it belongs to.

         The answers are not cleared when another build is chosen -- switching
         away and back should not silently blank what someone typed -- so the
         gate is here rather than in the state. Without it a Minecraft request
         would arrive carrying a jet and a plate nobody asked it for.

         Names, not ids: the studio reads these columns, and `su-30-mkk` in an
         inbox is worse than nothing. Same reason `vehicle` is sent as a label. */
      freeFallPlate: briefed ? freeFall.plate : "",
      freeFallStickers: briefed ? freeFall.stickers : "",
      freeFallEnvironment: briefed && brief?.environment ? environmentName : "",
      freeFallOem: briefed ? freeFall.oem : "",
      freeFallOemDetails:
        briefed && freeFall.oem === "yes" ? freeFall.oemDetails : "",
      /* Both the jet and the delivery ride this one column.

         They are the same question — which aircraft is in the shot — asked of
         two builds that answer it differently, and no build turns both on. The
         alternative was a `free_fall_delivery` column, which this client cannot
         create: the insert names its columns explicitly and PostgREST rejects
         the whole row for one it does not know, so shipping that ahead of the
         migration would have broken every submission on the site rather than
         just this build's. Add the column and split these two if the studio ever
         wants them apart in the table. */
      freeFallJet: briefed
        ? brief?.jets
          ? jetName
          : brief?.delivery
            ? deliveryName
            : ""
        : "",
    }).catch(() => false);

    setStatus(ok ? "success" : "error");
  }

  return {
    status,
    selectedProjectId,
    selectedProject,
    selectedPrice,
    briefed,
    freeFall,
    setFreeFall,
    freeFallOpen,
    setFreeFallOpen,
    freeFallSummary,
    vehicleId,
    colorId,
    setColorId,
    chosenVehicle,
    chosenColor,
    isOther,
    usage,
    setUsage,
    handleSelectProject,
    handleSelectVehicle,
    handleSubmit,
    clearError,
  };
}
