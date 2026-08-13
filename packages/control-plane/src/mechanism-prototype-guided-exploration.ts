import { hashCanonical, type Hash } from "@pmh/domain";
import {
  assertMarketCorpusSnapshot,
  type MarketCorpusSnapshot,
} from "./market-corpus.js";
import {
  assertMarketOntologySnapshot,
  marketOntologyPredicateFamiliesForText,
  type MarketOntologyPredicateFamily,
  type MarketOntologySnapshot,
  type MarketOntologyTrailhead,
} from "./market-ontology.js";
import { buildSearchScopeIdentity } from "./search-scope-identity.js";
import {
  assertWorldStateMechanismPrototypeInput,
  assertWorldStateMechanismPrototypeProposal,
  type WorldStateMechanismPrototypeInputRevision,
  type WorldStateMechanismPrototypeProposal,
} from "./world-state-mechanism-prototype.js";
import { adjacentWorldStateProperNameToken } from
  "./world-state-mechanism-allocation.js";

const HASH_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const MAX_SEEDS_PER_LENS = 8;
const ESTABLISHED_AT = "2026-08-13T00:00:00.000Z";

export const MECHANISM_PROTOTYPE_EXPLORATION_AXES = Object.freeze([
  "AGGREGATE_INSTITUTION",
  "SUBJECT_AND_GEOGRAPHY",
  "SURFACE_DOMAIN",
  "COUNTEREXAMPLE_FRONTIER",
] as const);

export type MechanismPrototypeExplorationAxis =
  (typeof MECHANISM_PROTOTYPE_EXPLORATION_AXES)[number];

export type MechanismPrototypeExplorationSeed = Readonly<{
  schemaVersion: "pmh.mechanism-prototype-exploration-seed.v1";
  seedId: Hash;
  sourceTrailheadId: Hash;
  listingRefs: readonly [string, string];
  listingTitleExcerpts: readonly [string, string];
  matchedPrototypeSignals: readonly string[];
  predicateFamilies: readonly MarketOntologyPredicateFamily[];
  changedFacets: MarketOntologyTrailhead["changedFacets"];
  selectionLane: MarketOntologyTrailhead["selectionLane"];
  axis: MechanismPrototypeExplorationAxis;
  lexicalScore: number;
  noveltyReasons: readonly string[];
  authority: "PROVIDER_FREE_EXPLORATION_SEED_ONLY";
  semanticDecisionAuthority: false;
  probabilityAuthority: false;
  certificateAuthority: false;
  executionAuthority: false;
  externalWriteAuthority: false;
  valueMovingAuthority: false;
}>;

export type MechanismPrototypeExplorationInputRevision = Readonly<{
  schemaVersion: "pmh.mechanism-prototype-exploration-input.v1";
  inputRevisionId: Hash;
  lensId: Hash;
  prototypeId: Hash;
  sourcePrototypeInputRevisionId: Hash;
  axis: MechanismPrototypeExplorationAxis;
  semanticInputIdentity: Hash;
  corpusSnapshotIdentity: Hash;
  corpusSemanticIdentity: Hash;
  sourceSetIdentity: Hash;
  ontologyIdentity: Hash;
  knownMemberRouteFamilyIds: readonly Hash[];
  excludedListingRefs: readonly string[];
  seedTrailheads: readonly MechanismPrototypeExplorationSeed[];
  materializedAt: string;
  inputBinding: "EXACT_CURRENT_CORPUS_OBSERVATION_WITH_PRICE_INDEPENDENT_SEMANTIC_IDENTITY";
  authority: "PROTOTYPE_GUIDED_SEARCH_INPUT_ONLY";
  semanticDecisionAuthority: false;
  probabilityAuthority: false;
  certificateAuthority: false;
  executionAuthority: false;
  externalWriteAuthority: false;
  valueMovingAuthority: false;
}>;

