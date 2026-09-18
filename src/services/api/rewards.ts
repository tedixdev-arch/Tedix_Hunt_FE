import { ApiError, apiClient, type ApiClient } from './client.ts';

export type RewardProvider = 'organizer' | 'tedix_inventory';
export type RewardKind = 'physical' | 'virtual';
export type VirtualRewardCategory = 'achievement' | 'digital_certificate' | 'profile_badge' | 'hunt_passport_collectible' | 'partner_digital_benefit';
export interface RewardOption<T extends string = string> { key: T; label: string }
export interface SpecialAwardDefinition { key: string; scope: 'team' | 'personal'; name: string; rule: string; description: string; eligibility: string }
export interface RewardOptions {
  providers: RewardOption<RewardProvider>[];
  kinds: RewardOption<RewardKind>[];
  virtualCategories: RewardOption<VirtualRewardCategory>[];
  specialAwardDefinitions: SpecialAwardDefinition[];
}
export interface RewardDetails { provider: RewardProvider; kind: RewardKind; category: VirtualRewardCategory | null; name: string | null; description: string | null; quantity: number }
export interface LeaderboardReward extends RewardDetails { id: string; huntId: string; place: number }
export interface SpecialAward extends RewardDetails { id: string; huntId: string; definitionKey: string }
export interface HuntRewards { leaderboard: LeaderboardReward[]; specialAwards: SpecialAward[] }
export type LeaderboardRewardInput = Omit<LeaderboardReward, 'id' | 'huntId'>;
export type SpecialAwardInput = Omit<SpecialAward, 'id' | 'huntId'>;

export class RewardOptionsApi {
  private readonly client: ApiClient;
  constructor(client: ApiClient = apiClient) { this.client = client; }
  getOptions(): Promise<RewardOptions> { return this.client.get('/api/reward-options'); }
}
export class HuntRewardsApi {
  private readonly client: ApiClient;
  constructor(client: ApiClient = apiClient) { this.client = client; }
  private hunt(id: string) { return `/api/hunts/${encodeURIComponent(id)}/rewards`; }
  list(huntId: string): Promise<HuntRewards> { return this.client.get(this.hunt(huntId)); }
  createLeaderboard(huntId: string, input: LeaderboardRewardInput): Promise<LeaderboardReward> { return this.client.post(`${this.hunt(huntId)}/leaderboard`, input); }
  updateLeaderboard(huntId: string, rewardId: string, input: LeaderboardRewardInput): Promise<LeaderboardReward> { return this.client.patch(`${this.hunt(huntId)}/leaderboard/${encodeURIComponent(rewardId)}`, input); }
  deleteLeaderboard(huntId: string, rewardId: string): Promise<void> { return this.client.delete(`${this.hunt(huntId)}/leaderboard/${encodeURIComponent(rewardId)}`); }
  createSpecial(huntId: string, input: SpecialAwardInput): Promise<SpecialAward> { return this.client.post(`${this.hunt(huntId)}/special`, input); }
  updateSpecial(huntId: string, rewardId: string, input: SpecialAwardInput): Promise<SpecialAward> { return this.client.patch(`${this.hunt(huntId)}/special/${encodeURIComponent(rewardId)}`, input); }
  deleteSpecial(huntId: string, rewardId: string): Promise<void> { return this.client.delete(`${this.hunt(huntId)}/special/${encodeURIComponent(rewardId)}`); }
}

function backendCode(error: ApiError): string | undefined {
  if (!error.details || typeof error.details !== 'object') return undefined;
  const details = error.details as { error?: unknown; code?: unknown };
  return typeof details.error === 'string' ? details.error : typeof details.code === 'string' ? details.code : undefined;
}
export function rewardSaveError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400) return 'Check the reward details and try again.';
    if (error.status === 403) return "You don't have permission to change rewards for this Hunt.";
    if (error.status === 404) return 'This reward could not be found.';
    if (error.status === 409 && backendCode(error) === 'reward_conflict') return 'That reward allocation is already configured.';
    if (error.status === 409 && backendCode(error) === 'invalid_hunt_state') return 'Rewards are locked because this Hunt is no longer a draft.';
  }
  return "We couldn't save this reward. Please try again.";
}

export const rewardOptionsApi = new RewardOptionsApi();
export const huntRewardsApi = new HuntRewardsApi();
