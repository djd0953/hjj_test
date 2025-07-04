import type { Sequelize } from 'sequelize';

declare global {
    var sequelize: Sequelize;
}

export {};