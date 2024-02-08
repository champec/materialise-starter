import { acuteOtitisMediaDecisionTree } from "./decisionTrees/AOMTree"
import { acuteSinusitisDecisionTree } from "./decisionTrees/SinusitisTree"
import { acuteSoreThroatDecisionTree } from "./decisionTrees/SoreThroatTree"
import { impetigoDecisionTree } from "./decisionTrees/ImpetigoTree"
import { shinglesDecisionTree } from "./decisionTrees/ShinglesTree"
import { uncomplicatedUrinaryTractInfectionDecisionTree } from "./decisionTrees/UTITree"
import { infectedInsectBitesDecisionTree } from "./decisionTrees/InfectedBitesTree"


export const DecisionTrees = {
  Earache: acuteOtitisMediaDecisionTree,
  Sinusitis: acuteSinusitisDecisionTree,
  Sore_Throat: acuteSoreThroatDecisionTree,
  Impetigo: impetigoDecisionTree,
  Shingles: shinglesDecisionTree,
  UTI: uncomplicatedUrinaryTractInfectionDecisionTree,
  Infected_Insect_Bites: infectedInsectBitesDecisionTree
}
