import * as supplierService from '../services/supplier';
import pathToRegexp from 'path-to-regexp';
import moment from 'moment';

export default {
  namespace: 'supplierDetail',

  state: {
    singleSupplierDetail: {},
    singleSupplierFinance: {},
    singleSupplierSaleHistory: [],
    singleSupplierGoodsHistory: [],
    singleSupplierPaymentHistory: [],
    singleSupplierPurchaseorders: [],
    singleSupplierStatements: [],
    singleSupplierPayments: [],
    saleHistoryFilter: [],
    goodsHistoryFilter: [],
    paymentHistoryFilter: [],
    filterSaleServerData: {},
    filterGoodsServerData: {},
    filterPaymentServerData: {},
    currentId: '',
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(() => {
        const match = pathToRegexp('/relationship/supplier-detail/:id').exec(
          location.hash.slice(1, location.hash.length),
        );
        dispatch({ type: 'setState', payload: { singleSupplierDetail: {} } });
        if (match) {
          dispatch({ type: 'getSingle', payload: { id: match[1] } });
        }
      });
    },
  },

  effects: {
    *getSingle({ payload }, { call, put, all }) {
      const condition = {
        sorts: {
          created_at: 'desc',
        },
        date_type: 'custom',
        sday: moment(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
          'YYYY-MM-DD',
        ),
        eday: moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'),
        id: payload.id,
      };
      const conditionWTwo = {
        sorts: {
          purchase_time: 'desc',
        },
        date_type: 'custom',
        sday: moment(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
          'YYYY-MM-DD',
        ),
        eday: moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'),
        id: payload.id,
      };
      const conditionWThree = {
        sorts: {
          created_at: 'desc',
        },
        id: payload.id,
      };
      const [data1, data2, data3, data4, data5, data6, data7, data8] = yield all([
        call(supplierService.getSingle, payload),
        call(supplierService.getSupplierSaleHistory, condition),
        call(supplierService.getSupplierGoodsHistory, conditionWTwo),
        call(supplierService.getSupplierPaymentHistory, condition),
        call(supplierService.getPurchaseorderNeedPay, conditionWThree),
        call(supplierService.getStatementsNeedPay, conditionWThree),
        call(supplierService.getSupplierFinance, payload),
        call(supplierService.getSupplierPayments, conditionWThree),
      ]);

      yield put({ type: 'setShowData', payload: data1.result.data });
      yield put({
        type: 'setState',
        payload: {
          singleSupplierSaleHistory: data2.result.data,
          singleSupplierGoodsHistory: data3.result.data,
          singleSupplierPaymentHistory: data4.result.data,
          saleHistoryFilter: data2.result.meta.filter.groups,
          goodsHistoryFilter: data3.result.meta.filter.groups,
          paymentHistoryFilter: data4.result.meta.filter.groups,
          singleSupplierPurchaseorders: data5.result.data,
          singleSupplierStatements: data6.result.data,
          currentId: payload,
          singleSupplierFinance: data7.result.data,
          singleSupplierPayments: data8.result.data,
        },
      });
    },

    *getSingleDetail({ payload }, { call, put }) {
      const data = yield call(supplierService.getSingle, payload);
      yield put({ type: 'setShowData', payload: data.result.data });
    },

    *getSaleHistory({ payload }, { call, put }) {
      const data = yield call(supplierService.getSupplierSaleHistory, payload);
      yield put({
        type: 'setState',
        payload: {
          singleSupplierSaleHistory: data.result.data,
        },
      });
    },

    *getGoodsHistory({ payload }, { call, put }) {
      const data = yield call(supplierService.getSupplierGoodsHistory, payload);
      yield put({
        type: 'setState',
        payload: {
          singleSupplierGoodsHistory: data.result.data,
        },
      });
    },

    *getPaymentHistory({ payload }, { call, put }) {
      const data = yield call(supplierService.getSupplierPaymentHistory, payload);
      yield put({
        type: 'setState',
        payload: {
          singleSupplierPaymentHistory: data.result.data,
        },
      });
    },

    *getPurchaseorder({ payload }, { call, put }) {
      const data = yield call(supplierService.getPurchaseorderNeedPay, payload);
      yield put({
        type: 'setState',
        payload: {
          singleSupplierPurchaseorders: data.result.data,
        },
      });
    },

    *getStatement({ payload }, { call, put }) {
      const data = yield call(supplierService.getStatementsNeedPay, payload);
      yield put({
        type: 'setState',
        payload: {
          singleSupplierStatements: data.result.data,
        },
      });
    },

    *getPayments({ payload }, { call, put }) {
      const data = yield call(supplierService.getCustomerPayments, payload);
      yield put({
        type: 'setState',
        payload: {
          singleSupplierPayments: data.result.data,
        },
      });
    },

    *deleteSingle({ payload }, { call, put }) {
      const data = yield call(supplierService.deleteSingle, payload);
    },

    *changeSupplierStatus({ payload }, { call, put, select }) {
      const data = yield call(supplierService.changeSupplierStatus, payload);
      const { currentId } = yield select(({ supplierDetail }) => supplierDetail);
      yield put({ type: 'getSingleDetail', payload: currentId });
    },
  },

  reducers: {
    setState(state, action) {
      return { ...state, ...action.payload };
    },

    setShowData(state, { payload }) {
      state.singleSupplierDetail.name = payload.name;
      state.singleSupplierDetail.phone = payload.phone;
      state.singleSupplierDetail.debt = payload.debt;
      state.singleSupplierDetail.basicDetail = [];

      payload.wechat
        ? state.singleSupplierDetail.basicDetail.push({
            parentName: '微信号',
            name: payload.wechat,
          })
        : '';
      payload.remark1
        ? state.singleSupplierDetail.basicDetail.push({
            parentName: '备注',
            name: payload.remark1,
          })
        : '';

      state.singleSupplierDetail.imageFiles = payload.attachments_url.map((item) => {
        return {
          url: item,
        };
      });

      state.singleSupplierDetail.freeze = payload.freeze;
      state.singleSupplierDetail.addresses = payload.addresses.data;
      return { ...state };
    },

    setFilterSaleServerData(state, { payload }) {
      const current = {};
      const params = { ...payload };
      // 获取key值处理
      Object.keys(params).forEach((key) => {
        if (key === 'dates') {
          current.date_type = 'custom';
          // 这里得到是一个moment 对象
          [current.sday, current.eday] = params[key];
          current.sday = current.sday.format('YYYY-MM-DD');
          current.eday = current.eday.format('YYYY-MM-DD');
          delete current.dates;
        } else {
          current[`${key}_in`] = params[key];
        }
      });
      return { ...state, filterSaleServerData: current };
    },

    setFilterGoodsServerData(state, { payload }) {
      const current = {};
      const params = { ...payload };
      // 获取key值处理
      Object.keys(params).forEach((key) => {
        if (key === 'dates') {
          current.date_type = 'custom';
          // 这里得到是一个moment 对象
          [current.sday, current.eday] = params[key];
          current.sday = current.sday.format('YYYY-MM-DD');
          current.eday = current.eday.format('YYYY-MM-DD');
          delete current.dates;
        } else {
          current[`${key}_in`] = params[key];
        }
      });
      state.filterGoodsServerData = current;
      return { ...state };
    },

    setFilterPurchaseServerData(state, { payload }) {
      const current = {};
      const params = { ...payload };
      // 获取key值处理
      Object.keys(params).forEach((key) => {
        if (key === 'dates') {
          current.date_type = 'custom';
          // 这里得到是一个moment 对象
          [current.sday, current.eday] = params[key];
          current.sday = current.sday.format('YYYY-MM-DD');
          current.eday = current.eday.format('YYYY-MM-DD');
          delete current.dates;
        } else {
          current[`${key}_in`] = params[key];
        }
      });
      state.filterPaymentServerData = current;
      return { ...state };
    },
  },
};