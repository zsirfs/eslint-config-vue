import * as saleOrderService from '../services/saleOrder'
import * as printService from '../services/print'
import pathToRegexp from 'path-to-regexp'
export default  {

  namespace: 'saleOrderDetail',

  state: {
    singleOrderDetail:{}
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({pathname}) => {
        const match = pathToRegexp('/bill/sale-detail/:id').exec(pathname)
        if(match) {
          dispatch({type:'setState',payload:{
            singleOrderDetail:{}
          }})
          dispatch({type:'getSingle',payload:{
            id:match[1]
          }})
        }
      })
    },
  },

  effects: {
    *getSingle({payload},{call,put}) {
      const data = yield call(saleOrderService.getSingle,payload)
      yield put({type:'setShowData',payload:data.result.data})
    },

    *printSaleOrder({payload},{call,put}) {
      const data = yield call(printService.printSaleOrder,payload)
    }
  },

  reducers: {

    setState (state, action) {
      return { ...state, ...action.payload }
    },

    setShowData (state,{payload}) {
      console.log(payload)
      state.singleOrderDetail.id = payload.id;
      state.singleOrderDetail.number = payload.number;
      state.singleOrderDetail.createShop = payload.shop.data.name;
      state.singleOrderDetail.seller = payload.seller.data.name;
      state.singleOrderDetail.customer = payload.customer.data.name;
      if(payload.delivery_way == '1') {
        state.singleOrderDetail.deliverWay = '立即自提';
        state.singleOrderDetail.deliverStatus = '';
      }else if(payload.delivery_way == '2') {
        state.singleOrderDetail.deliverWay = '稍后自提';
        if(payload.delivery_status == 1) {
          state.singleOrderDetail.deliverStatus = '(未自提)';
        }else if(payload.delivery_status == 3) {
          state.singleOrderDetail.deliverStatus = '(已自提)';
        }
      }else if(payload.delivery_way == '3') {
        state.singleOrderDetail.deliverWay = '物流运输';
        if(payload.delivery_status == 1) {
          state.singleOrderDetail.deliverStatus = '(未发货)';
        }else if(payload.delivery_status == 2) {
          state.singleOrderDetail.deliverStatus = '(部分发货)'
        }else if(payload.delivery_status == 3) {
          state.singleOrderDetail.deliverStatus = '(已发货)';
        }
      }else if(payload.delivery_way == '4') {
        state.singleOrderDetail.deliverWay = '稍后拼包'; 
        if(payload.delivery_status == 1) {
          state.singleOrderDetail.deliverStatus = '(未拼包)';
        }else if(payload.delivery_status == 3) {
          state.singleOrderDetail.deliverStatus = '(已拼包)';
        }
      }
      state.singleOrderDetail.delivery_status = payload.delivery_status
      state.singleOrderDetail.label = payload.doctags.data.length ? payload.doctags.data.map( n => n.name).join('、') : '「无」'
      state.singleOrderDetail.remark = payload.remark;
      state.singleOrderDetail.count = payload.salesorderskus.data.length;
      state.singleOrderDetail.quantity = payload.quantity;
      state.singleOrderDetail.due_fee = payload.due_fee;
      state.singleOrderDetail.address_id = payload.address_id;
      if(payload.address_id) {
        state.singleOrderDetail.name = payload.address.data.name;
        state.singleOrderDetail.phone = payload.address.data.phone;
        state.singleOrderDetail.address = `${payload.address.data.province_name}${payload.address.data.city_name}${payload.address.data.address}`
      }
      state.singleOrderDetail.adjustWays = [];
      payload.orderfees.data.forEach( n => {
        if(n.docfeetype.data.id != 1) {
          if(n.docfeetype.data.value == 1) {
            state.singleOrderDetail.adjustWays.push({
              name: n.docfeetype.data.name,
              value: n.value
            })
          }else {
            if(n.docfeetype.data.percent_method == 1) {
              state.singleOrderDetail.adjustWays.push({
                name: n.docfeetype.data.name,
                value: `${((1-Number(n.percent)*(-1))*10).toFixed(1)}折`
              })
            }else {
              state.singleOrderDetail.adjustWays.push({
                name: n.docfeetype.data.name,
                value: `${(Number(n.percent)*100).toFixed(2)}`
              })
            }
          }
        }
      })
      state.singleOrderDetail.paymentWays = [];
      state.singleOrderDetail.settle_way = payload.settle_way;
      state.singleOrderDetail.pay_status = payload.pay_status;
      if(payload.settle_way == 1) {
        payload.payments.data.forEach( n => {
          state.singleOrderDetail.paymentWays.push({
            name: n.paymentmethod.data.name,
            value: n.value
          })
        })
      }else {
        if(payload.pay_status == 1) {
          state.singleOrderDetail.paymentWays.push({
            name: '赊账',
            value: '(未结算)'
          })
        }else if(payload.pay_status == 3) {
          staet.singleOrderDetail.paymentWays.push({
            name: '赊账',
            value: '(已结算)'
          })
        }
      }
      /*
        item_ref
        color
        size
        price
        quantity
        total
        label
        remark
      */
      let hasItems = [];
      state.singleOrderDetail.itemList = [];
      state.singleOrderDetail.itemExtraList = {};
      state.singleOrderDetail.itemRecord = {};
      payload.salesorderskus.data.forEach( n => {
        if(hasItems.some( _ => _ == n.item_id)) {
          if(n.sku.data.skuattributes.data.length == 1) {
            if(!state.singleOrderDetail.itemExtraList[`${n.item_id}`]) {
              state.singleOrderDetail.itemExtraList[`${n.item_id}`] = [];
              state.singleOrderDetail.itemExtraList[`${n.item_id}`].push(state.singleOrderDetail.itemList.find( _ => _.item_id == n.item_id));
            }
            state.singleOrderDetail.itemExtraList[`${n.item_id}`].push({
              id:n.id,
              item_id:n.item_id,
              item_ref: n.item.data.item_ref,
              color: n.sku.data.skuattributes.data[0].name,
              size:'-',
              price: (Number(n.price)/Number(n.unit_number)).toFixed(2),
              quantity: `${n.quantity} x ${n.unit_number}`,
              number: n.quantity,
              total: (Number(n.deal_price)*Number(n.quantity)).toFixed(2),
              label: n.docdetailtag_id ? n.docdetailtag.data.name : '-',
              remark: n.remark || '-',
            })
            let current = JSON.parse(JSON.stringify(state.singleOrderDetail.itemList[state.singleOrderDetail.itemList.findIndex( _ => _.item_id == n.item_id)]))
            current.color = '多颜色';
            current.label = '多标签';
            current.remark = '多备注';
            current.quantity = `${Number(n.quantity) + Number(current.number)} x ${n.unit_number}`;
            current.total = (Number(current.total) + Number(n.deal_price)*Number(n.quantity)).toFixed(2);
            state.singleOrderDetail.itemList[state.singleOrderDetail.itemList.findIndex(_ => _.item_id == n.item_id)] = current;
          }else if(n.sku.data.skuattributes.data.length == 2) {
            if(!state.singleOrderDetail.itemExtraList[`${n.item_id}`]) {
              state.singleOrderDetail.itemExtraList[`${n.item_id}`] = [];
              state.singleOrderDetail.itemExtraList[`${n.item_id}`][0] = [];
              state.singleOrderDetail.itemExtraList[`${n.item_id}`][0].push({
                name: state.singleOrderDetail.itemList.find( _ => _.item_id == n.item_id).size
              })
              state.singleOrderDetail.itemExtraList[`${n.item_id}`].push({
                colorId:state.singleOrderDetail.itemList.find( _ => _.item_id == n.item_id).colorId,
                name: state.singleOrderDetail.itemList.find( _ => _.item_id == n.item_id).color,
                children: [{
                  sizeId:state.singleOrderDetail.itemList.find( _ => _.item_id == n.item_id).sizeId,
                  quantity:state.singleOrderDetail.itemList.find( _ => _.item_id == n.item_id).quantity,
                  name:state.singleOrderDetail.itemList.find( _ => _.item_id == n.item_id).size,
                  label:state.singleOrderDetail.itemList.find( _ => _.item_id == n.item_id).label,
                  remark:state.singleOrderDetail.itemList.find( _ => _.item_id == n.item_id).remark
                }]
              })
            }
            if(!state.singleOrderDetail.itemExtraList[`${n.item_id}`][0].some( _ => _.name == n.sku.data.skuattributes.data[1].name)) {
              state.singleOrderDetail.itemExtraList[`${n.item_id}`][0].push({
                name: n.sku.data.skuattributes.data[1].name
              })
            }
            if(state.singleOrderDetail.itemExtraList[`${n.item_id}`].some( _ => _.colorId == n.sku.data.skuattributes.data[0].id)) {
              state.singleOrderDetail.itemExtraList[`${n.item_id}`][state.singleOrderDetail.itemExtraList[`${n.item_id}`].findIndex( _ => _.colorId == n.sku.data.skuattributes.data[0].id)].children.push({
                sizeId:n.sku.data.skuattributes.data[1].id,
                quantity: `${n.quantity} x ${n.unit_number}`,
                name: n.sku.data.skuattributes.data[1].name,
                label: n.docdetailtag_id ? n.docdetailtag.data.name : '-',
                remark: n.remark || '-',
              })
            }else {
              state.singleOrderDetail.itemExtraList[`${n.item_id}`].push({
                colorId:n.sku.data.skuattributes.data[0].id,
                name:n.sku.data.skuattributes.data[0].name,
                children:[{
                  sizeId:n.sku.data.skuattributes.data[1].id,
                  quantity:`${n.quantity} x ${n.unit_number}`,
                  name: n.sku.data.skuattributes.data[1].name,
                  label: n.docdetailtag_id ? n.docdetailtag.data.name : '-',
                  remark: n.remark || '-',
                }]
              })
            }
            let current = JSON.parse(JSON.stringify(state.singleOrderDetail.itemList[state.singleOrderDetail.itemList.findIndex( _ => _.item_id == n.item_id)]))
            current.color = '多颜色';
            current.size = '多尺码';
            current.label = '多标签';
            current.remark = '多备注';
            current.quantity = `${Number(n.quantity) + Number(current.number)} x ${n.unit_number}`;
            current.total = (Number(current.total) + Number(n.deal_price)*Number(n.quantity)).toFixed(2);
            state.singleOrderDetail.itemList[state.singleOrderDetail.itemList.findIndex(_ => _.item_id == n.item_id)] = current;
          }
        }else {
          hasItems.push(n.item_id)
          if(n.sku.data.skuattributes.data.length == 0) {
            state.singleOrderDetail.itemList.push({
              id:n.id,
              item_id:n.item_id,
              item_ref: n.item.data.item_ref,
              color: '-',
              size:'-',
              price: (Number(n.price)/Number(n.unit_number)).toFixed(2),
              quantity: `${n.quantity} x ${n.unit_number}`,
              number: n.quantity,
              total: (Number(n.deal_price)*Number(n.quantity)).toFixed(2),
              label: n.docdetailtag_id ? n.docdetailtag.data.name : '-',
              remark: n.remark || '-',
            })
          }else if(n.sku.data.skuattributes.data.length == 1) {
            state.singleOrderDetail.itemList.push({
              id:n.id,
              item_id:n.item_id,
              item_ref: n.item.data.item_ref,
              color: n.sku.data.skuattributes.data[0].name,
              size:'-',
              price: (Number(n.price)/Number(n.unit_number)).toFixed(2),
              quantity: `${n.quantity} x ${n.unit_number}`,
              number: n.quantity,
              total: (Number(n.deal_price)*Number(n.quantity)).toFixed(2),
              label: n.docdetailtag_id ? n.docdetailtag.data.name : '-',
              remark: n.remark || '-',
            })
          }else if(n.sku.data.skuattributes.data.length == 2) {
            state.singleOrderDetail.itemList.push({
              id:n.id,
              item_id:n.item_id,
              item_ref: n.item.data.item_ref,
              color: n.sku.data.skuattributes.data[0].name,
              colorId:n.sku.data.skuattributes.data[0].id,
              size:n.sku.data.skuattributes.data[1].name,
              sizeId:n.sku.data.skuattributes.data[1].id,
              price: (Number(n.price)/Number(n.unit_number)).toFixed(2),
              quantity: `${n.quantity} x ${n.unit_number}`,
              number: n.quantity,
              total: (Number(n.deal_price)*Number(n.quantity)).toFixed(2),
              label: n.docdetailtag_id ? n.docdetailtag.data.name : '-',
              remark: n.remark || '-',
            })
          }
        }
      })

      state.singleOrderDetail.operationSource = payload.docactionables.data;
      return {...state}
    }
  },
};


























