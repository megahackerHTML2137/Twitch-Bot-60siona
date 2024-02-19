type BotIdentityType = {
  username: string;
  auth: string;
};

export interface BotDefaultProperties {
  channels: string[];
  identity: BotIdentityType;
}
