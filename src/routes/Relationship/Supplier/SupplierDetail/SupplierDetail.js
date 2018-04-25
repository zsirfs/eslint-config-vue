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
  Icon,
  Menu,
  Dropdown,
  Popconfirm,
  Divider,
  Radio,
  Table,
  Form,
  DatePicker,
} from 'antd';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import FilterDatePick from '../../../../components/FilterDatePick';
import FilterPicker from '../../../../components/FilterPicker/FilterPicker';
import DescriptionList from '../../../../components/antd-pro/DescriptionList';
import LightBoxImage from '../../../../components/LightBoxImage/LightBoxImage';
import styles from './SupplierDetail.less';

const NCNF = (value) => currency(value, { symbol: '', precision: 2 });
const NCNI = (value) => currency(value, { symbol: '', precision: 0 });
const { Description } = DescriptionList;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const ButtonGroup = Button.Group;
const agoSevenDays = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
const tabList = [
  {
    key: 'detail',
    tab: '详情',
  },
  {
    key: 'debt',
    tab: '我欠他',
  },
  {
    key: 'sale',
    tab: '交易历史',
  },
  {
    key: 'goods',
    tab: '商品历史',
  },
  {
    key: 'payment',
    tab: '收银历史',
  },
];
const tabListNoTitle = [
  {
    key: 'balance',
    tab: '我的余额',
  },
  {
    key: 'purchase',
    tab: '未结算进货单',
  },
  {
    key: 'settle',
    tab: '未付款结算单',
  },
];
const pagination = {
  showQuickJumper: true,
  showSizeChanger: true,
};
@Form.create()
@connect((state) => ({
  supplierDetail: state.supplierDetail,
}))
export default class SupplierDetail extends PureComponent {
  state = {
    activeTabKey: 'detail',
    activeDebtTabKey: 'balance',
    sortSaleHistory: {
      sorts: {
        created_at: 'desc',
      },
    },
    filterSaleHistory: {
      date_type: 'custom',
      sday: moment(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
        'YYYY-MM-DD',
      ),
      eday: moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'),
    },
    pageSaleHistory: {
      page: 1,
      per_page: 10,
    },
    sortGoodsHistory: {
      sorts: {
        purchase_time: 'desc',
      },
    },
    filterGoodsHistory: {
      date_type: 'custom',
      sday: moment(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
        'YYYY-MM-DD',
      ),
      eday: moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'),
    },
    pageGoodsHistory: {
      page: 1,
      per_page: 10,
    },
    sortPaymentHistory: {
      sorts: {
        created_at: 'desc',
      },
    },
    filterPaymentHistory: {
      date_type: 'custom',
      sday: moment(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
        'YYYY-MM-DD',
      ),
      eday: moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'),
    },
    pagePaymentHistory: {
      page: 1,
      per_page: 10,
    },
    pagePurchaseorder: {
      page: 1,
      per_page: 10,
    },
    pageStatement: {
      page: 1,
      per_page: 10,
    },
    pagePayments: {
      page: 1,
      per_page: 10,
    },
  };

  handleTabChange = (key) => {
    this.setState({ activeTabKey: key });
  };

  handleDebtTabChange = (key) => {
    this.setState({ activeDebtTabKey: key });
  };

  handleDeleteSingleSupplier = (id) => {
    this.props.dispatch({ type: 'supplierDetail/deleteSingle', payload: id }).then(() => {
      this.props.dispatch(routerRedux.push('/relationship/supplier-list'));
    });
  };

  handleChangeSupplierStatus = (id, status) => {
    this.props.dispatch({
      type: 'supplierDetail/changeSupplierStatus',
      payload: {
        id,
        freeze: status == 1 ? 0 : 1,
      },
    });
  };

  handleToSupplierEdit = () => {
    this.props.dispatch(
      routerRedux.push(`/relationship/supplier-edit/${this.props.supplierDetail.currentId.id}`),
    );
  };

  handleSaleHistorySort = (pagination, filter, sorter) => {
    const sortSaleHistory = {
      sorts: {},
    };
    if (sorter.field) {
      sortSaleHistory.sorts[sorter.field] = sorter.order.slice(0, sorter.order.length - 3);
    } else {
      sortSaleHistory.sorts = {
        created_at: 'desc',
      };
    }
    this.setState({ sortSaleHistory });
    this.props.dispatch({
      type: 'supplierDetail/getSaleHistory',
      payload: {
        ...this.state.filterSaleHistory,
        ...sortSaleHistory,
        id: this.props.supplierDetail.currentId.id,
      },
    });
  };

