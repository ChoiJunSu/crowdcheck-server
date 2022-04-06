import cron from 'node-cron';
import RequestModel from '@models/RequestModel';
import { Op, Sequelize } from 'sequelize';

export const CronSingleton = (() => {
  return {
    prepare: () => {
      cron.schedule(
        '0 0 0 * * *',
        async () => {
          try {
            const requestUpdateResult = await RequestModel.update(
              {
                status: 'closed',
              },
              {
                where: {
                  deadline: {
                    [Op.or]: [
                      Sequelize.literal(
                        'TIMESTAMPDIFF(DAY, Request.deadline, NOW()) > 0'
                      ),
                    ],
                  },
                },
              }
            );
          } catch (e) {
            console.error(e);
          }
        },
        {
          timezone: process.env.TZ,
        }
      );
    },
  };
})();
