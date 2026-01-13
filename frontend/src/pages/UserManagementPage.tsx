import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, Select, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { usersService, User } from '../services/usersService';
import dayjs from 'dayjs';

const { Option } = Select;

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await usersService.getUsers();
      setUsers(response.users);
    } catch {
      message.error('加载用户失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      role: user.role,
    });
    setModalVisible(true);
  };

  const handleDelete = (user: User) => {
    Modal.confirm({
      title: '删除用户',
      content: `确定要删除用户 "${user.username}" 吗？`,
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await usersService.deleteUser(user.id);
          message.success('用户删除成功');
          loadUsers();
        } catch {
          message.error('用户删除失败');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await usersService.updateUser(editingUser.id, values);
        message.success('用户更新成功');
      } else {
        await usersService.createUser(values);
        message.success('用户创建成功');
      }
      setModalVisible(false);
      loadUsers();
    } catch (error: any) {
      message.error(error.response?.data?.error || '保存用户失败');
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 12 }}>
      <Card
        title="用户管理"
        size="small"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="small">
            添加用户
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          size="small"
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '创建用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: !editingUser, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password placeholder={editingUser ? '留空保持原密码' : '密码'} />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="选择角色">
              <Option value="user">普通用户</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