  handleSaleFormSubmit = (search) => {
    const { form, dispatch } = this.props;
    setTimeout(() => {
      form.validateFields((err) => {
        if (!err) {
          dispatch({
            type: 'supplierDetail/setFilterSaleServerData',
            payload: search,
          });
          const filterSaleHistory = this.props.supplierDetail.filterSaleServerData;
          this.setState({ filterSaleHistory });
          dispatch({
            type: 'supplierDetail/getSaleHistory',
            payload: {
              ...filterSaleHistory,
              ...this.state.sortSaleHistory,
              id: this.props.supplierDetail.currentId.id,
            },
          });
        }
      });
    }, 0);
  };

  handleGoodsHistorySort = (pagination, filter, sorter) => {
    const sortGoodsHistory = {
      sorts: {},
    };
    if (sorter.field) {
      sortGoodsHistory.sorts[sorter.field] = sorter.order.slice(0, sorter.order.length - 3);
    } else {
      sortGoodsHistory.sorts = {
        purchase_time: 'desc',
      };
    }
    this.setState({ sortGoodsHistory });
    this.props.dispatch({
      type: 'supplierDetail/getGoodsHistory',
      payload: {
        ...this.state.filterGoodsHistory,
        ...sortGoodsHistory,
        id: this.props.supplierDetail.currentId.id,
      },
    });
  };

  handleGoodsFormSubmit = (search) => {
    const { form, dispatch } = this.props;
    setTimeout(() => {
      form.validateFields((err, value) => {
        if (!err) {
          this.props.dispatch({
            type: 'supplierDetail/setFilterGoodsServerData',
            payload: search,
          });
          const filterGoodsHistory = this.props.supplierDetail.filterGoodsServerData;
          this.setState({ filterGoodsHistory });
          this.props.dispatch({
            type: 'supplierDetail/getGoodsHistory',
            payload: {
              ...filterGoodsHistory,
              ...this.state.sortGoodsHistory,
              id: this.props.supplierDetail.currentId.id,
            },
          });
        }
      });
    }, 0);
  };

  handlePaymentHistorySort = (pagination, filter, sorter) => {
    const sortPaymentHistory = {
      sorts: {},
    };
    if (sorter.field) {
      sortPaymentHistory.sorts[sorter.field] = sorter.order.slice(0, sorter.order.length - 3);
    } else {
      sortPaymentHistory.sorts = {
        created_at: 'desc',
      };
    }
    this.setState({ sortPaymentHistory });
    this.props.dispatch({
      type: 'supplierDetail/getPaymentHistory',
      payload: {
        ...this.state.filterPaymentHistory,
        ...sortPaymentHistory,
        id: this.props.supplierDetail.currentId.id,
      },
    });
  };

  handlePaymentFormSubmit = (search) => {
    const { form, dispatch } = this.props;
    setTimeout(() => {
      form.validateFields((err, value) => {
        if (!err) {
          this.props.dispatch({
            type: 'supplierDetail/setFilterPurchaseServerData',
            payload: search,
          });
          const filterPaymentHistory = this.props.supplierDetail.filterPaymentServerData;
          this.setState({ filterPaymentHistory });
          this.props.dispatch({
            type: 'supplierDetail/getPaymentHistory',
            payload: {
              ...filterPaymentHistory,
              ...this.state.sortPaymentHistory,
              id: this.props.supplierDetail.currentId.id,
            },
          });
        }
      });
    }, 0);
  };

  handlePurchaseorderSort = (pagination, filter, sorter) => {
    const purchaseorderSort = {
      sorts: {},
    };
    if (sorter.field) {
      purchaseorderSort.sorts[sorter.field] = sorter.order.slice(0, sorter.order.length - 3);
    } else {
      purchaseorderSort.sorts = {
        created_at: 'desc',
      };
    }
    this.props.dispatch({
      type: 'supplierDetail/getPurchaseorder',
      payload: {
        ...purchaseorderSort,
        id: this.props.supplierDetail.currentId.id,
      },
    });
  };

