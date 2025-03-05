import { CrewData } from "./crew";

export interface GetDivisionsV1Response {
    sequenceNumber: number;
    response: {
        requestId: number;
        type: string;
        payload: {
            success: boolean;
            divisions: Division[];
        }
    }
}

export interface Division {
    divisionId: string;
    divisionName: string;
    divisionType: string;
}

export interface GetDivisionByCrewIdV1Request {
    crewId: string;
}

export interface GetDivisionByCrewIdV1Response {
    sequenceNumber: number;
    response: {
        requestId: number;
        type: string;
        payload: {
            success: boolean;
            divisionData: Division;
        }
    }
}

export interface GetDivisionByPlayerIdV1Request {
    playerId: string;
}

export interface GetDivisionByPlayerIdV1Response {
    sequenceNumber: number;
    response: {
        requestId: number;
        type: string;
        payload: {
            success: boolean;
            divisionData: Division;
        }
    }
}

export interface GetDivisionRosterV1Request {
    divisionId: string;
}

export interface GetDivisionRosterV1Response {
    sequenceNumber: number;
    response: {
        requestId: number;
        type: string;
        payload: {
            success: boolean;
            crews: CrewData[];
        }
    }
}

export interface GetDivisionV1Request {
    divisionId: string;
}

export interface GetDivisionV1Response {
    sequenceNumber: number;
    response: {
        requestId: number;
        type: string;
        payload: {
            success: boolean;
            divisionData: Division;
        }
    }
}