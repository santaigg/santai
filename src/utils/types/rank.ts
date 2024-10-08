export default function getSoloRankFromNumber(rankNumber: number): string {
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

    return soloRanks[rankNumber] || "Unknown Rank";
}