export interface GetCrewV1Response {
    sequenceNumber: number;
    response: {
        requestId: number;
        type: string;
        payload: {
            success: boolean;
            crewData: CrewData;
        }
    }
}

export interface CrewData {
    crewId: string;
    crewName: string;
    status: string;
    starPlayers: {
        MVP: string;
        RISING: string;
        LEGEND: string;  
    }
    roster: [];
    crewTotalScore: string;
    homeTurf: string;
    spotlightStartHour: number;
    spotlightDurationTimeMinutes: string;
    createdDate: string;
    updatedDate: string;
    promotionsCount: number;
    relegationsCount: number;
    recordScore: string;
    firstPlaceCount: number;
    lastPlaceCount: number;
    leagueChampionCount: number;
    eligibilityKey: {
        platform: string;
    }
}

export interface GetCrewByPlayerIdV1Response {
    sequenceNumber: number;
    response: {
        requestId: number;
        type: string;
        payload: {
            success: boolean;
            noCrew: number | undefined;
            crewEntry: CrewData;
        }
    }
}

export interface GetCrewRosterV2Response {
    sequenceNumber: number;
    response: {
        requestId: number;
        type: string;
        payload: {
            success: boolean;
            players: CrewPlayer[];
            starPlayers: {
                MVP: string;
                RISING: string;
                LEGEND: string;
            }
            homeTurf: string;
            spotlightStartHour: number;
            spotlightDurationTimeMinutes: string;
            divisionId: {
                divisionId: string;
                divisionName: string;
                divisionType: string;
            }
            divisionRules: {
                divisionThreshold: number;
                playerScoresCount: number;
                wildcardScoresCount: number;
            }
            nextAutomationDate: string;
            leagueInfo: {
                leagueId: string;
                leagueNameIdx: number;
                status: string;
            }
        }
    }
}

export interface CrewPlayer {
    playerId: string;
    playerPoints: string;
    lifetimePoints: string;
    lastJoinedCrewDate: string;
    steamIdProviderAccount: {
        idProviderType: string;
        accountId: string;
        providerDisplayName: {
            displayName: string;
            discriminator: string;
        }
    } | undefined;
}