export type MechanismPrototypeExplorationLens = Readonly<{
  schemaVersion: "pmh.mechanism-prototype-exploration-lens.v1";
  lensId: Hash;
  prototype: WorldStateMechanismPrototypeProposal;
  sourcePrototypeInput: WorldStateMechanismPrototypeInputRevision;
  axis: MechanismPrototypeExplorationAxis;
  variationQuestion: string;
  currentInputRevision: MechanismPrototypeExplorationInputRevision;
  state: "UNEXPLORED";
  campaignEligible: boolean;
  automaticDispatch: false;
  authority: "HEURISTIC_EXPLORATION_ASSIGNMENT_ONLY";
  semanticDecisionAuthority: false;
  probabilityAuthority: false;
  certificateAuthority: false;
  executionAuthority: false;
  externalWriteAuthority: false;
  valueMovingAuthority: false;
}>;

export type MechanismPrototypeExplorationProjection = Readonly<{
  schemaVersion: "pmh.mechanism-prototype-exploration-projection.v1";
  projectionIdentity: Hash;
  prototypeCount: number;
  lensCount: number;
  eligibleLensCount: number;
  seededLensCount: number;
  zeroSeedLensCount: number;
  seedCount: number;
  axisCounts: Readonly<Record<MechanismPrototypeExplorationAxis, number>>;
  corpusSnapshotIdentity: Hash;
  corpusSemanticIdentity: Hash;
  lenses: readonly MechanismPrototypeExplorationLens[];
  effects: Readonly<{
    providerRequests: 0;
    modelInvocations: 0;
    runs: 0;
    campaigns: 0;
    dispatches: 0;
    externalWrites: 0;
    valueMovingActions: 0;
  }>;
}>;

function canonicalText(value: string): string {
  return value.trim().replace(/\s+/gu, " ").normalize("NFKC")
    .toLocaleLowerCase("en-US");
}

function exactStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

function exactHashes(values: readonly Hash[]): readonly Hash[] {
  const result = exactStrings(values);
  if (result.some((value) => !HASH_PATTERN.test(value))) {
    throw new Error("mechanism exploration lineage contains an invalid hash");
  }
  return result as readonly Hash[];
}

function assertExplorationSeed(value: unknown): MechanismPrototypeExplorationSeed {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("mechanism exploration seed is malformed");
  }
  const seed = value as MechanismPrototypeExplorationSeed;
  const keys = Object.keys(seed).sort();
  const expected = [
    "schemaVersion", "seedId", "sourceTrailheadId", "listingRefs",
    "listingTitleExcerpts", "matchedPrototypeSignals", "predicateFamilies",
    "changedFacets", "selectionLane", "axis", "lexicalScore", "noveltyReasons",
    "authority", "semanticDecisionAuthority", "probabilityAuthority",
    "certificateAuthority", "executionAuthority", "externalWriteAuthority",
    "valueMovingAuthority",
  ].sort();
  const { seedId, ...body } = seed;
  if (
    keys.length !== expected.length || keys.some((key, index) => key !== expected[index]) ||
    seed.schemaVersion !== "pmh.mechanism-prototype-exploration-seed.v1" ||
    !HASH_PATTERN.test(String(seedId)) || seedId !== hashCanonical(body) ||
    !HASH_PATTERN.test(String(seed.sourceTrailheadId)) ||
    !Array.isArray(seed.listingRefs) || seed.listingRefs.length !== 2 ||
    new Set(seed.listingRefs).size !== 2 || seed.listingRefs.some((item) =>
      typeof item !== "string" || item.trim() === ""
    ) ||
    !Array.isArray(seed.listingTitleExcerpts) || seed.listingTitleExcerpts.length !== 2 ||
    seed.listingTitleExcerpts.some((item) => typeof item !== "string" || item.trim() === "") ||
    exactStrings(seed.matchedPrototypeSignals).join("\n") !==
      seed.matchedPrototypeSignals.join("\n") ||
    exactStrings(seed.predicateFamilies).join("\n") !== seed.predicateFamilies.join("\n") ||
    !MECHANISM_PROTOTYPE_EXPLORATION_AXES.includes(seed.axis) ||
    !Number.isSafeInteger(seed.lexicalScore) || seed.lexicalScore < 0 ||
    exactStrings(seed.noveltyReasons).join("\n") !== seed.noveltyReasons.join("\n") ||
    seed.authority !== "PROVIDER_FREE_EXPLORATION_SEED_ONLY" ||
    seed.semanticDecisionAuthority !== false || seed.probabilityAuthority !== false ||
    seed.certificateAuthority !== false || seed.executionAuthority !== false ||
    seed.externalWriteAuthority !== false || seed.valueMovingAuthority !== false
  ) throw new Error("mechanism exploration seed violates its bounded contract");
  return Object.freeze(seed);
}

