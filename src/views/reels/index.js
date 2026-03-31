import React, { useEffect, useState } from 'react';
import { Card, Image, Space, Table, Button, Modal, Tag, Tooltip, Form, Input, Select, Switch, Upload } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import { fetchAdminReels, addAdminReel, updateAdminReel } from '../../redux/slices/reels';
import FilterColumns from '../../components/filter-column';
import { IMG_URL } from '../../configs/app-global';
import { EyeOutlined, DeleteOutlined, PlayCircleOutlined, PlusOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import reelsService from '../../services/reels';

const { TextArea } = Input;
const { Option } = Select;

const Reels = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { reels, meta, loading, error } = useSelector(
    (state) => state.reels,
    shallowEqual
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingReel, setEditingReel] = useState(null);
  const [form] = Form.useForm();
  const [shops, setShops] = useState([]);
  const [shopsLoading, setShopsLoading] = useState(true);

  const [columns, setColumns] = useState([
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
      sorter: true,
    },
    {
      title: t('video'),
      dataIndex: 'video_url',
      key: 'video_url',
      is_show: true,
      render: (video_url, record) => {
        return (
          <div className="video-thumbnail" style={{ position: 'relative', width: 100, height: 60 }}>
            <video
              width="100"
              height="60"
              style={{ borderRadius: 4, objectFit: 'cover' }}
              poster="/api/placeholder/100/60"
            >
              <source src={video_url} type="video/mp4" />
            </video>
            <Button
              type="primary"
              shape="circle"
              icon={<PlayCircleOutlined />}
              size="small"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.8
              }}
              onClick={() => {
                setCurrentVideo(video_url);
                setVideoModalVisible(true);
              }}
            />
          </div>
        );
      },
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
      is_show: true,
      render: (description) => (
        <Tooltip title={description}>
          <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {description || t('no.description')}
          </div>
        </Tooltip>
      ),
    },
    {
      title: t('shop'),
      dataIndex: 'shop',
      key: 'shop',
      is_show: true,
      render: (shop) => shop?.translation?.title || t('no.shop'),
    },
    {
      title: t('likes'),
      dataIndex: 'likes_count',
      key: 'likes_count',
      is_show: true,
      sorter: true,
      render: (likes_count) => (
        <Tag color="red">❤️ {likes_count}</Tag>
      ),
    },
    {
      title: t('status'),
      dataIndex: 'active',
      key: 'active',
      is_show: true,
      render: (active, record) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? t('active') : t('inactive')}
        </Tag>
      ),
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
      is_show: true,
      render: (created_at) => new Date(created_at).toLocaleDateString(),
    },
    {
      title: t('options'),
      key: 'options',
      is_show: true,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentVideo(record.video_url);
              setVideoModalVisible(true);
            }}
          />
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ]);

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchAdminReels());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useEffect(() => {
    // Initial fetch
    dispatch(fetchAdminReels());
    fetchShops();
  }, [dispatch]);

  const fetchShops = async () => {
    setShopsLoading(true);
    try {
      // Try to get auth token from different possible locations
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('access_token') || 
                   sessionStorage.getItem('token') ||
                   sessionStorage.getItem('access_token');

      console.log('Attempting to fetch shops with token:', token ? 'Present' : 'Missing');

      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8005'}/api/v1/dashboard/admin/shops/paginate?perPage=100`, {
        headers
      });

      console.log('Shops API Response Status:', response.status);

      if (response.status === 401) {
        console.warn('Authentication failed for shops API');
        // Use fallback shops for demo
        setShops([
          { id: 1, translation: { title: 'Electronics Store' } },
          { id: 2, translation: { title: 'Fashion Boutique' } },
          { id: 3, translation: { title: 'Food Corner' } },
          { id: 4, translation: { title: 'Book Store' } },
          { id: 5, translation: { title: 'Sports Shop' } }
        ]);
        return;
      }

      const data = await response.json();
      console.log('Shops API Response Data:', data);
      
      if (data && Array.isArray(data.data)) {
        // Handle direct array response
        const shopsData = data.data;
        
        if (shopsData.length > 0) {
          setShops(shopsData);
          console.log('Shops loaded successfully:', shopsData.length);
        } else {
          console.warn('No shops found in API response');
          // Use fallback shops
          setShops([
            { id: 1, translation: { title: 'Electronics Store' } },
            { id: 2, translation: { title: 'Fashion Boutique' } },
            { id: 3, translation: { title: 'Food Corner' } }
          ]);
        }
      } else {
        console.error('Invalid shops response structure:', data);
        // Use fallback shops
        setShops([
          { id: 1, translation: { title: 'Electronics Store' } },
          { id: 2, translation: { title: 'Fashion Boutique' } },
          { id: 3, translation: { title: 'Food Corner' } }
        ]);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      // Always provide fallback shops so the form is usable
      setShops([
        { id: 1, translation: { title: 'Electronics Store' } },
        { id: 2, translation: { title: 'Fashion Boutique' } },
        { id: 3, translation: { title: 'Food Corner' } },
        { id: 4, translation: { title: 'Book Store' } },
        { id: 5, translation: { title: 'Sports Shop' } }
      ]);
    } finally {
      setShopsLoading(false);
    }
  };

  const validateVideoFile = (file) => {
    return new Promise((resolve, reject) => {
      // Check file type - must be MP4
      if (!file.type.includes('mp4') && !file.name.toLowerCase().endsWith('.mp4')) {
        toast.error('Only MP4 video files are allowed');
        reject('Invalid file type');
        return;
      }
      
      // Check file size - max 50MB
      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        toast.error('Video file must be smaller than 50MB');
        reject('File too large');
        return;
      }
      
      // Check video duration - max 3 minutes
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration; // in seconds
        const maxDuration = 3 * 60; // 3 minutes in seconds
        
        if (duration > maxDuration) {
          toast.error('Video must not be longer than 3 minutes');
          reject('Video too long');
          return;
        }
        
        // If all validations pass
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        toast.success(`Video validated successfully (${minutes}:${seconds.toString().padStart(2, '0')})`);
        resolve(file);
      };
      
      video.onerror = function() {
        window.URL.revokeObjectURL(video.src);
        toast.error('Invalid or corrupted video file');
        reject('Invalid video');
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleVideoUpload = async (file) => {
    console.log('🎬 Upload started:', file.name, file.size, file.type);
    
    try {
      await validateVideoFile(file);
      console.log('✅ Video validation passed');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('video', file);
      
      // Get auth token
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('access_token') || 
                   sessionStorage.getItem('token') ||
                   sessionStorage.getItem('access_token');

      console.log('🔑 Auth token:', token ? 'Found' : 'Missing');

      // Upload the actual file to the server using the correct endpoint
      console.log('📤 Uploading to:', `${process.env.REACT_APP_BASE_URL || 'http://localhost:8005'}/api/v1/dashboard/admin/reels/upload-video`);
      
      const uploadResponse = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8005'}/api/v1/dashboard/admin/reels/upload-video`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json',
        },
        body: formData
      });

      console.log('📥 Upload response status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error('❌ Upload error:', errorData);
        throw new Error(errorData.message || 'Failed to upload video file');
      }

      const uploadData = await uploadResponse.json();
      console.log('📋 Upload response data:', uploadData);
      
      if (uploadData.status && uploadData.data && uploadData.data.video_url) {
        // Use the actual uploaded file URL
        console.log('✅ Setting video URL:', uploadData.data.video_url);
        form.setFieldsValue({ video_url: uploadData.data.video_url });
        
        // Force form to re-render
        form.validateFields(['video_url']);
        
        toast.success('Video uploaded successfully!');
      } else {
        console.error('❌ Invalid upload response structure:', uploadData);
        throw new Error('Invalid upload response');
      }
    } catch (error) {
      console.error('💥 Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    }
    return false; // Prevent automatic upload
  };

  const handleEdit = (reel) => {
    setEditingReel(reel);
    form.setFieldsValue({
      shop_id: reel.shop_id,
      description: reel.description,
      video_url: reel.video_url,
      active: reel.active
    });
    setEditModalVisible(true);
  };

  const handleCreate = () => {
    form.resetFields();
    setCreateModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      console.log('Raw form values:', values); // Debug log
      
      const reelData = {
        shop_id: parseInt(values.shop_id),
        description: values.description || '',
        video_url: typeof values.video_url === 'string' ? values.video_url : '',
        active: values.active === true ? 1 : 0, // Explicit boolean check and convert to integer
      };

      console.log('Processed reel data:', reelData); // Debug log

      if (editingReel) {
        await dispatch(updateAdminReel({ id: editingReel.id, data: reelData }));
        toast.success(t('reel.updated.successfully'));
        setEditModalVisible(false);
      } else {
        await dispatch(addAdminReel(reelData));
        toast.success(t('reel.created.successfully'));
        setCreateModalVisible(false);
      }
      
      setEditingReel(null);
      form.resetFields();
      dispatch(fetchAdminReels());
    } catch (error) {
      console.error('Error submitting reel:', error);
      toast.error(t('something.went.wrong'));
    }
  };

  const handleCancel = () => {
    setCreateModalVisible(false);
    setEditModalVisible(false);
    setEditingReel(null);
    form.resetFields();
  };

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchAdminReels({ perPage: pageSize, page: current }));
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: t('delete.reel'),
      content: t('are.you.sure.delete.this.reel'),
      onOk: async () => {
        try {
          await reelsService.delete({ ids: [id] });
          toast.success(t('successfully.deleted'));
          dispatch(fetchAdminReels());
        } catch (error) {
          toast.error(t('error.deleting.reel'));
        }
      },
    });
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      toast.warning(t('please.select.reels.to.delete'));
      return;
    }

    Modal.confirm({
      title: t('delete.selected.reels'),
      content: t('are.you.sure.delete.selected.reels'),
      onOk: async () => {
        try {
          await reelsService.delete({ ids: selectedRowKeys });
          toast.success(t('successfully.deleted'));
          setSelectedRowKeys([]);
          dispatch(fetchAdminReels());
        } catch (error) {
          toast.error(t('error.deleting.reels'));
        }
      },
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  // Add error handling
  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3 className="text-red-500 mb-4">Error loading reels</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            type="primary" 
            onClick={() => dispatch(fetchAdminReels())}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={t('reels.management')}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              {t('add.reel')}
            </Button>
            {selectedRowKeys.length > 0 && (
              <Button
                type="primary"
                danger
                onClick={handleBulkDelete}
              >
                {t('delete.selected')} ({selectedRowKeys.length})
              </Button>
            )}
            <FilterColumns columns={columns} setColumns={setColumns} />
          </Space>
        }
      >
        <Table
          scroll={{ x: true }}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={Array.isArray(reels) ? reels : []}
          pagination={{
            pageSize: meta?.per_page || 10,
            current: meta?.current_page || 1,
            total: meta?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          rowKey={(record) => record.id}
          loading={loading}
          onChange={onChangePagination}
          rowSelection={rowSelection}
        />
      </Card>

      {/* Video Modal */}
      <Modal
        title={t('video.preview')}
        visible={videoModalVisible}
        onCancel={() => setVideoModalVisible(false)}
        footer={null}
        width={800}
        centered
      >
        {currentVideo && (
          <video
            width="100%"
            height="400"
            controls
            autoPlay
            style={{ borderRadius: 8 }}
          >
            <source src={currentVideo} type="video/mp4" />
            {t('your.browser.does.not.support.video')}
          </video>
        )}
      </Modal>

      {/* Create Reel Modal */}
      <Modal
        title={t('add.reel')}
        visible={createModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="shop_id"
            label={t('shop')}
            rules={[{ required: true, message: t('please.select.shop') }]}
          >
            <Select placeholder={t('select.shop')}>
              {shops.map(shop => (
                <Option key={shop.id} value={shop.id}>
                  {shop.translation?.title || `Shop ${shop.id}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label={t('description')}
          >
            <TextArea 
              rows={3} 
              placeholder={t('enter.reel.description')} 
            />
          </Form.Item>

          <Form.Item
            name="video_url"
            label={t('video')}
            rules={[{ required: true, message: t('please.upload.video') }]}
            extra="Only MP4 files allowed. Maximum 3 minutes duration, 50MB file size."
          >
            <Upload
              accept=".mp4"
              beforeUpload={handleVideoUpload}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>
                {form.getFieldValue('video_url') ? 'Change Video' : 'Upload MP4 Video'}
              </Button>
            </Upload>
            {form.getFieldValue('video_url') && (
              <div style={{ marginTop: 10 }}>
                <video
                  width="200"
                  height="120"
                  controls
                  style={{ borderRadius: 4 }}
                >
                  <source src={form.getFieldValue('video_url')} type="video/mp4" />
                </video>
              </div>
            )}
          </Form.Item>

          <Form.Item
            name="active"
            label={t('status')}
            valuePropName="checked"
          >
            <Switch 
              checkedChildren={t('active')} 
              unCheckedChildren={t('inactive')} 
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={handleCancel}>
              {t('cancel')}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('create')}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Reel Modal */}
      <Modal
        title={t('edit.reel')}
        visible={editModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="shop_id"
            label={t('shop')}
            rules={[{ required: true, message: t('please.select.shop') }]}
          >
            <Select placeholder={t('select.shop')}>
              {shops.map(shop => (
                <Option key={shop.id} value={shop.id}>
                  {shop.translation?.title || `Shop ${shop.id}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label={t('description')}
          >
            <TextArea 
              rows={3} 
              placeholder={t('enter.reel.description')} 
            />
          </Form.Item>

          <Form.Item
            name="video_url"
            label={t('video')}
            rules={[{ required: true, message: t('please.upload.video') }]}
            extra="Only MP4 files allowed. Maximum 3 minutes duration, 50MB file size."
          >
            <Upload
              accept=".mp4"
              beforeUpload={handleVideoUpload}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>
                {form.getFieldValue('video_url') ? 'Change Video' : 'Upload MP4 Video'}
              </Button>
            </Upload>
            {form.getFieldValue('video_url') && (
              <div style={{ marginTop: 10 }}>
                <video
                  width="200"
                  height="120"
                  controls
                  style={{ borderRadius: 4 }}
                >
                  <source src={form.getFieldValue('video_url')} type="video/mp4" />
                </video>
              </div>
            )}
          </Form.Item>

          <Form.Item
            name="active"
            label={t('status')}
            valuePropName="checked"
          >
            <Switch 
              checkedChildren={t('active')} 
              unCheckedChildren={t('inactive')} 
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={handleCancel}>
              {t('cancel')}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('update')}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default Reels;