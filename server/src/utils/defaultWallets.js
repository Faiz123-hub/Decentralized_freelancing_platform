export const defaultWalletsByRole = {
  client: "0x603AFE612EB2Ad82eB38Ad2A8E88b4c37a9CFEFB",
  freelancer: "0x5a5E65cF4f00153B761030bB220adD0B6Bb88d8A"
};

export const getDefaultWalletForRole = (role) => defaultWalletsByRole[role] || "";