function tokens(values: readonly string[]): ReadonlySet<string> {
  return new Set(values.flatMap((value) => canonicalText(value)
    .split(/[^\p{L}\p{N}]+/gu)
    .filter((item) => item.length >= 3)));
}

function latestSourceTime(corpus: MarketCorpusSnapshot): string {
  const latest = corpus.listings.map((item) => item.sourceReceivedAt).sort().at(-1) ??
    ESTABLISHED_AT;
  if (!Number.isFinite(Date.parse(latest)) || new Date(latest).toISOString() !== latest) {
    throw new Error("mechanism exploration corpus time is invalid");
  }
  return latest;
}

function knownListingRefs(input: WorldStateMechanismPrototypeInputRevision): readonly string[] {
  return exactStrings(input.memberRoutes.flatMap((route) => [
    ...route.triggerEvidenceBindings.map((item) => item.listingRef),
    ...route.dependentEvidenceBindings.map((item) => item.listingRef),
  ]));
}

function sourcePredicateFamilies(
  input: WorldStateMechanismPrototypeInputRevision,
): ReadonlySet<MarketOntologyPredicateFamily> {
  return new Set(input.memberRoutes.flatMap((route) => [
    ...marketOntologyPredicateFamiliesForText(route.canonicalRoute.triggerPredicate),
    ...marketOntologyPredicateFamiliesForText(route.canonicalRoute.dependentPredicate),
  ]));
}

function lensIdentity(
  prototype: WorldStateMechanismPrototypeProposal,
  axis: MechanismPrototypeExplorationAxis,
): Hash {
  return hashCanonical({
    schemaVersion: "pmh.mechanism-prototype-exploration-lens-identity.v1",
    prototypeId: prototype.prototypeId,
    axis,
  });
}

function variationQuestion(axis: MechanismPrototypeExplorationAxis): string {
  if (axis === "AGGREGATE_INSTITUTION") {
    return "Keep the proposed component-to-aggregate posture, but vary the aggregate institution or chamber. Seek exact markets and test whether one component can affect, but neither necessitates nor suffices for, the aggregate outcome.";
  }
  if (axis === "SUBJECT_AND_GEOGRAPHY") {
    return "Vary the subject and component geography beyond every known member. Reject a mere wording clone and test whether the same role structure survives the new place and subject.";
  }
  if (axis === "SURFACE_DOMAIN") {
    return "Search outside the source election taxonomy for a structurally analogous component-to-aggregate mechanism. Prefer an analogy that changes predicate family and state where the prototype transfer breaks.";
  }
  return "Search first for exact markets that defeat one transfer test or activate a retained counter-scenario. A grounded negative result is preferable to forcing an analogy.";
}

function componentCue(title: string): boolean {
  return /\b(?:district|state (?:senate|house|election)|senate election|house district|primary|grand prix|race|match|game|round|heat|fixture)\b/iu
    .test(title);
}

function aggregateCue(title: string): boolean {
  return /\b(?:control (?:the )?(?:house|senate)|u\.?s\.? (?:house|senate) midterm winner|majority|constructors championship|overall championship|league champion|tournament champion|national champion)\b/iu
    .test(title);
}

function institutionFamilies(title: string): ReadonlySet<string> {
  const values: string[] = [];
  if (/\bsenate\b/iu.test(title)) values.push("SENATE");
  if (/\bhouse\b/iu.test(title)) values.push("HOUSE");
  if (/\bconstructors?\b|\bformula 1\b|\bf1\b/iu.test(title)) values.push("F1");
  if (/\b(?:league|mls|nba|nfl|mlb|nhl)\b/iu.test(title)) values.push("LEAGUE");
  if (/\b(?:tournament|cup)\b/iu.test(title)) values.push("TOURNAMENT");
  return new Set(values);
}

