import { describe, expect, it } from "vitest";
import { hashCanonical, type Hash } from "@pmh/domain";
import {
  assertMechanismPrototypeExplorationInputRevision,
  buildMarketCorpusSnapshot,
  buildMarketOntologySnapshot,
  buildWorldStateMechanismProposal,
  buildWorldStateMechanismPrototypeProposal,
  compileConsolidatedWorldStateMechanismRoutes,
  materializeMechanismPrototypeExplorationProjection,
  materializeWorldStateMechanismPrototypeResearchCases,
  type DiscoveryCatalogListing,
  type WorldStateMechanismProposal,
} from "../src/index.js";

const NOW = "2026-08-13T10:28:18.396Z";
const hash = (value: string): Hash => hashCanonical({ value });

function mechanismProposal(input: Readonly<{
  party: string;
  state: string;
  run: string;
}>): WorldStateMechanismProposal {
  const triggerTitle = `${input.state} Senate Election Winner — ${input.party}`;
  const dependentTitle = `U.S Senate Midterm Winner — ${input.party}`;
  const binding = (role: string, title: string) => Object.freeze({
    listingRef: `source:${input.party}:${input.state}:${role}`
      .toLowerCase().replaceAll(" ", "-"),
    title,
    nodeId: hash(`node:${input.party}:${input.state}:${role}`),
    worldFacetId: hash(`facet:${input.party}:${input.state}:${role}`),
    sourceRawHash: hash(`raw:${input.party}:${input.state}:${role}`),
    protocolIdentity: "source-protocol-v1",
  });
  return buildWorldStateMechanismProposal({
    ontologyIdentity: hash(`ontology:${input.state}`),
    sourceSnapshotIdentity: hash(`snapshot:${input.state}`),
    sourceIssueRevisionId: hash(`revision:${input.state}`),
    sourceAgentRunId: hash(`run:${input.run}`),
    sourceTrailheadIds: [hash(`trailhead:${input.state}`)],
    sourceRelationPatternIds: [hash(`pattern:${input.state}`)],
    subjectLabel: input.party,
    subjectAliases: [input.party],
    subjectAmbiguityNotes: [],
    trigger: {
      predicateLabel: triggerTitle,
      searchSignals: [input.state, input.party],
      influence: "MAY_ENABLE_STATE",
      evidenceBindings: [binding("trigger", triggerTitle)],
    },
    state: { dimension: "OFFICE_HOLDING", label: `${input.party} holds ${input.state}` },
    dependent: {
      predicateLabel: dependentTitle,
      searchSignals: ["Senate", input.party],
      requirement: "STATE_INFLUENCES_LIKELIHOOD",
      evidenceBindings: [binding("dependent", dependentTitle)],
    },
    temporalPosture: "TRIGGER_OVERLAPS_DEPENDENT",
    counterScenarios: ["Other component outcomes can determine the aggregate state."],
    rationale: "One component contributes to an aggregate chamber outcome.",
    proposedAt: NOW,
  });
}

function acceptedPrototype() {
  const sourceInput = materializeWorldStateMechanismPrototypeResearchCases(
    compileConsolidatedWorldStateMechanismRoutes([
      mechanismProposal({ party: "Democratic Party", state: "Iowa", run: "iowa" }),
      mechanismProposal({ party: "Republican Party", state: "Alaska", run: "alaska" }),
    ]),
  )[0]!.currentInputRevision;
  const prototype = buildWorldStateMechanismPrototypeProposal({
    researchInput: sourceInput,
    sourceAgentRunId: hash("prototype-run"),
    label: "One state Senate seat contributes to national Senate control",
    invariantDescription: "One component office-holding outcome influences, but neither necessitates nor suffices for, an aggregate control outcome.",
    variableSlots: [{
      name: "party subject",
      role: "SUBJECT",
      description: "The party whose component and aggregate outcomes are compared.",
      values: sourceInput.memberRoutes.map((route) => ({
        routeFamilyId: route.routeFamilyId,
        value: route.canonicalRoute.canonicalSubjectLabels[0]!,
      })),
    }],
    searchSignals: ["component seat", "aggregate control", "office holding"],
    transferTests: ["The component changes membership in the aggregate institution."],
    counterScenarios: ["Other component outcomes overwhelm this component result."],
    rationale: "The two source routes share a typed mechanism but retain distinct evidence.",
    proposedAt: NOW,
  });
  return { sourceInput, prototype };
}

function listing(input: Readonly<{
  ref: string;
  title: string;
  venue: string;
  receivedAt?: string;
  raw?: string;
  prices?: readonly [string, string];
}>): DiscoveryCatalogListing {
  return Object.freeze({
    listingRef: input.ref,
    venueId: input.venue,
    venueInstrumentId: input.ref.split(":").slice(1).join(":"),
    title: input.title,
    description: input.title,
    status: "OPEN",
    mechanism: "CENTRALIZED_ORDER_BOOK",
    closesAt: "2026-12-31T00:00:00.000Z",
    rulesText: null,
    outcomes: Object.freeze([
      Object.freeze({ venueOutcomeId: "yes", label: "Yes", indicativePrice: input.prices?.[0] ?? "0.4" }),
      Object.freeze({ venueOutcomeId: "no", label: "No", indicativePrice: input.prices?.[1] ?? "0.6" }),
    ]),
    priceScale: "1000000000000000000",
    quantityScale: "1000000000000000000",
    minPriceTick: "1",
    sourceKind: "LIVE_OBSERVATION",
    sourceReceivedAt: input.receivedAt ?? "2026-08-13T11:00:00.000Z",
    sourceRawHash: hash(input.raw ?? input.ref),
    protocolIdentity: `protocol:${input.venue}:v1`,
  });
}

