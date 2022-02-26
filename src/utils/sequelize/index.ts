import { Error, Sequelize } from 'sequelize';
import { SecretsManagerSingleton } from '@utils/secretesManager';
import { initUserModel } from '@models/UserModel';
import { initCorporateModel } from '@models/CorporateModel';
import { initCareerModel } from '@models/CareerModel';
import { initCareerVerifyModel } from '@models/CareerVerifyModel';
import { initPhoneVerifyModel } from '@models/PhoneVerifyModel';
import { initCandidateAgreeModel } from '@models/CandidateAgreeModel';
import { initCandidateModel } from '@models/CandidateModel';
import { initCorporateVerifyModel } from '@models/CorporateVerifyModel';
import { initReceiverModel } from '@models/ReceiverModel';
import { initRequestModel } from '@models/RequestModel';
import { initCandidateResumeModel } from '@models/CandidateResumeModel';
import { initExpertModel } from '@models/ExpertModel';
import { initExpertVerifyModel } from '@models/ExpertVerifyModel';

export const SequelizeSingleton = (() => {
  let sequelize: Sequelize;

  return {
    prepare: () => {
      // construct
      sequelize = new Sequelize(
        SecretsManagerSingleton.getSecrete('dbname'),
        SecretsManagerSingleton.getSecrete('username'),
        SecretsManagerSingleton.getSecrete('password'),
        {
          host: SecretsManagerSingleton.getSecrete('host'),
          dialect: 'mariadb',
        }
      );

      // initialize
      initCorporateModel(sequelize);
      initUserModel(sequelize);
      initRequestModel(sequelize);
      initCandidateModel(sequelize);
      initCandidateResumeModel(sequelize);
      initCandidateAgreeModel(sequelize);
      initCareerModel(sequelize);
      initCareerVerifyModel(sequelize);
      initCorporateVerifyModel(sequelize);
      initPhoneVerifyModel(sequelize);
      initReceiverModel(sequelize);
      initExpertModel(sequelize);
      initExpertVerifyModel(sequelize);

      // authenticate
      sequelize
        .authenticate()
        .then(() => {
          console.log('database connected');
        })
        .catch((e: Error) => {
          console.error(e);
        });

      // migrate
      sequelize
        .sync({
          force: false,
        })
        .then(() => {})
        .catch((e: Error) => {
          console.error(e);
        });
    },
  };
})();
