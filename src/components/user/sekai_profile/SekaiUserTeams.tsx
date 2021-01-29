import React, { useState } from "react";
import { ITeamCardState } from "../../../types";
import TeamBuilder from "../../subs/TeamBuilder";

const SekaiUserTeams = () => {
  const [teamCards, setTeamCards] = useState<number[]>([]);
  const [teamCardsStates, setTeamCardsStates] = useState<ITeamCardState[]>([]);
  const [teamPowerStates, setTeamPowerStates] = useState<number>(0);

  return (
    <TeamBuilder
      teamCards={teamCards}
      teamCardsStates={teamCardsStates}
      teamPowerStates={teamPowerStates}
      setTeamCards={setTeamCards}
      setTeamCardsStates={setTeamCardsStates}
      setTeamPowerStates={setTeamPowerStates}
    ></TeamBuilder>
  );
};

export default SekaiUserTeams;