function corpus(version = 1) {
  const receivedAt = version === 1
    ? "2026-08-13T11:00:00.000Z"
    : "2026-08-13T12:00:00.000Z";
  const listings = [
    listing({
      ref: "venue-house:control", venue: "venue-house",
      title: "Will Democrats control the House after the 2026 election?",
      receivedAt, raw: `house-control-${version}`,
      prices: version === 1 ? ["0.4", "0.6"] : ["0.45", "0.55"],
    }),
    listing({
      ref: "venue-district:ny17", venue: "venue-district",
      title: "Will Democrats win the New York 17th House district?",
      receivedAt, raw: `house-seat-${version}`,
      prices: version === 1 ? ["0.7", "0.3"] : ["0.65", "0.35"],
    }),
    listing({
      ref: "venue-sport:constructors", venue: "venue-sport",
      title: "Will Scuderia Ferrari win the Formula 1 constructors championship?",
      receivedAt, raw: `sport-aggregate-${version}`,
      prices: version === 1 ? ["0.2", "0.8"] : ["0.25", "0.75"],
    }),
    listing({
      ref: "venue-race:italy", venue: "venue-race",
      title: "Will Scuderia Ferrari win the Italian Grand Prix race?",
      receivedAt, raw: `sport-component-${version}`,
      prices: version === 1 ? ["0.3", "0.7"] : ["0.35", "0.65"],
    }),
  ];
  return buildMarketCorpusSnapshot({
    sourceSetIdentity: hash("exploration-source-set"),
    eligibleSourceCount: 4,
    excludedSourceCount: 0,
    listings,
  });
}

describe("mechanism-prototype-guided exploration substrate", () => {
  it("materializes differentiated zero-authority search lenses from one prototype", () => {
    const { sourceInput, prototype } = acceptedPrototype();
    const snapshot = corpus();
    const projection = materializeMechanismPrototypeExplorationProjection({
      prototypes: [prototype],
      prototypeInputs: [sourceInput],
      corpus: snapshot,
      ontology: buildMarketOntologySnapshot(snapshot),
    });

    expect(projection).toMatchObject({
      prototypeCount: 1,
      lensCount: 4,
      eligibleLensCount: 4,
      effects: {
        providerRequests: 0, modelInvocations: 0, runs: 0, campaigns: 0,
        dispatches: 0, externalWrites: 0, valueMovingActions: 0,
      },
    });
    expect(projection.lenses.map((item) => item.axis).sort()).toEqual([
      "AGGREGATE_INSTITUTION", "COUNTEREXAMPLE_FRONTIER",
      "SUBJECT_AND_GEOGRAPHY", "SURFACE_DOMAIN",
    ]);
    expect(projection.lenses.every((item) =>
      item.currentInputRevision.excludedListingRefs.every((ref) =>
        item.currentInputRevision.seedTrailheads.every((seed) =>
          !seed.listingRefs.includes(ref)
        )
      )
    )).toBe(true);
    expect(projection.lenses.find((item) => item.axis === "SURFACE_DOMAIN")
      ?.currentInputRevision.seedTrailheads.some((seed) =>
        seed.predicateFamilies.includes("SPORTS_RESULT")
      )).toBe(true);
    expect(projection.lenses.find((item) => item.axis === "AGGREGATE_INSTITUTION")
      ?.currentInputRevision.seedTrailheads.some((seed) =>
        seed.listingRefs.includes("venue-house:control")
      )).toBe(true);
    for (const lens of projection.lenses) {
      expect(assertMechanismPrototypeExplorationInputRevision(
        lens.currentInputRevision,
      )).toEqual(lens.currentInputRevision);
      expect(lens).toMatchObject({
        automaticDispatch: false,
        semanticDecisionAuthority: false,
        probabilityAuthority: false,
        certificateAuthority: false,
        executionAuthority: false,
        externalWriteAuthority: false,
        valueMovingAuthority: false,
      });
    }
  });

  it("keeps semantic input stable across price and receive-time observations", () => {
    const { sourceInput, prototype } = acceptedPrototype();
    const firstCorpus = corpus(1);
    const secondCorpus = corpus(2);
    const first = materializeMechanismPrototypeExplorationProjection({
      prototypes: [prototype], prototypeInputs: [sourceInput], corpus: firstCorpus,
      ontology: buildMarketOntologySnapshot(firstCorpus),
    });
    const second = materializeMechanismPrototypeExplorationProjection({
      prototypes: [prototype], prototypeInputs: [sourceInput], corpus: secondCorpus,
      ontology: buildMarketOntologySnapshot(secondCorpus),
    });

    expect(first.corpusSnapshotIdentity).not.toBe(second.corpusSnapshotIdentity);
    expect(first.corpusSemanticIdentity).toBe(second.corpusSemanticIdentity);
    for (const firstLens of first.lenses) {
      const secondLens = second.lenses.find((item) => item.lensId === firstLens.lensId)!;
      expect(firstLens.currentInputRevision.inputRevisionId)
        .not.toBe(secondLens.currentInputRevision.inputRevisionId);
      expect(firstLens.currentInputRevision.semanticInputIdentity)
        .toBe(secondLens.currentInputRevision.semanticInputIdentity);
    }
  });

  it("fails closed when prototype source input lineage is unavailable", () => {
    const { prototype } = acceptedPrototype();
    const snapshot = corpus();
    expect(() => materializeMechanismPrototypeExplorationProjection({
      prototypes: [prototype],
      prototypeInputs: [],
      corpus: snapshot,
      ontology: buildMarketOntologySnapshot(snapshot),
    })).toThrow("source prototype input is unavailable");
  });
});