function buildSeed(input: Readonly<{
  trailhead: MarketOntologyTrailhead;
  ontology: MarketOntologySnapshot;
  prototype: WorldStateMechanismPrototypeProposal;
  sourceInput: WorldStateMechanismPrototypeInputRevision;
  axis: MechanismPrototypeExplorationAxis;
}>): MechanismPrototypeExplorationSeed | null {
  const excluded = new Set(knownListingRefs(input.sourceInput));
  if (input.trailhead.listingRefs.some((ref) => excluded.has(ref))) return null;
  const nodes = input.trailhead.listingRefs.map((ref) =>
    input.ontology.nodes.find((item) => item.listingRef === ref)
  );
  if (nodes.some((item) => item === undefined)) {
    throw new Error("mechanism exploration trailhead is absent from its ontology");
  }
  const predicateFamilies = exactStrings(nodes.flatMap((item) =>
    item!.worldFacet.predicateFamilies
  )) as readonly MarketOntologyPredicateFamily[];
  const sourceFamilies = sourcePredicateFamilies(input.sourceInput);
  const prototypeSignals = exactStrings([
    ...input.prototype.searchSignals,
    ...input.prototype.variableSlots.flatMap((slot) =>
      slot.values.map((item) => item.value)
    ),
  ]);
  const prototypeTokens = tokens(prototypeSignals);
  const titleTokens = tokens(input.trailhead.listingTitleExcerpts);
  const matchedPrototypeSignals = exactStrings(prototypeSignals.filter((signal) => {
    const signalTokens = [...tokens([signal])];
    return signalTokens.length > 0 && signalTokens.every((item) => titleTokens.has(item));
  }));
  const tokenOverlap = [...prototypeTokens].filter((item) => titleTokens.has(item)).length;
  const knownSubjects = tokens(input.sourceInput.memberRoutes.flatMap((route) =>
    route.canonicalRoute.canonicalSubjectLabels
  ));
  const sharedSubjectsAreNew = input.trailhead.sharedSubjectSignals.every((signal) =>
    !knownSubjects.has(canonicalText(signal))
  );
  const singleSignal = input.trailhead.sharedSubjectSignals.length === 1
    ? input.trailhead.sharedSubjectSignals[0]!
    : null;
  const properNeighbors = singleSignal === null ? []
    : input.trailhead.listingTitleExcerpts.map((title) =>
        adjacentWorldStateProperNameToken(title, singleSignal)
      );
  const singleSignalProperNameAmbiguity = singleSignal !== null &&
    properNeighbors.length === 2 && properNeighbors.every((item) => item !== null) &&
    properNeighbors[0] !== properNeighbors[1];
  const changesDomain = predicateFamilies.some((family) => !sourceFamilies.has(family));
  const aggregateLanguage = input.trailhead.listingTitleExcerpts.some((title) =>
    /\b(?:control|majority|champion|championship|winner|qualif|aggregate|overall)\b/iu.test(title)
  );
  const componentIndexes = input.trailhead.listingTitleExcerpts.flatMap((title, index) =>
    componentCue(title) ? [index] : []
  );
  const aggregateIndexes = input.trailhead.listingTitleExcerpts.flatMap((title, index) =>
    aggregateCue(title) ? [index] : []
  );
  const distinctComponentAggregateRoles = componentIndexes.some((componentIndex) =>
    aggregateIndexes.some((aggregateIndex) => aggregateIndex !== componentIndex)
  );
  const roleInstitutionAligned = componentIndexes.some((componentIndex) => {
    const componentFamilies = institutionFamilies(
      input.trailhead.listingTitleExcerpts[componentIndex]!,
    );
    return aggregateIndexes.some((aggregateIndex) => aggregateIndex !== componentIndex &&
      [...componentFamilies].some((family) => institutionFamilies(
        input.trailhead.listingTitleExcerpts[aggregateIndex]!,
      ).has(family))
    );
  });
  const hasElectionOrOffice = predicateFamilies.includes("ELECTION_OR_OFFICE");
  const hasFalsificationFacet = input.trailhead.changedFacets.some((facet) =>
    ["WORLD_PREDICATE", "OUTCOME_SPACE", "SETTLEMENT_EVIDENCE", "MECHANISM"]
      .includes(facet)
  );
  const eligible = !singleSignalProperNameAmbiguity &&
    distinctComponentAggregateRoles && (
    input.axis === "AGGREGATE_INSTITUTION"
    ? hasElectionOrOffice && aggregateLanguage && !changesDomain && roleInstitutionAligned
    : input.axis === "SUBJECT_AND_GEOGRAPHY"
    ? hasElectionOrOffice && sharedSubjectsAreNew && !changesDomain && roleInstitutionAligned
    : input.axis === "SURFACE_DOMAIN"
    ? changesDomain && input.trailhead.sharedSubjectSignals.length > 1
    : hasFalsificationFacet
  );
  if (!eligible) return null;
  const noveltyReasons = exactStrings([
    ...(sharedSubjectsAreNew ? ["shared subject signals are outside known members"] : []),
    ...(changesDomain ? ["predicate family differs from source routes"] : []),
    ...(aggregateLanguage ? ["titles expose a component or aggregate outcome cue"] : []),
    ...(distinctComponentAggregateRoles
      ? ["different titles expose component and aggregate roles"] : []),
    ...(roleInstitutionAligned
      ? ["component and aggregate titles name the same institution family"] : []),
    ...(hasFalsificationFacet ? ["pair changes a transfer-relevant world or settlement facet"] : []),
  ]);
  const axisBonus = input.axis === "SURFACE_DOMAIN" && changesDomain ? 3_000
    : input.axis === "SUBJECT_AND_GEOGRAPHY" && sharedSubjectsAreNew ? 2_500
    : input.axis === "COUNTEREXAMPLE_FRONTIER" && hasFalsificationFacet ? 2_000
    : input.axis === "AGGREGATE_INSTITUTION" && aggregateLanguage ? 1_500 : 0;
  const body = Object.freeze({
    schemaVersion: "pmh.mechanism-prototype-exploration-seed.v1" as const,
    sourceTrailheadId: input.trailhead.trailheadId,
    listingRefs: input.trailhead.listingRefs,
    listingTitleExcerpts: input.trailhead.listingTitleExcerpts,
    matchedPrototypeSignals,
    predicateFamilies,
    changedFacets: input.trailhead.changedFacets,
    selectionLane: input.trailhead.selectionLane,
    axis: input.axis,
    lexicalScore: input.trailhead.score + tokenOverlap * 500 +
      matchedPrototypeSignals.length * 750 + axisBonus,
    noveltyReasons,
    authority: "PROVIDER_FREE_EXPLORATION_SEED_ONLY" as const,
    semanticDecisionAuthority: false as const,
    probabilityAuthority: false as const,
    certificateAuthority: false as const,
    executionAuthority: false as const,
    externalWriteAuthority: false as const,
    valueMovingAuthority: false as const,
  });
  return assertExplorationSeed(Object.freeze({ ...body, seedId: hashCanonical(body) }));
}

