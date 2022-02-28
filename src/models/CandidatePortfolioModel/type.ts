import { Optional } from 'sequelize';

export interface ICandidatePortfolioAttributes {
  id?: number;
  requestId: number;
  portfolioBucket: string;
  portfolioKey: string;
}

export interface ICandidatePortfolioCreationAttributes
  extends Optional<ICandidatePortfolioAttributes, 'id'> {}
