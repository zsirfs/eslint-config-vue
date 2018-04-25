import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import currency from 'currency.js';
import { Row, Col, Card, Button, Icon, Table } from 'antd';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import styles from './SupplierDetail.less';

const NCNF = (value) => currency(value, { symbol: '', precision: 2 });
const NCNI = (value) => currency(value, { symbol: '', precision: 0 });
@connect((state) => ({
  supplierSkusPurchaseDetail: state.supplierSkusPurchaseDetail,
}))
export default class SkusPurchaseDetail extends PureComponent {
  handleSort = (pagination, filters, sorter) => {
    let sorts = {};
    if (sorter.field) {
      sorts[sorter.field] = sorter.order.slice(0, sorter.order.length - 3);
    } else {
      sorts = {
        created_at: 'desc',
      };
    }
    this.props.dispatch({
      type: 'supplierSkusPurchaseDetail/getList',
      payload: {
        id: this.props.supplierSkusPurchaseDetail.customerId,
        subId: this.props.supplierSkusPurchaseDetail.itemId,
        sorts,
      },
    });
  };

  render() {
    const { skusPurchaseList } = this.props.supplierSkusPurchaseDetail;
    const { params } = this.props.match;

    const breadcrumbList = [
      {
        title: '关系',
      },
      {
        title: '供应商',
        href: '/relationship/supplier-list',
      },
      {
        title: params.name,
        href: `/relationship/supplier-detail/${params.id}`,
      },
      {
        title: '商品供应详情',
        href: `/relationship/supplier-detail/goods-purchase-detail/${params.id}/${params.subId}/${
          params.name
        }`,
      },
      {
        title: 'SKU供应详情',
      },
    ];

    const columns = [
      {
        title: '单号',
        dataIndex: 'number',
        render: (text, record) => `#${record.number}`,
      },
      {
        title: '供应量',
        dataIndex: 'sku_quantity',
        className: styles.numberRightMove,
        sorter: true,
        render: (text, record) => NCNI(record.sku_quantity).format(true),
      },
      {
        title: '供应额',
        dataIndex: 'sku_value',
        className: styles.numberRightMove,
        sorter: true,
        render: (text, record) => NCNI(record.sku_value).format(true),
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        sorter: true,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) => <Link to={`/bill/purchase-detail/${record.id}`}>查看</Link>,
      },
    ];

    return (
      <PageHeaderLayout breadcrumbList={breadcrumbList}>
        <Card bordered={false}>
          <Table
            columns={columns}
            dataSource={skusPurchaseList}
            onChange={this.handleSort}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </PageHeaderLayout>
    );
  }
}