function verifyPrototypeLineage(input: Readonly<{
  prototype: WorldStateMechanismPrototypeProposal;
  sourceInput: WorldStateMechanismPrototypeInputRevision;
}>): void {
  if (
    input.prototype.inputRevisionId !== input.sourceInput.revisionId ||
    input.prototype.candidateId !== input.sourceInput.candidateId ||
    input.prototype.memberRouteFamilyIds.join("\n") !==
      input.sourceInput.memberRouteFamilyIds.join("\n") ||
    hashCanonical(input.prototype.invariantSignature) !==
      hashCanonical(input.sourceInput.signature)
  ) {
    throw new Error("mechanism exploration prototype lineage is inconsistent");
  }
}

export function materializeMechanismPrototypeExplorationProjection(input: Readonly<{
  prototypes: readonly WorldStateMechanismPrototypeProposal[];
  prototypeInputs: readonly WorldStateMechanismPrototypeInputRevision[];
  corpus: MarketCorpusSnapshot;
  ontology: MarketOntologySnapshot;
}>): MechanismPrototypeExplorationProjection {
  const corpus = assertMarketCorpusSnapshot(input.corpus);
  const ontology = assertMarketOntologySnapshot(input.ontology);
  if (ontology.sourceSnapshotIdentity !== corpus.snapshotIdentity) {
    throw new Error("mechanism exploration ontology and corpus lineage differ");
  }
  const prototypes = input.prototypes.map(assertWorldStateMechanismPrototypeProposal);
  const sourceInputs = input.prototypeInputs.map(assertWorldStateMechanismPrototypeInput);
  const sourceByRevision = new Map(sourceInputs.map((item) => [item.revisionId, item] as const));
  const corpusSemanticIdentity = buildSearchScopeIdentity(corpus.listings)
    .semanticScopeIdentity;
  const lenses = Object.freeze(prototypes.flatMap((prototype) => {
    const sourceInput = sourceByRevision.get(prototype.inputRevisionId);
    if (sourceInput === undefined) {
      throw new Error("mechanism exploration source prototype input is unavailable");
    }
    verifyPrototypeLineage({ prototype, sourceInput });
    return MECHANISM_PROTOTYPE_EXPLORATION_AXES.map((axis) => {
      const lensId = lensIdentity(prototype, axis);
      const seedTrailheads = Object.freeze(ontology.trailheads
        .flatMap((trailhead) => {
          const seed = buildSeed({ trailhead, ontology, prototype, sourceInput, axis });
          return seed === null ? [] : [seed];
        })
        .sort((left, right) => right.lexicalScore - left.lexicalScore ||
          left.seedId.localeCompare(right.seedId))
        .slice(0, MAX_SEEDS_PER_LENS));
      const excludedListingRefs = knownListingRefs(sourceInput);
      const semanticInputIdentity = hashCanonical({
        schemaVersion: "pmh.mechanism-prototype-exploration-semantic-input.v1",
        lensId,
        prototypeId: prototype.prototypeId,
        sourcePrototypeInputRevisionId: sourceInput.revisionId,
        corpusSemanticIdentity,
        knownMemberRouteFamilyIds: sourceInput.memberRouteFamilyIds,
        excludedListingRefs,
        seedTrailheadIds: seedTrailheads.map((item) => item.seedId),
      });
      const revisionBody = Object.freeze({
        schemaVersion: "pmh.mechanism-prototype-exploration-input.v1" as const,
        lensId,
        prototypeId: prototype.prototypeId,
        sourcePrototypeInputRevisionId: sourceInput.revisionId,
        axis,
        semanticInputIdentity,
        corpusSnapshotIdentity: corpus.snapshotIdentity,
        corpusSemanticIdentity,
        sourceSetIdentity: corpus.sourceSetIdentity,
        ontologyIdentity: ontology.ontologyIdentity,
        knownMemberRouteFamilyIds: sourceInput.memberRouteFamilyIds,
        excludedListingRefs,
        seedTrailheads,
        materializedAt: latestSourceTime(corpus),
        inputBinding:
          "EXACT_CURRENT_CORPUS_OBSERVATION_WITH_PRICE_INDEPENDENT_SEMANTIC_IDENTITY" as const,
        authority: "PROTOTYPE_GUIDED_SEARCH_INPUT_ONLY" as const,
        semanticDecisionAuthority: false as const,
        probabilityAuthority: false as const,
        certificateAuthority: false as const,
        executionAuthority: false as const,
        externalWriteAuthority: false as const,
        valueMovingAuthority: false as const,
      });
      const currentInputRevision = Object.freeze({
        ...revisionBody, inputRevisionId: hashCanonical(revisionBody),
      });
      return Object.freeze({
        schemaVersion: "pmh.mechanism-prototype-exploration-lens.v1" as const,
        lensId,
        prototype,
        sourcePrototypeInput: sourceInput,
        axis,
        variationQuestion: variationQuestion(axis),
        currentInputRevision,
        state: "UNEXPLORED" as const,
        campaignEligible: true,
        automaticDispatch: false as const,
        authority: "HEURISTIC_EXPLORATION_ASSIGNMENT_ONLY" as const,
        semanticDecisionAuthority: false as const,
        probabilityAuthority: false as const,
        certificateAuthority: false as const,
        executionAuthority: false as const,
        externalWriteAuthority: false as const,
        valueMovingAuthority: false as const,
      });
    });
  }).sort((left, right) => left.lensId.localeCompare(right.lensId)));
  const axisCounts = Object.freeze(Object.fromEntries(
    MECHANISM_PROTOTYPE_EXPLORATION_AXES.map((axis) => [
      axis, lenses.filter((item) => item.axis === axis).length,
    ]),
  ) as Record<MechanismPrototypeExplorationAxis, number>);
  const body = Object.freeze({
    schemaVersion: "pmh.mechanism-prototype-exploration-projection.v1" as const,
    prototypeCount: prototypes.length,
    lensCount: lenses.length,
    eligibleLensCount: lenses.filter((item) => item.campaignEligible).length,
    seededLensCount: lenses.filter((item) =>
      item.currentInputRevision.seedTrailheads.length > 0
    ).length,
    zeroSeedLensCount: lenses.filter((item) =>
      item.currentInputRevision.seedTrailheads.length === 0
    ).length,
    seedCount: lenses.reduce((sum, item) =>
      sum + item.currentInputRevision.seedTrailheads.length, 0
    ),
    axisCounts,
    corpusSnapshotIdentity: corpus.snapshotIdentity,
    corpusSemanticIdentity,
    lenses,
    effects: Object.freeze({
      providerRequests: 0 as const,
      modelInvocations: 0 as const,
      runs: 0 as const,
      campaigns: 0 as const,
      dispatches: 0 as const,
      externalWrites: 0 as const,
      valueMovingActions: 0 as const,
    }),
  });
  return Object.freeze({ ...body, projectionIdentity: hashCanonical(body) });
}

