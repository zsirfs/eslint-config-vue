import {apiBase,token} from '../common/index'
import request from '../utils/request';

export async function getList (params) {
  return request(`${apiBase}/api/skuattributetypes/1?include=skuattributes`,{
    headers: { "Authorization": token },
  })
}

// export async function deleteSingle (params) {
//   return request({
//     url: `${apiBase.duoke}/api/skuattributes/${params.id}`,
//     method: 'delete',
//     headers: { "Authorization": token },
//     data: params,
//   })
// }

// export async function createSingle (params) {
//   params.name = params.name.trim();
//   return request({
//     url: `${apiBase.duoke}/api/skuattributes/`,
//     method: 'post',
//     headers: { "Authorization": token },
//     data: params,
//   })
// }

// export async function editSingle (params) {
//   params.name = params.name.trim();
//   return request({
//     url: `${apiBase.duoke}/api/skuattributes/${params.id}`,
//     method: 'put',
//     headers: { "Authorization": token },
//     data: params,
//   })
// }

// export async function deleteBatchSome (params) {
//   let e = params.selectItemList.join(',');
//   return request({
//     url: `${apiBase.duoke}/api/skuattributes/${e}/batch`,
//     method: 'delete',
//     headers: { "Authorization": token },
//     data: params,
//   })
// }

// export async function editListSort (params) {
//   return request({
//     url: `${apiBase.duoke}/api/skuattributes/sort/`,
//     method: 'put',
//     headers: { "Authorization": token },
//     data: params,
//   })
// }