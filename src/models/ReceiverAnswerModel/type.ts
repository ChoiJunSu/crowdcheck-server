import { Optional } from 'sequelize';

export interface IReceiverAnswerAttributes {
  id?: number;
  receiverId: number;
  workExperience: number;
  workExperienceDescription: string;
  roleFit: number;
  roleFitDescription: string;
  collaborationAbility: number;
  collaborationAbilityDescription: string;
  hardWorking: number;
  hardWorkingDescription: string;
  recommendedSalary: string;
}

export interface IReceiverAnswerCreationAttributes
  extends Optional<IReceiverAnswerAttributes, 'id'> {}
