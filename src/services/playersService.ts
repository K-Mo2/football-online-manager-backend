import { Player, Team } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { faker } from "@faker-js/faker";

// Constants for player positions and team names
const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];

// Helper function to generate a random player
export const createPlayer = (
  teamId: number,
  position?: string,
  isMarketListed?: boolean
) => {
  return {
    name: faker.person.fullName({ sex: "male" }),
    number: faker.number.int({ min: 1, max: 100 }),
    price: parseFloat(
      faker.finance.amount({
        min: 100000,
        max: 1000000,
        dec: 0,
      })
    ), // Price between 1M and 10M
    position: position || faker.helpers.arrayElement(POSITIONS),
    teamId: teamId,
    isMarketListed: isMarketListed || true,
  };
};

export const createPlayers = async function (
  teamId: number,
  position?: string,
  isMarketListed?: boolean
) {
  const playerData = createPlayer(teamId, position, isMarketListed);
  const player = await prisma.player.create({
    data: playerData,
  });
  return player;
};

// Helper function to generate team names
export const generateTeamName = () => {
  const cityName = faker.location.city();
  const suffixes = ["United", "City", "FC", "Athletic", "Rovers"];
  const suffix = faker.helpers.arrayElement(suffixes);
  return `${cityName} ${suffix}`;
};

export const createTeamsWithPlayers = async function (
  numberOfTeams: number,
  playersPerTeam: number
) {
  // Create teams
  const teams: Team[] = [];
  for (let i = 0; i < numberOfTeams; i++) {
    const team = await prisma.team.create({
      data: {
        name: generateTeamName(),
      },
    });
    teams.push(team);
    console.log(`Created team: ${team.name}`);

    // Create players for each team
    const players: Player[] = [];
    for (let j = 0; j < playersPerTeam; j++) {
      const player = await createPlayers(team.id);
      players.push(player);
    }
    console.log(`Created ${players.length} players for ${team.name}`);
  }
};

export const createNewUserPack = async function () {
  const team = await prisma.team.create({
    data: {
      name: generateTeamName(),
    },
  });
  console.log(`Created team: ${team.name}`);

  // Create players for each team
  const players: Player[] = [];
  for (let i = 1; i <= 20; i++) {
    if (i >= 1 && i <= 3) {
      const player = await createPlayers(team.id, "Goalkeeper", false);
      players.push(player);
    }

    if (i > 3 && i <= 9) {
      const player = await createPlayers(team.id, "Defender", false);
      players.push(player);
    }

    if (i > 9 && i <= 15) {
      const player = await createPlayers(team.id, "Midfielder", false);
      players.push(player);
    }

    if (i > 15 && i <= 20) {
      const player = await createPlayers(team.id, "Attacker", false);
      players.push(player);
    }
  }
  console.log(`Created ${players.length} players for ${team.name}`);
  return team.id;
};
