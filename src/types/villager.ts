import { VILLAGER_PERSONALITIES, VILLAGER_SPECIES } from '@/constants/post';

export type VillagerSpeciesItem = (typeof VILLAGER_SPECIES)[number];
export type VillagerSpecies = (typeof VILLAGER_SPECIES)[number]['EN'];

export type VillagerPersonalityItem = (typeof VILLAGER_PERSONALITIES)[number];
export type VillagerPersonality = (typeof VILLAGER_PERSONALITIES)[number]['EN'];

export interface Villager {
	id: string;
	name: string;
	imageUrl: string;
	species: VillagerSpecies;
	personality: VillagerPersonality;
}