  handleStatementSort = (pagination, filter, sorter) => {
    const pageStatement = {
      page: pagination.current,
      per_page: pagination.pageSize,
    };
    this.setState({ pageStatement });
    const statementSort = {
      sorts: {},
    };
    if (sorter.field) {
      statementSort.sorts[sorter.field] = sorter.order.slice(0, sorter.order.length - 3);
    } else {
      statementSort.sorts = {
        created_at: 'desc',
      };
    }
    this.props.dispatch({
      type: 'supplierDetail/getStatement',
      payload: {
        ...statementSort,
        id: this.props.supplierDetail.currentId.id,
      },
    });
  };

  handlePaymentsSort = (pagination, filter, sorter) => {
    const pagePayments = {
      page: pagination.current,
      per_page: pagination.pageSize,
    };
    this.setState({ pagePayments });
    let sorts = {};
    if (sorter.field) {
      sorts[sorter.field] = sorter.order.slice(0, sorter.order.length - 3);
    } else {
      sorts = {
        created_at: 'desc',
      };
    }
    this.props.dispatch({
      type: 'supplierDetail/getPayments',
      payload: {
        sorts,
        id: this.props.supplierDetail.currentId.id,
      },
    });
  };

  render() {
    const {
      singleSupplierDetail,
      singleSupplierFinance,
      singleSupplierSaleHistory,
      singleSupplierGoodsHistory,
      singleSupplierPaymentHistory,
      goodsHistoryFilter,
      paymentHistoryFilter,
      currentId,
      singleSupplierPurchaseorders,
      singleSupplierStatements,
      singleSupplierPayments,
    } = this.props.supplierDetail;
    let { saleHistoryFilter } = this.props.supplierDetail;
    const {
      activeTabKey,
      activeDebtTabKey,
      pageSaleHistory,
      pageGoodsHistory,
      pagePaymentHistory,
      pagePurchaseorder,
      pageStatement,
      pagePayments,
    } = this.state;
    const { getFieldDecorator } = this.props.form;

    saleHistoryFilter = saleHistoryFilter.map((cv) => ({
      ...cv,
      multi: cv.code !== 'pay_status' && cv.code !== 'settle_way',
    }));

    const description = (
      <DescriptionList size="small" col="2" className={styles.descriptionPostion}>
        <Description term="手机号">{`${singleSupplierDetail.phone || ''}`}</Description>
        <Description term="我欠他">{`${singleSupplierDetail.debt || ''}`}</Description>
      </DescriptionList>
    );
    const menu = (
      <Menu style={{ width: 109 }}>
        <Menu.Item key="1">
          <Popconfirm
            title="确认删除此供应商?"
            placement="bottom"
            onConfirm={this.handleDeleteSingleSupplier.bind(null, currentId.id)}>
            <span style={{ width: '100%', display: 'inline-block' }}>删除</span>
          </Popconfirm>
        </Menu.Item>
      </Menu>
    );
    const breadcrumbList = [
      {
        title: '关系',
      },
      {
        title: '供应商',
        href: '/relationship/supplier-list',
      },
      {
        title: singleSupplierDetail.name || '',
      },
    ];

    const action = (
      <div>
        <ButtonGroup>
          <Popconfirm
            title={singleSupplierDetail.freeze == 1 ? '确认解冻此供应商?' : '确认冻结此供应商?'}
            placement="bottom"
            onConfirm={this.handleChangeSupplierStatus.bind(
              null,
              currentId.id,
              singleSupplierDetail.freeze,
            )}>
            <Button>{singleSupplierDetail.freeze == 1 ? '解冻' : '冻结'}</Button>
          </Popconfirm>
          <Dropdown overlay={menu} placement="bottomRight">
            <Button>
              <Icon type="ellipsis" />
            </Button>
          </Dropdown>
        </ButtonGroup>
        <Button type="primary" onClick={this.handleToSupplierEdit}>
          编辑
        </Button>
      </div>
    );

    const saleColumns = [
      {
        title: '单号',
        dataIndex: 'number',
        width: '15%',
        render: (text, record) => `#${record.number}`,
      },
      {
        title: '入库仓库',
        dataIndex: 'warehouse',
        width: '15%',
        render: (text, record) => `${record.warehouse.data.name}`,
      },
      {
        title: '商品数量',
        dataIndex: 'quantity',
        className: styles.numberRightMove,
        width: '15%',
        sorter: true,
        render: (text, record) => NCNI(record.quantity).format(true),
      },
      {
        title: '总额',
        dataIndex: 'due_fee',
        className: styles.numberRightMove,
        width: '20%',
        sorter: true,
        render: (text, record) => NCNF(record.due_fee).format(true),
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        width: '25%',
        sorter: true,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: '10%',
        render: (text, record) => <Link to={`/bill/purchase-detail/${record.id}`}>查看</Link>,
      },
    ];

    const goodsColumns = [
      {
        title: '货号',
        dataIndex: 'item_ref',
        width: '15%',
      },
      {
        title: '供应量',
        dataIndex: 'item_quantity',
        width: '20%',
        className: styles.numberRightMove,
        sorter: true,
        render: (text, record) => NCNI(record.item_quantity).format(true),
      },
      {
        title: '供应额',
        dataIndex: 'item_value',
        width: '30%',
        className: styles.numberRightMove,
        sorter: true,
        render: (text, record) => NCNF(record.item_value).format(true),
      },
      {
        title: '最后供应时间',
        dataIndex: 'purchase_time',
        width: '25%',
        sorter: true,
      },
      {
        title: '操作',
        width: '10%',
        dataIndex: 'operation',
        render: (text, record) => (
          <Link
            to={`/relationship/supplier-detail/goods-purchase-detail/${currentId.id}/${record.id}/${
              singleSupplierDetail.name
            }`}>
            查看
          </Link>
        ),
      },
    ];

    const paymentColumns = [
      {
        title: '流水号',
        dataIndex: 'number',
        width: '25',
        render: (text, record) => `#${record.number}`,
      },
      {
        title: '收银方式',
        dataIndex: 'paymentmethod',
        width: '20',
        render: (text, record) => `${record.paymentmethod.name}`,
      },
      {
        title: '金额',
        dataIndex: 'value',
        width: '20',
        className: styles.numberRightMove,
        sorter: true,
        render: (text, record) => NCNF(record.value).format(true),
      },
      {
        title: '创建时间',
        width: '25',
        dataIndex: 'created_at',
        sorter: true,
      },
      {
        title: '操作',
        width: '10',
        dataIndex: 'operation',
        render: (text, record) => <Link to={`/finance/payments-detail/${record.id}`}>查看</Link>,
      },
    ];

    const purchaseorderColumns = [
      {
        title: '单号',
        dataIndex: 'number',
        width: '15%',
        render: (text, record) => `#${record.number}`,
      },
      {
        title: '商品数量',
        dataIndex: 'quantity',
        width: '20%',
        sorter: true,
        className: styles.numberRightMove,
        render: (text, record) => NCNI(record.quantity).format(true),
      },
      {
        title: '未付总款',
        dataIndex: 'due_fee',
        width: '30%',
        className: styles.numberRightMove,
        sorter: true,
        render: (text, record) => NCNF(record.due_fee).format(true),
      },
      {
        title: '创建时间',
        width: '25%',
        dataIndex: 'created_at',
        sorter: true,
      },
      {
        title: '操作',
        width: '10%',
        dataIndex: 'operation',
        render: (text, record) => <Link to={`/bill/purchase-detail/${record.id}`}>查看</Link>,
      },
    ];

    const statementColumns = [
      {
        title: '流水号',
        dataIndex: 'number',
        width: '15%',
        render: (text, record) => `#${record.number}`,
      },
      {
        title: '单据数量',
        dataIndex: 'order_quantity',
        width: '20%',
        className: styles.numberRightMove,
        sorter: true,
        render: (text, record) => NCNI(record.order_quantity).format(true),
      },
      {
        title: '未付总款',
        dataIndex: 'need_pay',
        width: '30%',
        className: styles.numberRightMove,
        sorter: true,
        render: (text, record) => NCNF(record.need_pay).format(true),
      },
      {
        title: '创建时间',
        width: '25%',
        dataIndex: 'created_at',
        sorter: true,
      },
      {
        title: '操作',
        width: '10%',
        dataIndex: 'operation',
        render: (text, record) => (
          <Link to={`/finance/purchase-settle-detail/${record.id}`}>查看</Link>
        ),
      },
    ];

    const purchasesColumns = [
      {
        title: '流水号',
        dataIndex: 'number',
        width: '20%',
        render: (text, record) => `#${record.number}`,
      },
      {
        title: '支付方式',
        dataIndex: 'paymentWay',
        sorter: true,
        render: (text, record) => record.paymentmethod.data.name,
      },
      {
        title: '金额',
        dataIndex: 'value',
        width: '20%',
        className: styles.numberRightMove,
        sorter: true,
        render: (text, record) => NCNF(record.value).format(true),
      },
      {
        title: '创建时间',
        width: '30%',
        dataIndex: 'created_at',
        sorter: true,
      },
      {
        title: '操作',
        width: '10%',
        dataIndex: 'operation',
        render: (text, record) => <a>查看</a>,
      },
    ];

    const Info = ({ title, value, bordered }) => (
      <div className={styles.headerInfo}>
        <span>{title}</span>
        <p>{value}</p>
        {bordered && <em />}
      </div>
    );

    return (
      <PageHeaderLayout
        title={`姓名：${singleSupplierDetail.name || ''}`}
        logo={
          <img alt="" src="https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png" />
        }
        breadcrumbList={breadcrumbList}
        content={description}
        activeTabKey={activeTabKey}
        action={action}
        tabList={tabList}
        onTabChange={this.handleTabChange}>
        <Card bordered={false} style={{ display: activeTabKey == 'detail' ? 'block' : 'none' }}>
          <div className={styles.title}>基本资料</div>
          {singleSupplierDetail.basicDetail && !!singleSupplierDetail.basicDetail.length ? (
            <Row gutter={32}>
              {singleSupplierDetail.basicDetail.map((item, index) => {
                return (
                  <Col span={12} key={index} style={{ marginBottom: 16 }}>
                    <label className={styles.labelTitle}>{`${item.parentName}： `}</label>
                    <span>{item.name}</span>
                  </Col>
                );
              })}
            </Row>
          ) : null}
          {singleSupplierDetail.imageFiles && !!singleSupplierDetail.imageFiles.length ? (
            <div>
              <Divider style={{ marginBottom: 32 }} />
              <div className={styles.title}>附件</div>
            </div>
          ) : null}
          <LightBoxImage imageSource={singleSupplierDetail.imageFiles || []} />
          {singleSupplierDetail.addresses && !!singleSupplierDetail.addresses.length ? (
            <div>
              <Divider style={{ marginBottom: 32 }} />
              <div className={styles.title}>地址</div>
            </div>
          ) : null}
          {singleSupplierDetail.addresses &&
            singleSupplierDetail.addresses.map((item, index) => {
              return (
                <div key={item.id}>
                  {index > 0 ? <Divider style={{ marginBottom: 20 }} /> : null}
                  <Row>
                    <Col span={5}>
                      <label className={styles.labelTitle}>收货人：</label>
                      <span>{item.name || ''}</span>
                    </Col>
                    <Col span={6}>
                      <label className={styles.labelTitle}>手机号：</label>
                      <span>{item.phone}</span>
                    </Col>
                    <Col span={11}>
                      <label className={styles.labelTitle}>收货地址：</label>
                      <span>{item.address}</span>
                    </Col>
                    <Col span={2}>
                      {item.default == 1 ? (
                        <Radio className={styles.labelTitle} checked>
                          默认地址
                        </Radio>
                      ) : null}
                    </Col>
                  </Row>
                </div>
              );
            })}
        </Card>
        <div style={{ display: activeTabKey == 'debt' ? 'block' : 'none' }}>
          <Card bordered={false} className={styles.bottomCardDivided}>
            <Row>
              <Col span={8}>
                <Info title="我的余额" value={singleSupplierFinance.balance || '0.00'} bordered />
              </Col>
              <Col span={8}>
                <Info
                  title="未结算进货单"
                  value={singleSupplierFinance.purchase_unpaid || '0.00'}
                  bordered
                />
              </Col>
              <Col span={8}>
                <Info
                  title="未付款结算单"
                  value={singleSupplierFinance.statement_unpaid || '0.00'}
                />
              </Col>
            </Row>
          </Card>
          <Card bordered={false} tabList={tabListNoTitle} onTabChange={this.handleDebtTabChange}>
            <div style={{ display: activeDebtTabKey == 'balance' ? 'block' : 'none' }}>
              <Table
                columns={purchasesColumns}
                dataSource={singleSupplierPayments}
                onChange={this.handlePaymentsSort}
                pagination={pagination}
                rowKey="id"
              />
              <div style={{ marginTop: -43, width: 300 }}>
                <span>{`共 ${singleSupplierPayments.length || ''} 条流水 第 ${
                  pagePayments.page
                } / ${Math.ceil(
                  Number(singleSupplierPayments.length) / Number(pagePayments.per_page),
                )} 页`}</span>
              </div>
            </div>
            <div style={{ display: activeDebtTabKey == 'purchase' ? 'block' : 'none' }}>
              <Table
                columns={purchaseorderColumns}
                dataSource={singleSupplierPurchaseorders}
                onChange={this.handlePurchaseorderSort}
                pagination={pagination}
                rowKey="id"
              />
              <div style={{ marginTop: -43, width: 300 }}>
                <span>{`共 ${singleSupplierPurchaseorders.length || ''} 条进货单 第 ${
                  pagePurchaseorder.page
                } / ${Math.ceil(
                  Number(singleSupplierPurchaseorders.length) / Number(pagePurchaseorder.per_page),
                )} 页`}</span>
              </div>
            </div>
            <div style={{ display: activeDebtTabKey == 'settle' ? 'block' : 'none' }}>
              <Table
                columns={statementColumns}
                dataSource={singleSupplierStatements}
                onChange={this.handleStatementSort}
                pagination={pagination}
                rowKey="id"
              />
              <div style={{ marginTop: -43, width: 300 }}>
                <span>{`共 ${singleSupplierStatements.length || ''} 条结算单 第 ${
                  pageStatement.page
                } / ${Math.ceil(
                  Number(singleSupplierStatements.length) / Number(pageStatement.per_page),
                )} 页`}</span>
              </div>
            </div>
          </Card>
        </div>
        <div style={{ display: activeTabKey == 'sale' ? 'block' : 'none' }}>
          {/* <Card bordered={false} className={styles.bottomCardDivided}>
            <FilterDatePick
              onChange={this.handleSaleFormSubmit}
              filterOptions={saleHistoryFilter}
              tagLabel="sale"
              dateLabel="sale"
            />
          </Card> */}
          <FilterPicker filters={saleHistoryFilter} onChange={this.handleSaleFormSubmit} />
          <Card bordered={false}>
            <Table
              columns={saleColumns}
              dataSource={singleSupplierSaleHistory}
              onChange={this.handleSaleHistorySort}
              pagination={pagination}
              rowKey="id"
            />
            <div style={{ marginTop: -43, width: 300 }}>
              <span>{`共 ${singleSupplierSaleHistory.length || ''} 条进货单 第 ${
                pageSaleHistory.page
              } / ${Math.ceil(
                Number(singleSupplierSaleHistory.length) / Number(pageSaleHistory.per_page),
              )} 页`}</span>
            </div>
          </Card>
        </div>
        <div style={{ display: activeTabKey == 'goods' ? 'block' : 'none' }}>
          {/* <Card bordered={false} className={styles.bottomCardDivided}>
            <FilterDatePick
              onChange={this.handleGoodsFormSubmit}
              filterOptions={goodsHistoryFilter}
              tagLabel="goods"
              dateLabel="goods"
            />
          </Card> */}
          <FilterPicker onChange={this.handleGoodsFormSubmit} filters={goodsHistoryFilter} />
          <Card bordered={false}>
            <Table
              columns={goodsColumns}
              dataSource={singleSupplierGoodsHistory}
              onChange={this.handleGoodsHistorySort}
              pagination={pagination}
              rowKey="id"
            />
            <div style={{ marginTop: -43, width: 300 }}>
              <span>{`共 ${singleSupplierGoodsHistory.length || ''} 件商品 第 ${
                pageGoodsHistory.page
              } / ${Math.ceil(
                Number(singleSupplierGoodsHistory.length) / Number(pageGoodsHistory.per_page),
              )} 页`}</span>
            </div>
          </Card>
        </div>
        <div style={{ display: activeTabKey == 'payment' ? 'block' : 'none' }}>
          {/* <Card bordered={false} className={styles.bottomCardDivided}>
            <FilterDatePick
              onChange={this.handlePaymentFormSubmit}
              filterOptions={paymentHistoryFilter}
              tagLabel="payment"
              dateLabel="payment"
            />
          </Card> */}
          <FilterPicker onChange={this.handlePaymentFormSubmit} filters={paymentHistoryFilter} />
          <Card bordered={false}>
            <Table
              columns={paymentColumns}
              dataSource={singleSupplierPaymentHistory}
              onChange={this.handlePaymentHistorySort}
              pagination={pagination}
              rowKey="id"
            />
            <div style={{ marginTop: -43, width: 300 }}>
              <span>{`共 ${singleSupplierPaymentHistory.length || ''} 条流水 第 ${
                pagePaymentHistory.page
              } / ${Math.ceil(
                Number(singleSupplierPaymentHistory.length) / Number(pagePaymentHistory.per_page),
              )} 页`}</span>
            </div>
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}