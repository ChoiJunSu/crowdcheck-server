import { Error, Sequelize } from 'sequelize';
import { SecretsManagerSingleton } from '@utils/secretesManager';
import { initUserModel } from '@models/UserModel';
import { initCorporateModel } from '@models/CorporateModel';
import { initCareerModel } from '@models/CareerModel';
import { initPhoneVerifyModel } from '@models/PhoneVerifyModel';
import { initCandidateAgreeModel } from '@models/CandidateAgreeModel';
import { initCandidateModel } from '@models/CandidateModel';
import { initReceiverModel } from '@models/ReceiverModel';
import { initRequestModel } from '@models/RequestModel';
import { initExpertModel } from '@models/ExpertModel';
import { initReceiverRewardModel } from '@models/ReceiverRewardModel';

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
      initCandidateAgreeModel(sequelize);
      initCareerModel(sequelize);
      initPhoneVerifyModel(sequelize);
      initReceiverModel(sequelize);
      initReceiverRewardModel(sequelize);
      initExpertModel(sequelize);

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
