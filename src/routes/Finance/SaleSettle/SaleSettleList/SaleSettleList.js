import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import moment from 'moment';
import currency from 'currency.js';
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Icon,
  Select,
  Menu,
  Dropdown,
  Popconfirm,
  Divider,
  DatePicker,
  Spin,
  Modal,
} from 'antd';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import FilterDatePick from '../../../../components/FilterDatePick';
import styles from './SaleSettleList.less';
import FilterPicker from '../../../../components/FilterPicker/FilterPicker';

const NCNF = (value) => currency(value, { symbol: '', precision: 2 });
const NCNI = (value) => currency(value, { symbol: '', precision: 0 });
const Option = Select.Option;
let confirmModal;
const { againModalConfirm } = styles;
const { RangePicker } = DatePicker;
const breadcrumbList = [
  {
    title: '财务',
  },
  {
    title: '销售结算',
  },
];
const sortOptions = [
  {
    name: '创建时间降序',
    id: 1,
    sorts: {
      created_at: 'desc',
    },
    type: 'created_at',
  },
  {
    name: '创建时间升序',
    id: 2,
    sorts: {
      created_at: 'asc',
    },
    type: 'created_at',
  },
  {
    name: '单据数量降序',
    id: 3,
    sorts: {
      order_quantity: 'desc',
    },
    type: 'order_quantity',
  },
  {
    name: '单据数量升序',
    id: 4,
    sorts: {
      order_quantity: 'asc',
    },
    type: 'order_quantity',
  },
  {
    name: '总额降序',
    id: 4,
    sorts: {
      value: 'desc',
    },
    type: 'value',
  },
  {
    name: '总额升序',
    id: 4,
    sorts: {
      value: 'asc',
    },
    type: 'value',
  },
];
const condition = {
  mode: 'salesorders',
  sorts: {
    created_at: 'desc',
  },
  page: 1,
  per_page: 10,
  date_type: 'custom',
  sday: moment(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
    'YYYY-MM-DD',
  ),
  eday: moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'),
};
@connect((state) => ({
  saleSettleList: state.saleSettleList,
  layoutFilter: state.layoutFilter,
}))
export default class SaleSettleList extends PureComponent {
  state = {
    mode: 'salesorders',
    sorts: {
      created_at: 'desc',
    },
    pages: {
      per_page: 10,
      page: 1,
    },
    filter: {
      date_type: 'custom',
      sday: moment(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
        'YYYY-MM-DD',
      ),
      eday: moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'),
    },
    sortOrder: {
      created_at: 'descend',
    },
    sortValue: '排序方式: 创建时间降序',
  };

  componentDidMount() {
    this.props.dispatch({ type: 'saleSettleList/getList', payload: { ...condition } });
    this.props.dispatch({ type: 'layoutFilter/getLayoutFilter' });
  }

  // 获取
  handleGetList = (filter, pages, sorts, mode) => {
    this.props.dispatch({
      type: 'saleSettleList/getList',
      payload: {
        ...filter,
        ...pages,
        sorts,
        mode,
      },
    });
  };

  // 删除
  handleDeleteSingle = (id, deal) => {
    if (deal != -1) {
      confirmModal.destroy();
      this.props
        .dispatch({
          type: 'saleSettleList/deleteSingle',
          payload: {
            id,
            deal_payments: deal,
          },
        })
        .then(() => {
          this.handleGetList(
            this.state.filter,
            this.state.pages,
            this.state.sorts,
            this.state.mode,
          );
        });
    } else {
      this.props
        .dispatch({
          type: 'saleSettleList/deleteSingle',
          payload: {
            id,
          },
        })
        .then(() => {
          this.handleGetList(
            this.state.filter,
            this.state.pages,
            this.state.sorts,
            this.state.mode,
          );
        });
    }
  };

  // 排序
  handlSortTable = (pagination, filters, sorter) => {
    const pages = {
      per_page: pagination.pageSize,
      page: pagination.current,
    };
    if (sorter.order) {
      const sorts = {
        [`${sorter.field}`]: sorter.order.slice(0, sorter.order.length - 3),
      };
      const sortOrder = {
        [`${sorter.field}`]: sorter.order,
      };
      const sortValue = `排序方式: ${
        sortOptions.find(
          (n) =>
            n.type == sorter.field &&
            n.sorts[sorter.field] == sorter.order.slice(0, sorter.order.length - 3),
        ).name
      }`;
      this.setState({ sorts, sortOrder, sortValue, pages });
      this.handleGetList(this.state.filter, pages, sorts, this.state.mode);
    } else {
      const sorts = {
        created_at: 'desc',
      };
      const sortOrder = {
        created_at: 'descend',
      };
      const sortValue = '排序方式: 创建时间降序';
      this.setState({ sorts, sortOrder, sortValue, pages });
      this.handleGetList(this.state.filter, pages, sorts, this.state.mode);
    }
  };

  // 排序
  handleSelectSort = (value) => {
    const sortOption = sortOptions.find((item) => item.name == value.slice(6, value.length));
    const sorts = sortOption.sorts;
    const sortValue = `排序方式: ${sortOption.name}`;
    const sortOrder = { ...sorts };
    sortOrder[sortOption.type] += 'end';
    this.setState({ sorts, sortOrder, sortValue });
    this.handleGetList(this.state.filter, this.state.pages, sorts, this.state.mode);
  };

