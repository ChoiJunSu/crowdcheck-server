import { Error, Sequelize } from 'sequelize';
import { SecretsManagerSingleton } from '@utils/secretesManager';
import { initUserModel } from '@models/UserModel';
import { initCorporateModel } from '@models/CorporateModel';
import { initCareerModel } from '@models/CareerModel';
import { initPhoneVerifyModel } from '@models/PhoneVerifyModel';
import { initAgreeModel } from '@models/AgreeModel';
import { initReceiverModel } from '@models/ReceiverModel';
import { initRequestModel } from '@models/RequestModel';
import { initReferenceModel } from '@models/ReferenceModel';
import { initReferenceDetailModel } from '@models/ReferenceDetailModel';

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
      initCareerModel(sequelize);
      initAgreeModel(sequelize);
      initPhoneVerifyModel(sequelize);
      initReceiverModel(sequelize);
      initReferenceModel(sequelize);
      initReferenceDetailModel(sequelize);

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
