import { IBasePerTenantAndOrganizationEntityModel } from './base-entity.model';

export interface IFeature extends IBasePerTenantAndOrganizationEntityModel {
	code: string;
	description?: string;
	featureOrganizations?: IFeatureOrganization[];
	image?: string;
	link: string;
	name: string;
}

export interface IFeatureCreateInput extends IFeature {
	isEnabled: boolean;
}

export interface IFeatureOrganization
	extends IBasePerTenantAndOrganizationEntityModel {
	feature: IFeature;
	featureId: string;
	isEnabled: boolean;
}