  // 筛选
  handleFilter = (search) => {
    this.props.dispatch({
      type: 'saleSettleList/setFilterSaleSettleServerData',
      payload: search,
    });
    const filter = { ...this.props.saleSettleList.fifterSaleSettleServerData };
    const pages = { ...this.state.pages, page: 1 };
    this.setState({ filter, pages });
    this.handleGetList(filter, pages, this.state.sorts, this.state.mode);
  };

  // 删除pop
  handleDeletePopConfirm = (payStatus, id) => {
    let popconfirmModal;
    if (payStatus === '1') {
      popconfirmModal = (
        <Popconfirm
          title={
            <div>
              <span>确认删除此销售结算单?</span>
            </div>
          }
          okText="确认"
          onConfirm={this.handleDeleteSingle.bind(null, id, -1)}>
          删除
        </Popconfirm>
      );
    } else if (payStatus === '3') {
      popconfirmModal = (
        <Popconfirm
          title={
            <div>
              <span>确认删除此销售结算单?</span>
              <div style={{ color: 'red' }}>关联的流水也将一同删除</div>
            </div>
          }
          okText="继续"
          onConfirm={this.handleAgianPopConfirm.bind(null, id)}>
          删除
        </Popconfirm>
      );
    }
    return popconfirmModal;
  };

  // 删除modal
  handleAgianPopConfirm = (id) => {
    confirmModal = Modal.confirm({
      className: againModalConfirm,
      title: '关联的流水将如何处理',
      content: (
        <Button
          type="primary"
          className={styles.paymentsPositon}
          onClick={this.handleDeleteSingle.bind(null, id, 2)}>
          充值到余额
        </Button>
      ),
      okText: '删除流水',
      onOk: () => {
        this.handleDeleteSingle(id, 1);
      },
    });
  };

  handleMoreOperation = (item) => {
    return (
      <div>
        <Link to={`/finance/sale-settle-detail/${item.id}`}>查看</Link>
        <Divider type="vertical" />
        <Dropdown
          disabled={item.pay_status === '2'}
          overlay={
            <Menu>
              <Menu.Item key="1">{this.handleDeletePopConfirm(item.pay_status, item.id)}</Menu.Item>
            </Menu>
          }>
          <a className="ant-dropdown-link">
            更多<Icon type="down" />
          </a>
        </Dropdown>
      </div>
    );
  };

  render() {
    const {
      saleSettleList: { saleSettleList, saleSettlePagination },
      layoutFilter: { saleSettleFilter },
    } = this.props;
    const { mode, sorts, pages, filter, sortOrder, sortValue } = this.state;

    const tableSortExtra = (
      <Select
        style={{ width: 200 }}
        value={sortValue}
        onChange={this.handleSelectSort}
        optionLabelProp="value">
        {sortOptions.map((item) => {
          return (
            <Option key={item.id} value={`排序方式: ${item.name}`}>
              {item.name}
            </Option>
          );
        })}
      </Select>
    );

    const columns = [
      {
        title: '单号',
        dataIndex: 'number',
        render: (text, record) => `#${record.number}`,
      },
      {
        title: '交易对象',
        dataIndex: 'payer',
        width: '20%',
        render: (text, record) => `${record.ownerable.data.name}`,
      },
      {
        title: '单据数量',
        dataIndex: 'order_quantity',
        width: '15%',
        className: styles.numberRightMove,
        sorter: true,
        sortOrder: sortOrder.order_quantity || false,
        render: (text, record) => NCNI(record.order_quantity).format(true),
      },
      {
        title: '总额',
        dataIndex: 'value',
        sorter: true,
        sortOrder: sortOrder.value || false,
        className: styles.numberRightMove,
        render: (text, record) => NCNF(record.value).format(true),
      },
      {
        title: '创建时间',
        width: '20%',
        sorter: true,
        sortOrder: sortOrder.created_at || false,
        dataIndex: 'created_at',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: '172px',
        render: (text, record, index) => this.handleMoreOperation(record),
      },
    ];

    const pagination = {
      pageSize: pages.per_page,
      current: pages.page,
      total: saleSettlePagination.total,
      showQuickJumper: true,
      showSizeChanger: true,
    };

    return (
      <PageHeaderLayout breadcrumbList={breadcrumbList}>
        {/* <Card bordered={false} className={styles.bottomCardDivided}>
          <FilterDatePick onChange={this.handleFilter} filterOptions={saleSettleFilter} />
        </Card> */}
        <FilterPicker onChange={this.handleFilter} filters={saleSettleFilter} />
        <Card bordered={false} title="销售结算列表" extra={tableSortExtra}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={saleSettleList}
            pagination={pagination}
            onChange={this.handlSortTable}
          />
          <div style={{ marginTop: -43, width: 300 }}>
            <span>{`共 ${saleSettlePagination.total || ''} 条结算 第 ${pages.page} / ${Math.ceil(
              Number(saleSettlePagination.total) / Number(pages.per_page),
            )} 页`}</span>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}