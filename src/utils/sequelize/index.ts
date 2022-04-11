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
    prepare: async () => {
      // construct
      sequelize = new Sequelize(
        SecretsManagerSingleton.getSecrete('dbname'),
        SecretsManagerSingleton.getSecrete('username'),
        SecretsManagerSingleton.getSecrete('password'),
        {
          host: SecretsManagerSingleton.getSecrete('host'),
          dialect: 'mariadb',
          timezone: process.env.TZ,
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

      try {
        // authenticate
        await sequelize.authenticate();
        // migrate
        await sequelize.sync({ force: false });
      } catch (e) {
        console.error(e);
      }
    },
    getInstance: () => sequelize,
  };
})();
