const menuData = [{
  name: '商品',
  icon: 'form',
  path: 'goods-list'
},{
  name: '关系',
  icon: 'check-circle-o',
  path: 'relationship',
  children: [{
    name: '客户',
    path: 'customer-list',
  },{
    name: '供应商',
    path: 'supplier-list'
  }]
},{
  name:'管理中心',
  icon:'dashboard',
  path:'manage-center',
  children: [{
    name:'商品',
    path:'goods',
    children: [{
      name:'商品属性',
      path:'goods-attribute'
    },{
      name:'商品分组',
      path:'goods-group'
    },{
      name:'颜色',
      path:'color'
    },{
      name:'尺码',
      path:'size',
    },{
      name:'单位',
      path:'unit'
    },{
      name:'价格',
      path:'price'
    },{
      name:'条码',
      path:'barcode',
    },{
      name:'图片',
      path:'picture'
    }]
  },{
    name:'客户',
    path:'customer',
    children: [{
      name:'客户管理',
      path:'customer-manage',
    },{
      name:'客户分组',
      path:'customer-group'
    },{
      name:'客户等级',
      path:'customer-member'
    }]
  },{
    name:'店仓',
    path:'shop-warehouse',
    children:[{
      name:'店铺',
      path:'shop'
    },{
      name:'仓库',
      path:'warehouse'
    }]
  },{
    name:'单据',
    path:'bill',
    children:[{
      name:'商品标签',
      path:'goods-label'
    },{
      name:'支付方式',
      path:'payment'
    },{
      name:'销售单',
      path:'sale-order'
    },{
      name:'进货单',
      path:'purchase-order'
    },{
      name:'发货单',
      path:'deliver-order'
    },{
      name:'盘点单',
      path:'inventory-order'
    }]
  }]
},{
  name: '开发',
  icon: 'smile-o',
  path: 'test'
}];

function formatter(data, parentPath = '') {
  return data.map((item) => {
    const result = {
      ...item,
      path: `${parentPath}${item.path}`,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
