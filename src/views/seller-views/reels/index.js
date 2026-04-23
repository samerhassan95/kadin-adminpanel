import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, Modal, Row, Space, Switch, Table, Tag, Upload, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerReels, addSellerReel, updateSellerReel, deleteSellerReel } from '../../../redux/slices/reels';
import { fetchSellerProducts } from '../../../redux/slices/product';
import { shallowEqual } from 'react-redux';
import { toast } from 'react-toastify';
import MediaUpload from '../../../components/upload';
import { IMG_URL } from '../../../configs/app-global';
import galleryService from '../../../services/gallery';

const { TextArea } = Input;
const { Option } = Select;

export default function SellerReels() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  
  const { reels, loading } = useSelector(
    (state) => state.reels,
    shallowEqual
  );

  const { products } = useSelector(
    (state) => state.product,
    shallowEqual
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReel, setEditingReel] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewReel, setPreviewReel] = useState(null);
  const [productSearchValue, setProductSearchValue] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);
  const [tableKey, setTableKey] = useState(Date.now()); // Force table re-render

  const validateVideoFile = (file) => {
    return new Promise((resolve, reject) => {
      // Check file type - must be MP4
      if (!file.type.includes('mp4') && !file.name.toLowerCase().endsWith('.mp4')) {
        message.error('Only MP4 video files are allowed');
        reject('Invalid file type');
        return;
      }
      
      // Check file size - max 50MB
      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        message.error('Video file must be smaller than 50MB');
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
          message.error('Video must not be longer than 3 minutes');
          reject('Video too long');
          return;
        }
        
        // If all validations pass
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        message.success(`Video validated successfully (${minutes}:${seconds.toString().padStart(2, '0')})`);
        resolve(file);
      };
      
      video.onerror = function() {
        window.URL.revokeObjectURL(video.src);
        message.error('Invalid or corrupted video file');
        reject('Invalid video');
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleVideoUpload = async (file) => {
    try {
      // Validate the video file first
      await validateVideoFile(file);
      
      setUploadingVideo(true);
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'other'); // Use 'other' type for videos
      
      console.log('📤 Uploading video file:', file.name);
      
      // Upload to gallery service
      const response = await galleryService.upload(formData);
      
      console.log('✅ Video uploaded:', response);
      
      if (response.data && response.data.title) {
        const videoUrl = response.data.title;
        
        // Set form field value
        form.setFieldsValue({ video_url: videoUrl });
        
        // Set video preview with a small delay to ensure DOM updates
        setTimeout(() => {
          setVideoPreview(videoUrl);
          console.log('📹 Video preview set:', videoUrl);
        }, 100);
        
        message.success('Video uploaded successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
      
      setUploadingVideo(false);
    } catch (error) {
      console.error('❌ Video upload error:', error);
      setUploadingVideo(false);
      message.error(error.message || 'Failed to upload video');
    }
    return false; // Prevent automatic upload
  };

  useEffect(() => {
    console.log('🔄 Fetching seller reels and products...');
    dispatch(fetchSellerReels());
    dispatch(fetchSellerProducts({ perPage: 100 })).then((result) => {
      console.log('✅ Products fetched:', result);
    }).catch((error) => {
      console.error('❌ Error fetching products:', error);
    });
  }, [dispatch]);

  // Log when reels data changes
  useEffect(() => {
    console.log('📊 Reels data updated:', reels);
    console.log('📊 Number of reels:', reels?.length || 0);
    if (reels && reels.length > 0) {
      console.log('📊 First reel sample:', reels[0]);
    }
  }, [reels]);

  const handleSubmit = async (values) => {
    try {
      const reelData = {
        title: values.title || '',
        description: values.description || '',
        video_url: typeof values.video_url === 'string' ? values.video_url : '',
        product_id: values.product_id ? parseInt(values.product_id) : null,
        is_active: values.is_active ? 1 : 0,
      };

      console.log('📤 Submitting reel data:', reelData);

      if (editingReel) {
        const result = await dispatch(updateSellerReel({ id: editingReel.id, data: reelData }));
        console.log('✅ Update result:', result);
        
        if (result.error) {
          throw new Error(result.error.message || 'Update failed');
        }
        
        message.success(t('reel.updated.successfully'));
      } else {
        const result = await dispatch(addSellerReel(reelData));
        console.log('✅ Create result:', result);
        
        if (result.error) {
          throw new Error(result.error.message || 'Create failed');
        }
        
        message.success(t('reel.created.successfully'));
      }
      
      // Close modal and reset form
      setIsModalVisible(false);
      setEditingReel(null);
      setVideoPreview(null);
      form.resetFields();
      
      // Small delay to ensure backend has processed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force refresh the reels list with cache busting
      console.log('🔄 Refreshing reels list...');
      const refreshResult = await dispatch(fetchSellerReels({ _t: Date.now() }));
      console.log('✅ Reels refreshed:', refreshResult);
      console.log('📊 New reels data:', refreshResult.payload);
      
      // Force table re-render
      setTableKey(Date.now());
      
    } catch (error) {
      console.error('❌ Error submitting reel:', error);
      message.error(error.message || t('something.went.wrong'));
    }
  };

  const handleEdit = (reel) => {
    console.log('📝 Editing reel:', reel);
    console.log('📦 Available products:', products);
    setEditingReel(reel);
    setVideoPreview(reel.video_url);
    form.setFieldsValue({
      title: reel.title,
      description: reel.description,
      video_url: reel.video_url,
      product_id: reel.product_id,
      is_active: reel.is_active,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: t('are.you.sure'),
      content: t('delete.reel.confirmation'),
      onOk: async () => {
        try {
          console.log('🗑️ Deleting reel:', id);
          const result = await dispatch(deleteSellerReel(id));
          console.log('✅ Delete result:', result);
          
          if (result.error) {
            throw new Error(result.error.message || 'Delete failed');
          }
          
          message.success(t('reel.deleted.successfully'));
          
          // Small delay to ensure backend has processed
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Force refresh the reels list with cache busting
          console.log('🔄 Refreshing reels list...');
          const refreshResult = await dispatch(fetchSellerReels({ _t: Date.now() }));
          console.log('✅ Reels refreshed:', refreshResult);
          
          // Force table re-render
          setTableKey(Date.now());
        } catch (error) {
          console.error('❌ Error deleting reel:', error);
          message.error(error.message || t('something.went.wrong'));
        }
      },
    });
  };

  const handlePreview = (reel) => {
    setPreviewReel(reel);
    setPreviewVisible(true);
  };

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: t('product'),
      dataIndex: 'product',
      key: 'product',
      render: (product) => (
        <span className="text-gray-700">
          {product?.translation?.title || product?.name || 'No product'}
        </span>
      ),
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <span className="text-gray-600">
          {text?.length > 50 ? `${text.substring(0, 50)}...` : text}
        </span>
      ),
    },
    {
      title: t('video'),
      dataIndex: 'video_url',
      key: 'video_url',
      render: (url) => {
        if (!url) {
          return (
            <div style={{ width: 60, height: 60, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#999', fontSize: 10 }}>No Video</span>
            </div>
          );
        }
        
        const videoUrl = url.includes('http') ? url : `${IMG_URL}${url}`;
        
        return (
          <video 
            src={videoUrl}
            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, background: '#000' }}
            controls={false}
            preload="metadata"
            muted
            onError={(e) => {
              console.error('Video load error:', videoUrl, e);
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div style="width:60px;height:60px;background:#ffebee;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#f44336;">Error</div>';
            }}
          />
        );
      },
    },
    {
      title: t('status'),
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? t('active') : t('inactive')}
        </Tag>
      ),
    },
    {
      title: t('likes'),
      dataIndex: 'likes_count',
      key: 'likes_count',
      render: (count) => <span className="text-blue-600">{count || 0}</span>,
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          />
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('my.reels')}</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingReel(null);
            setVideoPreview(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          {t('add.reel')}
        </Button>
      </div>

      <Table
        key={tableKey}
        columns={columns}
        dataSource={Array.isArray(reels) ? reels : []}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      {/* Add/Edit Modal */}
      <Modal
        title={editingReel ? t('edit.reel') : t('add.reel')}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingReel(null);
          setVideoPreview(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
        afterOpenChange={() => {
          console.log('🎭 Modal opened');
          console.log('📦 Products available:', products);
          console.log('📝 Editing reel:', editingReel);
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label={t('title')}
                rules={[{ required: true, message: t('please.enter.title') }]}
              >
                <Input placeholder={t('enter.reel.title')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="product_id"
                label={t('product')}
                help="Optional: Link this reel to a specific product"
              >
                <Select
                  showSearch
                  allowClear
                  placeholder={t('select.product.optional')}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onSearch={(value) => setProductSearchValue(value)}
                >
                  {Array.isArray(products) && products.map((product) => (
                    <Option key={product.id} value={product.id}>
                      {product.name || product.translation?.title || 'No name'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label={t('description')}
              >
                <TextArea 
                  rows={3} 
                  placeholder={t('enter.reel.description')} 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
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
                  disabled={uploadingVideo}
                >
                  <Button 
                    icon={<UploadOutlined />}
                    loading={uploadingVideo}
                  >
                    {uploadingVideo ? 'Uploading...' : (videoPreview ? 'Change Video' : 'Upload MP4 Video')}
                  </Button>
                </Upload>
                {videoPreview && (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ marginBottom: 5, fontSize: 12, color: '#666' }}>Preview:</p>
                    <video
                      key={videoPreview}
                      width="100%"
                      height="auto"
                      controls
                      preload="auto"
                      style={{ borderRadius: 4, maxWidth: '400px', background: '#000' }}
                      onLoadedMetadata={(e) => {
                        console.log('✅ Video loaded successfully:', videoPreview);
                        console.log('Video duration:', e.target.duration, 'seconds');
                        console.log('Video dimensions:', e.target.videoWidth, 'x', e.target.videoHeight);
                      }}
                      onLoadedData={() => {
                        console.log('✅ Video data loaded');
                      }}
                      onCanPlay={() => {
                        console.log('✅ Video can play');
                      }}
                      onError={(e) => {
                        console.error('❌ Video load error:', videoPreview);
                        console.error('Error details:', e.target.error);
                        // Don't show error message immediately, video might still load
                      }}
                    >
                      <source src={videoPreview.includes('http') ? videoPreview : `${IMG_URL}${videoPreview}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <p style={{ marginTop: 5, fontSize: 11, color: '#999', wordBreak: 'break-all' }}>
                      URL: {videoPreview.includes('http') ? videoPreview : `${IMG_URL}${videoPreview}`}
                    </p>
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="is_active"
                label={t('status')}
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren={t('active')} 
                  unCheckedChildren={t('inactive')} 
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => {
              setIsModalVisible(false);
              setEditingReel(null);
              form.resetFields();
            }}>
              {t('cancel')}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingReel ? t('update') : t('create')}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={t('reel.preview')}
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={400}
      >
        {previewReel && (
          <div className="text-center">
            <h3 className="mb-2">{previewReel.title}</h3>
            {previewReel.description && (
              <p className="text-gray-600 mb-4">{previewReel.description}</p>
            )}
            {previewReel.video_url && (
              <video
                src={previewReel.video_url.includes('http') ? previewReel.video_url : `${IMG_URL}${previewReel.video_url}`}
                controls
                style={{ width: '100%', maxHeight: 400, borderRadius: 8 }}
              />
            )}
            <div className="mt-4 flex justify-between text-sm text-gray-500">
              <span>{t('likes')}: {previewReel.likes_count || 0}</span>
              <span>{t('status')}: {previewReel.is_active ? t('active') : t('inactive')}</span>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}