export function assertMechanismPrototypeExplorationInputRevision(
  value: unknown,
): MechanismPrototypeExplorationInputRevision {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("mechanism exploration input is malformed");
  }
  const revision = value as MechanismPrototypeExplorationInputRevision;
  const { inputRevisionId, ...body } = revision;
  if (
    revision.schemaVersion !== "pmh.mechanism-prototype-exploration-input.v1" ||
    !HASH_PATTERN.test(String(inputRevisionId)) || inputRevisionId !== hashCanonical(body) ||
    ![revision.lensId, revision.prototypeId, revision.sourcePrototypeInputRevisionId,
      revision.semanticInputIdentity, revision.corpusSnapshotIdentity,
      revision.corpusSemanticIdentity, revision.sourceSetIdentity,
      revision.ontologyIdentity].every((item) => HASH_PATTERN.test(String(item))) ||
    !MECHANISM_PROTOTYPE_EXPLORATION_AXES.includes(revision.axis) ||
    exactHashes(revision.knownMemberRouteFamilyIds).join("\n") !==
      revision.knownMemberRouteFamilyIds.join("\n") ||
    exactStrings(revision.excludedListingRefs).join("\n") !==
      revision.excludedListingRefs.join("\n") ||
    !Array.isArray(revision.seedTrailheads) ||
    revision.seedTrailheads.length > MAX_SEEDS_PER_LENS ||
    revision.seedTrailheads.some((seedInput) => {
      const seed = assertExplorationSeed(seedInput);
      return seed.axis !== revision.axis ||
      seed.listingRefs.some((ref: string) => revision.excludedListingRefs.includes(ref))
    }) ||
    revision.inputBinding !==
      "EXACT_CURRENT_CORPUS_OBSERVATION_WITH_PRICE_INDEPENDENT_SEMANTIC_IDENTITY" ||
    revision.authority !== "PROTOTYPE_GUIDED_SEARCH_INPUT_ONLY" ||
    revision.semanticDecisionAuthority !== false || revision.probabilityAuthority !== false ||
    revision.certificateAuthority !== false || revision.executionAuthority !== false ||
    revision.externalWriteAuthority !== false || revision.valueMovingAuthority !== false
  ) throw new Error("mechanism exploration input violates its bounded contract");
  return Object.freeze(revision);
}
