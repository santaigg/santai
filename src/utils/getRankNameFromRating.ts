export default function getRankNameFromRating(rankNumber: number, rankType: "SOLO" | "TEAM"): string {
    const soloRanks: { [key: number]: string } = {
        0: "Unranked",
        1: "Bronze 1",
        2: "Bronze 2",
        3: "Bronze 3",
        4: "Bronze 4",
        5: "Silver 1",
        6: "Silver 2",
        7: "Silver 3",
        8: "Silver 4",
        9: "Gold 1",
        10: "Gold 2",
        11: "Gold 3",
        12: "Gold 4",
        13: "Platinum 1",
        14: "Platinum 2",
        15: "Platinum 3",
        16: "Platinum 4",
        17: "Emerald 1",
        18: "Emerald 2",
        19: "Emerald 3",
        20: "Emerald 4",
        21: "Ruby 1",
        22: "Ruby 2",
        23: "Ruby 3",
        24: "Ruby 4",
        25: "Diamond 1",
        26: "Diamond 2",
        27: "Diamond 3",
        28: "Diamond 4",
        29: "Champion"
    };

    const teamRanks: { [key: number]: string } = {
        0: "Unranked",
        1: "Undiscovered 1",
        2: "Undiscovered 2",
        3: "Undiscovered 3",
        4: "Undiscovered 4",
        5: "Prospect 1",
        6: "Prospect 2",
        7: "Prospect 3",
        8: "Prospect 4",
        9: "Talent 1",
        10: "Talent 2",
        11: "Talent 3",
        12: "Talent 4",
        13: "Professional 1",
        14: "Professional 2",
        15: "Professional 3",
        16: "Professional 4",
        17: "Elite 1",
        18: "Elite 2",
        19: "Elite 3",
        20: "Elite 4",
        21: "International 1",
        22: "International 2",
        23: "International 3",
        24: "International 4",
        25: "Superstar 1",
        26: "Superstar 2",
        27: "Superstar 3",
        28: "Superstar 4",
        29: "World Class 1",
        30: "World Class 2",
        31: "World Class 3",
        32: "World Class 4",
        33: "Champion"
    };

    const ranks = rankType === 'SOLO' ? soloRanks : teamRanks;
    return ranks[rankNumber] || "Unknown Rank";
}