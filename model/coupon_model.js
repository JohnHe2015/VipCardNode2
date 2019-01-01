module.exports = (sequelize, DataTypes)=>{
    return sequelize.define("coupon_table", {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true,
          },  
        username : DataTypes.STRING(32),
        type : DataTypes.INTEGER(1),
        rate : DataTypes.DECIMAL(15, 2),
        startTime : DataTypes.STRING(13),
        endTime : DataTypes.STRING(13),
        isUse : DataTypes.BOOLEAN,
        useTime : DataTypes.STRING(13),
        createTime : DataTypes.STRING(13),

    },
    {
        freezeTableName : true,
        timestamps : true,
        updatedAt : false,
        createdAt: 'createTime'
    }
    )
}