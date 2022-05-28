const Sequelize = require('sequelize');

module.exports = class Good extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            name: {  // 상품명
                type: Sequelize.STRING(40),
                allowNull: false,
            },
            img: {  // 상품 사진
                type: Sequelize.STRING(200),
                allowNull: true,
            },
            price: {  // 시작 가격으로 구성됨
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        }, {
            sequelize,
            timestamps: true,
            paranoid: true,
            modelName: 'Good',
            tableName: 'goods',
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.Good.belongsTo(db.User, {as: 'Owner'});  // 사용자가 여러 상품을 등록할 수 있으므로 일대다 관계
        db.Good.belongsTo(db.User, {as: 'Sold'});  // 사용자가 여러 상품을 낙찰받을 수 있으므로 일대다 관계
        db.Good.hasMany(db.Auction);  // 한 상품에 여러 명이 입찰하므로 일대다 관계
    }
}; 
