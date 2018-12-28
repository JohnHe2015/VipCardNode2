const common = require('./../common/common');
module.exports = (sequelize, DataTypes)=>{
    return sequelize.define("usertemp_table", {
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
        //   set : (pwd)=>{
        //     //   let password = this.getDataValue('password');
        //     //   this.setDataValue('password',common.md5(pwd));
        //   }
        },
      mobile : DataTypes.STRING(11),
      sex : DataTypes.STRING(10),
      birthday : DataTypes.STRING(10),
      level : 
        {
          type : DataTypes.INTEGER(1),
        //   set : (amount)=>{
        //       let value = amount > 5000 ? 2 : 1;
        //     //   this.setDataValue('level',value);
        //   }
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
