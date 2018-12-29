const common = require('./../common/common');
module.exports = (sequelize, DataTypes)=>{
    return sequelize.define("user_table", {
      id: {
          type: DataTypes.STRING(32),
          primaryKey: true,
          get : ()=>{
              return common.uuid();
          }
        },  
      username : DataTypes.STRING(32),
      password : 
        {
          type : DataTypes.STRING(32),
        
        },
      mobile : DataTypes.STRING(11),
      sex : DataTypes.STRING(10),
      birthday : DataTypes.STRING(10),
      level : 
        {
          type : DataTypes.INTEGER(1),
          
        },
      createTime : 
        {
          type : DataTypes.STRING(13),
          get : ()=>{
              return common.getTime();
          }
        }
    },
    {
      freezeTableName : true,
      timestamps : true,
      updatedAt : false,
      createdAt: 'createTime'
    }
    )
}
