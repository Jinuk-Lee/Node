const Sequelize = require('sequelize');

module.exports = class Auction extends Sequelize.Model {
    static init(sequelize) {
        return super.init ({
            bid: {  // 입찰가
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            msg: {  // 입찰 시 메시지
                type: Sequelize.STRING(100),
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: true,
            paranoid: true,
            modelName: 'Auction',
            tableName: 'auctions',
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.Auction.belongsTo(db.User);  // 사용자가 입찰을 여러 번 할 수 있으므로 일대다 관계
        db.Auction.belongsTo(db.Good);  // 한 상품에 여러 명이 입찰하므로 일대다 관계
    }
};
