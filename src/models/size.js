import * as sizeLibraryService from '../services/sizeLibrary';
import * as sizeGroupService from '../services/sizeGroup';

export default {

  namespace: 'size',

  state: {
    sizeLibrarys: [],
    sizeGroups: [],
  },

  subscriptions: {
    setup({ dispatch, history }) {
    },
  },

  effects: {
    *getList({ payload }, { call, put, all }) {
      const [data1, data2] = yield all([call(sizeLibraryService.getList), call(sizeGroupService.getList)]);
      yield put({ type: 'setState',
        payload: {
          sizeLibrarys: data1.result.data.skuattributes.data,
          sizeGroups: data2.result.data,
        } });
    },

    *getSizeLibrary({ payload }, { call, put }) {
      const data = yield call(sizeLibraryService.getList);
      yield put({ type: 'setState',
        payload: {
          sizeLibrarys: data.result.data.skuattributes.data,
        } });
    },

    *getSizeGroup({ payload }, { call, put }) {
      const data = yield call(sizeGroupService.getList);
      yield put({ type: 'setState',
        payload: {
          sizeGroups: data.result.data,
        } });
    },

    *createSizeLibrarySingle({ payload }, { call, put }) {
      const data = yield call(sizeLibraryService.createSingle, payload);
      return data;
    },

    *editSizeLibrarySingle({ payload }, { call, put }) {
      const data = yield call(sizeLibraryService.editSingle, payload);
      return data;
    },

    *deleteSizeLibrarySingle({ payload }, { call, put }) {
      const data = yield call(sizeLibraryService.deleteSingle, payload);
      return data;
    },

    *editSort({ payload }, { call, put }) {
      yield call(sizeLibraryService.editSort, payload);
    },

    *createSizeGroupSingle({ payload }, { call, put }) {
      const data = yield call(sizeGroupService.createSingle, payload);
      return data;
    },

    *editSizeGroupSingle({ payload }, { call, put }) {
      const data = yield call(sizeGroupService.editSingle, payload);
      return data;
    },

    *deleteSizeGroupSingle({ payload }, { call, put }) {
      yield call(sizeGroupService.deleteSingle, payload);
    },


  },

  reducers: {

    setState(state, action) {
      return { ...state, ...action.payload };
    },

    setSortMove(state, { payload: { currentId, moveWay } }) {
      moveWay == 'up' ? null : state.sizeLibrarys.reverse();
      state.sizeLibrarys.forEach((n, i) => {
        if (n.id == currentId) {
          i == 0 ? '' : (
            state.sizeLibrarys.splice(i, 1),
            state.sizeLibrarys.splice(i - 1, 0, n)
          );
        }
      });
      moveWay == 'up' ? null : state.sizeLibrarys.reverse();
      state.sizeLibrarys.forEach((item, index) => {
        item.sort = index;
      });
      return { ...state };
    },

  },

};